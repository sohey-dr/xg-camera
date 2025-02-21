"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Camera } from "react-camera-pro";

const MEMBERS = [
  { id: "jurin", name: "JURIN", image: "/images/member/jurin.png" },
  { id: "chisa", name: "CHISA", image: "/images/member/chisa.png" },
  { id: "harvey", name: "HARVEY", image: "/images/member/harvey.png" },
  { id: "hinata", name: "HINATA", image: "/images/member/hinata.png" },
  { id: "juria", name: "JURIA", image: "/images/member/juria.png" },
  { id: "maya", name: "MAYA", image: "/images/member/maya.png" },
  { id: "cocona", name: "COCONA", image: "/images/member/cocona.png" },
];

export function CameraComponent() {
  const cameraRef = useRef<any>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Camera will automatically initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const capture = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    // キャプチャ画像を取得
    const imageSrc = camera.takePhoto();
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

          // メンバー画像のアスペクト比を維持しながら配置（サイズを25%に）
          const maxWidth = canvas.width * 0.25;
          const maxHeight = canvas.height * 0.25;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          const memberWidth = img.width * scale;
          const memberHeight = img.height * scale;

          // 画像を右側中央に配置
          const x = canvas.width - memberWidth - canvas.width * 0.05; // 右端から5%の位置
          const y = (canvas.height - memberHeight) / 2; // 垂直方向の中央

          ctx?.drawImage(img, x, y, memberWidth, memberHeight);

          // 合成した画像を保存
          setImgSrc(canvas.toDataURL("image/png"));
        };
        captureImg.src = imageSrc;
      };
      img.src = MEMBERS.find((m) => m.id === selectedMember)?.image || "";
    } else {
      setImgSrc(imageSrc);
    }
  }, [selectedMember]);

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
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Camera
                ref={cameraRef}
                numberOfCamerasCallback={(i: number) => {}}
                facingMode="environment"
                aspectRatio={9/16}
                errorMessages={{
                  noCameraAccessible: "カメラにアクセスできません",
                  permissionDenied: "カメラへのアクセスが拒否されました",
                  switchCamera: "カメラを切り替えられません",
                  canvas: "キャンバスがサポートされていません",
                }}
              />
            </div>
            {selectedMember && (
              <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-1/4 flex items-center justify-center">
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
              className="px-4 py-2 bg-gray-600 text-white rounded-lg"
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
