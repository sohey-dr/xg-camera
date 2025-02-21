'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FilterCanvas } from './FilterCanvas';

const INITIAL_CONSTRAINTS = {
  width: { min: 320, ideal: 720, max: 1280 },
  height: { min: 240, ideal: 1280, max: 1920 },
  facingMode: "environment"
};

const FALLBACK_CONSTRAINTS = {
  width: { min: 320, ideal: 720, max: 1280 },
  height: { min: 240, ideal: 1280, max: 1920 },
  facingMode: "user"
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

  const [videoConstraints, setVideoConstraints] = useState(INITIAL_CONSTRAINTS);
  const [retryCount, setRetryCount] = useState(0);

  // カメラデバイスの列挙と初期化
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices);

        if (videoDevices.length === 0) {
          setError('カメラが見つかりませんでした。デバイスにカメラが接続されているか確認してください。');
          setIsLoading(false);
          return;
        }

        // デフォルトでバックカメラを試す
        setVideoConstraints(INITIAL_CONSTRAINTS);
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
        setError('カメラの初期化に失敗しました。ブラウザの設定を確認してください。');
        setIsLoading(false);
      }
    };

    initializeCamera();
  }, []);

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      if (retryCount === 0) {
        // 最初のリトライ: フロントカメラを試す
        console.log('Trying front camera...');
        setVideoConstraints(FALLBACK_CONSTRAINTS);
      } else {
        // 2回目のリトライ: 制約を最小限にする
        console.log('Trying minimal constraints...');
        setVideoConstraints({
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: "user"
        });
      }
      return;
    }

    setIsLoading(false);
    if (error === 'Permission denied' || (error instanceof DOMException && error.name === 'NotAllowedError')) {
      setError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可してください。');
    } else if (error === 'Requested device not found' || (error instanceof DOMException && error.name === 'NotFoundError')) {
      setError('カメラが見つかりませんでした。デバイスにカメラが接続されているか確認してください。');
    } else if (error instanceof DOMException && error.name === 'NotReadableError') {
      setError('カメラにアクセスできません。他のアプリがカメラを使用している可能性があります。');
    } else if (error instanceof DOMException && error.name === 'OverconstrainedError') {
      setError('お使いのカメラではサポートされていない設定です。');
    } else {
      setError(`カメラの起動に失敗しました: ${error}`);
    }
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
              videoConstraints={videoConstraints}
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
