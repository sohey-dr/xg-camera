"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Camera } from "react-camera-pro";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRedo, faShare } from "@fortawesome/free-solid-svg-icons";

export function CameraComponent() {
  const cameraRef = useRef<any>(null);
  const captureContainerRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const capture = useCallback(async () => {
    const camera = cameraRef.current;
    const container = captureContainerRef.current;
    if (!camera || !container) return;

    try {
      // setIsCapturing(true);

      const imageSrc = camera.takePhoto();
      if (!imageSrc) {
        throw new Error("Failed to capture photo");
      }

      setCapturedImage(imageSrc);

      await new Promise(resolve => setTimeout(resolve, 100));

      // html2canvasでキャプチャ
      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: window.devicePixelRatio || 1,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      });

      // 最高品質で保存
      const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
      setImgSrc(dataUrl);

    } catch (err) {
      console.error("Capture error:", err);
      setError("写真の撮影に失敗しました");
    } finally {
      setCapturedImage(null);
    }
  }, []);

  const retake = () => {
    setImgSrc(null);
    setError(null);
  };

  const download = () => {
    if (!imgSrc) return;

    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `xg-camera-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const share = async () => {
    if (!imgSrc || !navigator.share) return;

    try {
      const blob = await (await fetch(imgSrc)).blob();
      await navigator.share({
        files: [new File([blob], "xg-camera.png", { type: "image/png" })],
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-center px-4">
            <p>カメラを起動中...</p>
            <p className="text-sm mt-2">カメラの使用を許可してください</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
          <div className="relative w-full h-full bg-black overflow-hidden">
            <div className="absolute inset-0">
              <Camera
                ref={cameraRef}
                numberOfCamerasCallback={(i: number) => {}}
                facingMode="environment"
                aspectRatio="cover"
                errorMessages={{
                  noCameraAccessible: "カメラにアクセスできません",
                  permissionDenied: "カメラへのアクセスが拒否されました",
                  switchCamera: "カメラを切り替えられません",
                  canvas: "キャンバスがサポートされていません",
                }}
              />
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-20 transition-opacity duration-100`}
            >
              <img
                src="/images/live_member.png"
                alt="Live member"
                className="w-4/5 mb-4"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
              />
              <img
                src="/images/live_logo.png"
                alt="Live logo"
                className="w-3/5 mb-8"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
              />
            </div>
            <button
              onClick={capture}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-gray-800 shadow-lg"
              aria-label="Take photo"
            />
          </div>
          {/* キャプチャ用のコンテナ */}
          <div
            ref={captureContainerRef}
            className="fixed left-0 top-0 w-screen h-screen pointer-events-none"
            style={{
              visibility: capturedImage ? "visible" : "hidden",
              position: "fixed",
              zIndex: -1,
            }}
          >
            <div className="relative w-full h-full">
              {capturedImage && (
                <>
                  <img
                    src={capturedImage}
                    alt="Capture"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-20 transition-opacity duration-100`}
                  >
                    <img
                      src="/images/live_member.png"
                      alt="Live member"
                      className="w-4/5 mb-4"
                      style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
                    />
                    <img
                      src="/images/live_logo.png"
                      alt="Live logo"
                      className="w-3/5 mb-8"
                      style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative w-full h-full bg-black overflow-hidden">
            <img
              src={imgSrc}
              alt="Captured photo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
            <button
              onClick={retake}
              className="flex flex-col items-center px-6 py-3 rounded-lg bg-gray-800 text-white"
            >
              <FontAwesomeIcon icon={faRedo} className="text-2xl mb-1" />
              <span className="text-sm">撮り直し</span>
            </button>
            <button
              onClick={download}
              className="flex flex-col items-center px-6 py-3 rounded-lg bg-gray-800 text-white"
            >
              <FontAwesomeIcon icon={faDownload} className="text-2xl mb-1" />
              <span className="text-sm">保存</span>
            </button>
            {"share" in navigator && (
              <button
                onClick={share}
                className="flex flex-col items-center px-6 py-3 rounded-lg bg-gray-800 text-white"
              >
                <FontAwesomeIcon icon={faShare} className="text-2xl mb-1" />
                <span className="text-sm">シェア</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
