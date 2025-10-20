
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Podcast Scheduler Pro
        </h1>
        <p className="text-sm text-slate-500">Your intelligent podcast booking assistant</p>
      </div>
    </header>
  );
};

export default Header;
