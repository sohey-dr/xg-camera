"use client";

import { useEffect, useState } from 'react';

export function ARQuickLook() {
  const [deviceType, setDeviceType] = useState<'apple' | 'android' | 'other'>('other');

  useEffect(() => {
    // デバイスタイプを判定
    if (/iPhone|iPad|iPod|Mac/.test(navigator.userAgent)) {
      setDeviceType('apple');
    } else if (/Android/.test(navigator.userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('other');
    }
  }, []);

  if (deviceType === 'other') {
    return (
      <div className="flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl mb-4">このデバイスではARを利用できません</h2>
        <p>スマートフォンまたはタブレットでご利用ください。</p>
      </div>
    );
  }

  const arLink = deviceType === 'apple' 
    ? {
        rel: "ar",
        href: "/wolf_animation_howl.usdz"
      }
    : {
        href: `intent://arvr.google.com/scene-viewer/1.0?file=/wolf_animation_howl.glb&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`
      };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <a
        {...arLink}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col items-center space-y-4 hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">AR体験を開始</h2>
          <p className="text-sm opacity-80">タップして🐺を表示</p>
        </div>
      </a>
    </div>
  );
}
