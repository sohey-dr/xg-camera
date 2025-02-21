'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FilterCanvas } from './FilterCanvas';

const CAPTURE_OPTIONS = {
  width: 720,
  height: 1280,
  facingMode: { exact: "environment" }
};

const FILTERS = [
  { id: 'none', name: '標準' },
  { id: 'grayscale', name: 'モノクロ' },
  { id: 'sepia', name: 'セピア' },
  { id: 'blur', name: 'ぼかし' }
];

export function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserMedia = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleUserMediaError = () => {
    setIsLoading(false);
    setError('カメラへのアクセスが拒否されました。設定を確認してください。');
  };

  // Connect Webcam video element to our ref
  useEffect(() => {
    if (webcamRef.current) {
      videoRef.current = webcamRef.current.video;
    }
  }, [webcamRef.current]);

  const capture = useCallback(() => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply current filters to the captured image
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    switch (filter) {
      case 'grayscale':
        ctx.filter += ' grayscale(100%)';
        break;
      case 'sepia':
        ctx.filter += ' sepia(100%)';
        break;
      case 'blur':
        ctx.filter += ' blur(5px)';
        break;
    }

    ctx.drawImage(video, 0, 0);
    const imageSrc = canvas.toDataURL('image/jpeg');
    setImgSrc(imageSrc);
  }, [videoRef, filter, brightness, contrast]);

  const retake = () => {
    setImgSrc(null);
  };

  const download = () => {
    if (!imgSrc) return;
    
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = `capture-${new Date().toISOString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const share = async () => {
    if (!imgSrc || !navigator.share) return;

    try {
      const blob = await (await fetch(imgSrc)).blob();
      await navigator.share({
        files: [
          new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        ]
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto relative">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50 rounded-lg">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-center px-4">
            <p>カメラを起動中...</p>
            <p className="text-sm mt-2">カメラの使用を許可してください</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 rounded-lg">
          <div className="text-white text-center px-4">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black rounded-lg"
            >
              再試行
            </button>
          </div>
        </div>
      )}
      {!imgSrc ? (
        <>
          <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={CAPTURE_OPTIONS}
              className="absolute inset-0 w-full h-full object-cover"
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
            />
            <FilterCanvas
              videoRef={videoRef}
              filter={filter}
              brightness={brightness}
              contrast={contrast}
            />
          </div>
          <div className="w-full space-y-4 px-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 overflow-x-auto pb-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 bg-white/80 rounded-lg p-2">
                明るさ: {brightness}%
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700 bg-white/80 rounded-lg p-2">
                コントラスト: {contrast}%
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
          </div>
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-800 shadow-lg"
            aria-label="Take photo"
          />
        </>
      ) : (
        <>
          <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
            <img
              src={imgSrc}
              alt="Captured photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={retake}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              撮り直し
            </button>
            <button
              onClick={download}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              保存
            </button>
            {'share' in navigator && (
              <button
                onClick={share}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                共有
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
