"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faVrCardboard } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <main className="h-[100dvh] w-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          XG Camera
        </h1>

        <div className="grid grid-cols-1 gap-8 w-full max-w-md">
          <Link
            href="/camera"
            className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 hover:bg-gray-700/80 transition-all duration-300 border border-gray-600"
          >
            <div className="bg-gray-700 p-4 rounded-full">
              <FontAwesomeIcon
                icon={faCamera}
                className="text-white text-2xl"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">カメラ</h2>
              <p className="text-white/80 text-sm">
                XGメンバーと一緒に写真を撮ろう📸
              </p>
            </div>
          </Link>

          <Link
            href="/ar"
            className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 hover:bg-gray-700/80 transition-all duration-300 border border-gray-600"
          >
            <div className="bg-gray-700 p-4 rounded-full">
              <FontAwesomeIcon
                icon={faVrCardboard}
                className="text-white text-2xl"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AR体験</h2>
              <p className="text-white/80 text-sm">
                ARでHOWLの世界を体験しよう🐺
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
