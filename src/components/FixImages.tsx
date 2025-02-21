import React from 'react';

const FixImages = () => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-20 transition-opacity duration-100`}
    >
      <img
        src="/images/live_member.png"
        alt="Live member"
        className="w-3/5 mb-4"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
      />
      <img
        src="/images/live_logo.png"
        alt="Live logo"
        className="w-2/5 mb-8"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))" }}
      />
    </div>
  );
};

export default FixImages;
