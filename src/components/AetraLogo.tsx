import React, { useState } from 'react';

interface AetraLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withContainer?: boolean;
}

export const AetraLogo: React.FC<AetraLogoProps> = ({
  className = '',
  size = 'md',
  withContainer = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  // Otomatis membaca file foto JPG yang Anda upload atau file cadangan lainnya
  const imageCandidates = [
    '/Logo-Aetra-Air-Tangerang_Small.jpg',
    '/aetra-logo.png',
    '/aetra-logo.jpg',
    '/logo.png',
    '/logo.jpg'
  ];

  const heightClass = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24'
  }[size];

  const handleImageError = () => {
    if (imgIndex < imageCandidates.length - 1) {
      setImgIndex(imgIndex + 1);
    } else {
      setHasError(true);
    }
  };

  const logoImage = !hasError ? (
    <img
      src={imageCandidates[imgIndex]}
      alt="PT Aetra Air Tangerang"
      className={`${heightClass} w-auto object-contain select-none`}
      onError={handleImageError}
      loading="eager"
    />
  ) : (
    <div className={`flex items-center gap-2 font-black ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <svg className={`${heightClass} w-auto`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C45 25, 30 40, 30 60 C30 75, 40 85, 50 85 C60 85, 70 75, 70 60 C70 40, 55 25, 50 10 Z" fill="#00539C" />
        <path d="M50 25 C47 35, 38 45, 38 58 C38 68, 44 74, 50 74 C56 74, 62 68, 62 58 C62 45, 53 35, 50 25 Z" fill="#FFFFFF" />
        <path d="M22 65 C20 48, 32 30, 42 22 C32 32, 26 48, 30 65 C33 78, 42 85, 50 88 C38 88, 24 80, 22 65 Z" fill="#E85D04" />
        <path d="M78 65 C80 48, 68 30, 58 22 C68 32, 74 48, 70 65 C67 78, 58 85, 50 88 C62 88, 76 80, 78 65 Z" fill="#E85D04" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="text-[#00539C] font-black tracking-tighter">aetra</span>
        <span className="text-[#00539C] text-[9px] tracking-widest font-medium">tangerang</span>
      </div>
    </div>
  );

  if (withContainer) {
    return (
      <div className={`inline-flex items-center justify-center p-2.5 sm:p-3 bg-white rounded-2xl shadow-md border border-slate-100 ${className}`}>
        {logoImage}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {logoImage}
    </div>
  );
};
