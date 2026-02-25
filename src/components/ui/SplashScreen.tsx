import React from 'react';

interface SplashScreenProps {
  show: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ show }) => {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-700 ease-out ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      <img src="/logo.png" alt="AI-Uncode Logo" className="w-32 h-32 mb-4" />
      <h1 className="text-3xl font-bold text-white">الرياضي الذكي</h1>
    </div>
  );
};

export default SplashScreen;
