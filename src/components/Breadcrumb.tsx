import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  currentPage: string;
  subtitle?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage, subtitle }) => {
  return (
    <div className="pt-16 sm:pt-20 px-3 sm:px-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3.5 rounded-xl bg-[#231e22]/75 backdrop-blur-md border border-[#56433b]/35">
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs tracking-wider uppercase">
          <Link
            to="/"
            className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs sm:text-sm">home</span>
            <span>Beranda</span>
          </Link>
          <span className="text-[#56433b]">/</span>
          <span className="text-[#ffbb28] font-bold">{currentPage}</span>
        </div>
        {subtitle && (
          <div className="font-mono text-[10px] text-[#ddc0b3]/80">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb;
