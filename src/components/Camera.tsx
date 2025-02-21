"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";

const MEMBERS = [
  { id: "jurin", name: "JURIN", image: "/images/member/jurin.png" },
  { id: "chisa", name: "CHISA", image: "/images/member/chisa.png" },
  { id: "harvey", name: "HARVEY", image: "/images/member/harvey.png" },
  { id: "hinata", name: "HINATA", image: "/images/member/hinata.png" },
  { id: "juria", name: "JURIA", image: "/images/member/juria.png" },
  { id: "maya", name: "MAYA", image: "/images/member/maya.png" },
  { id: "cocona", name: "COCONA", image: "/images/member/cocona.png" },
];

const CAMERA_CONSTRAINTS = {
  width: { min: 320, ideal: 720, max: 1280 },
  height: { min: 240, ideal: 1280, max: 1920 },
  facingMode: { ideal: "environment" },
  aspectRatio: { ideal: 9 / 16 },
};

export function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberPosition, setMemberPosition] = useState({ x: 16, y: 112 });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // カメラの準備が完了したら状態を更新
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraReady(true);
      } catch (err) {
        console.error("Camera check failed:", err);
        setError("カメラの初期化に失敗しました。");
      }
    };

    checkCamera();
  }, []);

  const handleUserMedia = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setIsLoading(false);
    if (
      error === "Permission denied" ||
      (error instanceof DOMException && error.name === "NotAllowedError")
    ) {
      setError(
        "カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可してください。"
      );
    } else if (
      error === "Requested device not found" ||
      (error instanceof DOMException && error.name === "NotFoundError")
    ) {
      setError(
        "カメラが見つかりませんでした。デバイスにカメラが接続されているか確認してください。"
      );
    } else if (
      error instanceof DOMException &&
      error.name === "NotReadableError"
    ) {
      setError(
        "カメラにアクセスできません。他のアプリがカメラを使用している可能性があります。"
      );
    } else {
      setError(`カメラの起動に失敗しました: ${error}`);
    }
  };

  const capture = useCallback(() => {
    const webcam = webcamRef.current;
    if (!webcam) return;

    // キャプチャ画像を取得
    const imageSrc = webcam.getScreenshot();
    if (!imageSrc) return;

    // メンバー画像を合成
    if (selectedMember) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // キャプチャ画像をキャンバスに描画
        const captureImg = new Image();
        captureImg.onload = () => {
          canvas.width = captureImg.width;
          canvas.height = captureImg.height;
          ctx?.drawImage(captureImg, 0, 0);

          // メンバー画像のアスペクト比を維持しながら配置（サイズを20%に）
          const maxWidth = canvas.width * 0.2;
          const maxHeight = canvas.height * 0.2;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          const memberWidth = img.width * scale;
          const memberHeight = img.height * scale;
          // プレビューと同じ位置に配置
          const containerRect =
            webcamRef.current?.video?.parentElement?.getBoundingClientRect();
          if (containerRect) {
            const scaleX = canvas.width / containerRect.width;
            const scaleY = canvas.height / containerRect.height;
            const x =
              containerRect.width - memberPosition.x - memberWidth / scaleX;
            const y =
              containerRect.height - memberPosition.y - memberHeight / scaleY;

            ctx?.drawImage(
              img,
              x * scaleX,
              y * scaleY,
              memberWidth,
              memberHeight
            );
          }

          // 合成した画像を保存
          setImgSrc(canvas.toDataURL("image/jpeg"));
        };
        captureImg.src = imageSrc;
      };
      img.src = MEMBERS.find((m) => m.id === selectedMember)?.image || "";
    } else {
      setImgSrc(imageSrc);
    }
  }, [webcamRef, selectedMember, memberPosition]);

  const retake = () => {
    setImgSrc(null);
  };

  const download = () => {
    if (!imgSrc) return;

    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `xg-camera-${new Date().toISOString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const share = async () => {
    if (!imgSrc || !navigator.share) return;

    try {
      const blob = await (await fetch(imgSrc)).blob();
      await navigator.share({
        files: [new File([blob], "xg-camera.jpg", { type: "image/jpeg" })],
      });
    } catch (error) {
      console.error("Error sharing:", error);
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
            {isCameraReady && (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={CAMERA_CONSTRAINTS}
                className="absolute inset-0 w-full h-full object-cover"
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
              />
            )}
            {selectedMember && (
              <div
                className="absolute w-1/5 h-1/5 flex items-center justify-center cursor-move"
                style={{
                  bottom: `${memberPosition.y}px`,
                  right: `${memberPosition.x}px`,
                }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    const rect =
                      e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      const x = rect.right - e.clientX;
                      const y = rect.bottom - e.clientY;
                      // 下端の制限を設定（最低位置を150pxに）
                      setMemberPosition({
                        x: Math.max(0, x),
                        y: Math.max(150, y),
                      });
                    }
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => {
                  setIsDragging(true);
                }}
                onTouchMove={(e) => {
                  if (isDragging && e.touches[0]) {
                    const rect =
                      e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      const x = rect.right - e.touches[0].clientX;
                      const y = rect.bottom - e.touches[0].clientY;
                      // タッチ操作でも同じ制限を適用
                      setMemberPosition({
                        x: Math.max(0, x),
                        y: Math.max(150, y),
                      });
                    }
                  }
                }}
                onTouchEnd={() => setIsDragging(false)}
              >
                <img
                  src={MEMBERS.find((m) => m.id === selectedMember)?.image}
                  alt="Selected member"
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
                />
              </div>
            )}
            <button
              onClick={capture}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-gray-800 shadow-lg"
              aria-label="Take photo"
            />
          </div>
          <div className="w-full px-4">
            <div className="grid grid-cols-4 gap-2">
              {MEMBERS.map((member) => (
                <button
                  key={member.id}
                  onClick={() =>
                    setSelectedMember(
                      member.id === selectedMember ? null : member.id
                    )
                  }
                  className={`p-1 rounded-lg ${
                    member.id === selectedMember
                      ? "bg-blue-500 ring-2 ring-blue-300"
                      : "bg-gray-200"
                  }`}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>
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
            {"share" in navigator && (
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
