"use client";

import { useEffect, useState } from 'react';

export function ARQuickLook() {
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    // Apple デバイスかどうかを確認
    const isApple = /iPhone|iPad|iPod|Mac/.test(navigator.userAgent);
    setIsAppleDevice(isApple);
  }, []);

  if (!isAppleDevice) {
    return (
      <div className="flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl mb-4">このデバイスではARを利用できません</h2>
        <p>Apple製デバイス（iPhone、iPad）でご利用ください。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <a
        rel="ar"
        href="/wolf_animation_howl.usdz"
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col items-center space-y-4 hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">AR体験を開始</h2>
          <p className="text-sm opacity-80">タップしてARモデルを表示</p>
        </div>
      </a>
    </div>
  );
}
