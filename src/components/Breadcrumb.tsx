import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  currentPage: string;
  subtitle?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage, subtitle }) => {
  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-[#231e22]/80 border border-[#56433b]/30">
        <div className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
          <Link
            to="/"
            className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Beranda</span>
          </Link>
          <span className="text-[#56433b]">/</span>
          <span className="text-[#ffbb28] font-bold">{currentPage}</span>
        </div>
        {subtitle && (
          <div className="font-mono text-[11px] text-[#ddc0b3]/80">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb;
