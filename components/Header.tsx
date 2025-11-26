
import React, { useState } from 'react';
import { Platform, User } from '../types';
import { FileSpreadsheet, Zap, Settings, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  platform: Platform;
  onTogglePlatform: () => void;
  user: User | null;
  onUpgrade: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  platform, 
  onTogglePlatform, 
  user,
  onUpgrade,
  onOpenSettings,
  onLogout
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Plan Display Helper
  const getPlanBadge = () => {
    if (!user) return null;
    switch(user.plan) {
      case 'pro': return <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-2">PRO</span>;
      case 'team': return <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">TEAM</span>;
      case 'enterprise': return <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded ml-2">ENT</span>;
      default: return <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-2">FREE</span>;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg shadow-sm transition-colors ${platform === 'Excel' ? 'bg-excel-600' : 'bg-sheets-500'}`}>
            <FileSpreadsheet size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
            {platform === 'Excel' ? 'Excel' : 'Sheets'}<span className={`${platform === 'Excel' ? 'text-excel-600' : 'text-sheets-500'}`}>Wizard</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Platform Toggler */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center text-xs font-medium hidden md:flex">
             <button 
               onClick={() => platform !== 'Excel' && onTogglePlatform()}
               className={`px-3 py-1.5 rounded-md transition-all ${platform === 'Excel' ? 'bg-white text-excel-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Excel
             </button>
             <button 
               onClick={() => platform !== 'Google Sheets' && onTogglePlatform()}
               className={`px-3 py-1.5 rounded-md transition-all ${platform === 'Google Sheets' ? 'bg-white text-sheets-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Sheets
             </button>
          </div>

          {/* User Profile / Upgrade */}
          {user && (
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 relative">
               
               {user.plan === 'free' && (
                 <button 
                   onClick={onUpgrade}
                   className="hidden sm:flex text-sm font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-sm items-center space-x-1"
                 >
                   <Zap size={14} fill="currentColor" /><span>Upgrade</span>
                 </button>
               )}

               <div className="relative">
                 <button 
                   onClick={() => setMenuOpen(!menuOpen)}
                   className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                 >
                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-300">
                     {user.name.charAt(0).toUpperCase()}
                   </div>
                   <ChevronDown size={14} className="text-gray-400" />
                 </button>

                 {menuOpen && (
                   <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
                     <div className="p-4 border-b border-gray-100">
                       <p className="font-bold text-gray-900 truncate">{user.name}</p>
                       <div className="flex items-center mt-1">
                         <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.email}</p>
                         {getPlanBadge()}
                       </div>
                     </div>
                     <button onClick={() => { onOpenSettings(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <Settings size={16} /> Team Settings
                     </button>
                     <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                       <LogOut size={16} /> Sign Out
                     </button>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
