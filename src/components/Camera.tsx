"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Camera } from "react-camera-pro";

export function CameraComponent() {
  const cameraRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoRef = useRef<HTMLImageElement>(new Image());
  const memberRef = useRef<HTMLImageElement>(new Image());
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // プリロードキャンバスの初期化
    canvasRef.current = document.createElement("canvas");

    // ロゴと画像のプリロード
    logoRef.current.src = "/images/live_logo.png";
    memberRef.current.src = "/images/live_member.png";

    // Camera will automatically initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const capture = useCallback(() => {
    const camera = cameraRef.current;
    const overlay = overlayRef.current;
    if (!camera || !overlay) return;

    // 撮影時に一時的にオーバーレイを非表示
    setIsCapturing(true);

    // 少し待ってから撮影（オーバーレイが非表示になるのを待つ）
    setTimeout(() => {
      // キャプチャ画像を取得
      const imageSrc = camera.takePhoto();
      if (!imageSrc) {
        setIsCapturing(false);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setIsCapturing(false);
        return;
      }

      const captureImg = new Image();
      captureImg.onload = () => {
        // デバイスのピクセル比を考慮してキャンバスサイズを設定
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = captureImg.width * pixelRatio;
        canvas.height = captureImg.height * pixelRatio;
        
        // キャンバスのスケーリングとスムージングを設定
        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // キャプチャ画像を描画（整数座標で最適化）
        ctx.drawImage(
          captureImg,
          0, 0,
          Math.floor(captureImg.width),
          Math.floor(captureImg.height)
        );

        // オーバーレイ画像を描画（高解像度対応）
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = Math.floor(20 * pixelRatio);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // メンバー画像を描画（整数座標で最適化）
        const memberWidth = Math.floor(captureImg.width * 0.8); // プレビューと同じ80%
        const memberHeight = Math.floor((memberWidth / memberRef.current.width) * memberRef.current.height);
        const memberX = Math.floor((captureImg.width - memberWidth) / 2);
        const memberY = Math.floor(captureImg.height - memberHeight - (captureImg.height * 0.2)); // 下から20%の位置

        // メンバー画像を一度だけ描画（座標を整数に）
        ctx.drawImage(
          memberRef.current,
          0, 0,
          Math.floor(memberRef.current.width),
          Math.floor(memberRef.current.height),
          memberX, memberY,
          memberWidth, memberHeight
        );

        // ロゴ画像を描画（整数座標で最適化）
        const logoWidth = Math.floor(captureImg.width * 0.6); // プレビューと同じ60%
        const logoHeight = Math.floor((logoWidth / logoRef.current.width) * logoRef.current.height);
        const logoX = Math.floor((captureImg.width - logoWidth) / 2);
        const logoY = Math.floor(captureImg.height - logoHeight - (captureImg.height * 0.05)); // 下から5%の位置

        // ロゴ画像を一度だけ描画（座標を整数に）
        ctx.drawImage(
          logoRef.current,
          0, 0,
          Math.floor(logoRef.current.width),
          Math.floor(logoRef.current.height),
          logoX, logoY,
          logoWidth, logoHeight
        );

        ctx.restore();

        // 最高品質で保存
        setImgSrc(canvas.toDataURL("image/png", 1.0));
        setIsCapturing(false);
      };
      captureImg.src = imageSrc;
    }, 100);
  }, []);

  const retake = () => {
    setImgSrc(null);
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
              ref={overlayRef}
              className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-20 transition-opacity duration-100 ${isCapturing ? 'opacity-0' : 'opacity-100'}`}
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
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg text-lg"
            >
              撮り直し
            </button>
            <button
              onClick={download}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
            >
              保存
            </button>
            {"share" in navigator && (
              <button
                onClick={share}
                className="px-6 py-3 bg-green-500 text-white rounded-lg text-lg"
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
