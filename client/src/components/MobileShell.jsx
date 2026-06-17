import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

const MobileShell = ({ children, title = 'Fix-Connect' }) => {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-[390px] h-[800px] bg-slate-950 rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden transform transition duration-300 hover:scale-[1.01]">
      {/* Ear Speaker & Camera Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[28px] bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center space-x-1.5 border-b border-slate-800">
        <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ring-1 ring-slate-800"></div>
      </div>

      {/* Screen Frame */}
      <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden relative flex flex-col border border-slate-900">
        
        {/* Status Bar */}
        <div className="h-10 bg-slate-900 text-white flex items-center justify-between px-6 pt-3 select-none text-[12px] font-medium z-40">
          <div>{time}</div>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3.5 h-3.5 text-white/90" />
            <Wifi className="w-3.5 h-3.5 text-white/90" />
            <Battery className="w-4 h-4 text-white/90" />
          </div>
        </div>

        {/* Dynamic App Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-slate-50">
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="h-6 bg-white flex items-center justify-center pb-2 z-40">
          <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};

export default MobileShell;
