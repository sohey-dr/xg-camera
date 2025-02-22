"use client";

import { useEffect, useState } from 'react';

export default function ARPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-[100dvh] w-screen bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-center px-4">
            <p>カメラを起動中...</p>
            <p className="text-sm mt-2">カメラの使用を許可してください</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-white">
          <h1 className="text-2xl mb-4">AR機能</h1>
          <p>Coming Soon...</p>
        </div>
      )}
    </main>
  );
}
