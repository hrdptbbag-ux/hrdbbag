import React from 'react';
import { View } from '../types';
import { APP_CONFIG } from '../config';

interface HeaderProps {
  isLoggedIn: boolean;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  logoUrl: string | null;
  view: View;
  isOnline: boolean;
  dbError: boolean;
}

const MiningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const StatusIndicator: React.FC<{ isOnline: boolean; dbError: boolean }> = ({ isOnline, dbError }) => {
    const internetStatus = {
        online: isOnline,
        text: isOnline ? 'Terhubung' : 'Terputus',
        color: isOnline ? 'bg-green-500' : 'bg-red-500',
    };
    const dbStatus = {
        online: !dbError,
        text: !dbError ? 'Berhasil' : 'Gagal',
        color: !dbError ? 'bg-green-500' : 'bg-red-500',
    };

    return (
        <div className="flex items-center space-x-3 ml-6">
            <div className="group relative flex items-center space-x-1.5" title={`Koneksi Internet: ${internetStatus.text}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${internetStatus.color} transition-colors`}></div>
                <span className="text-xs text-slate-400 hidden xl:inline">Internet</span>
            </div>
             <div className="group relative flex items-center space-x-1.5" title={`Koneksi Database: ${dbStatus.text}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${dbStatus.color} transition-colors`}></div>
                <span className="text-xs text-slate-400 hidden xl:inline">Database</span>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ isLoggedIn, onNavigate, onLogout, logoUrl, view, isOnline, dbError }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => onNavigate('OPERATIONAL_DASHBOARD')} className="flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg pr-4">
               {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-9 w-auto mr-3 object-contain" />
              ) : (
                <MiningIcon />
              )}
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                {APP_CONFIG.APP_NAME}
              </h1>
            </button>
            <div className="hidden md:block border-l border-slate-600 h-8 ml-4"></div>
            <nav className="hidden md:flex items-center space-x-2 ml-6">
              <button
                onClick={() => onNavigate('OPERATIONAL_DASHBOARD')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'OPERATIONAL_DASHBOARD' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
                aria-current={view === 'OPERATIONAL_DASHBOARD' ? 'page' : undefined}
              >
                Operasional
              </button>
              <button
                onClick={() => onNavigate('EMPLOYEE_DASHBOARD')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'EMPLOYEE_DASHBOARD' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
                 aria-current={view === 'EMPLOYEE_DASHBOARD' ? 'page' : undefined}
              >
                Karyawan
              </button>
            </nav>
            <div className="hidden lg:flex">
              <StatusIndicator isOnline={isOnline} dbError={dbError} />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm md:text-base font-semibold text-slate-300 hidden sm:block">
                {APP_CONFIG.COMPANY_NAME}
            </div>
            {isLoggedIn ? (
                 <button 
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                    aria-label="Logout"
                >
                    Logout
                </button>
            ) : (
                <button 
                    onClick={() => onNavigate('LOGIN')}
                    className="p-2 rounded-full hover:bg-slate-700 transition duration-300"
                    aria-label="Admin Login"
                >
                    <UserIcon />
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
