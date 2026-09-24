import React, { useState } from 'react';
import { AETRA_LOGO_BASE64 } from '../assets/logoBase64';

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
  const [srcIndex, setSrcIndex] = useState(0);

  // List of fallback sources in order of preference
  const sources = [
    AETRA_LOGO_BASE64,
    '/aetra-logo.png',
    '/Logo-Aetra-Air-Tangerang_Small.jpg',
    '/Logo-Aetra-Air-Tangerang_Small.png',
    '/aetra-logo.jpg'
  ];

  const heightClass = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24'
  }[size];

  const handleImgError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    }
  };

  const imgElement = (
    <img
      src={sources[srcIndex]}
      alt="PT Aetra Air Tangerang"
      className={`${heightClass} w-auto object-contain select-none transition-all`}
      onError={handleImgError}
      loading="eager"
      decoding="sync"
    />
  );

  if (withContainer) {
    return (
      <div className={`inline-flex items-center justify-center p-2.5 sm:p-3 bg-white rounded-2xl shadow-md border border-slate-100 ${className}`}>
        {imgElement}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {imgElement}
    </div>
  );
};
