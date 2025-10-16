"use client";

import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-screen bg-dark/90 z-50">
      <span className="loader"></span>
    </div>
  );
};

export default Loading;
