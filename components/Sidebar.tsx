'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem('cvkei_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cvkei_user');
    router.push('/login');
  };

  if (!user) return null;

  // Cek apakah user adalah Admin (Vanessa) untuk menu spesial
  const isAdmin = user.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '◈' },
    { name: 'Daily Check-in', path: '/checkin', icon: '◉' },
    { name: 'Content Calendar', path: '/calendar', icon: '◰' },
    { name: 'Content Tracker', path: '/tracker', icon: '◫' },
    { name: 'Reports', path: '/report', icon: '◑' },
    { name: 'My Performance', path: '/performance', icon: '◐' },
  ];

  return (
    <aside className="w-[216px] h-screen bg-[#141414] border-r border-[#2C2C2C] flex flex-col fixed left-0 top-0">
      <div className="p-5 border-b border-[#2C2C2C]">
        <div className="text-[#C8F55A] font-bold text-xl tracking-tighter">CV KEI</div>
        <div className="text-[11px] text-[#5A5751] mt-1">{user.name} {isAdmin && '· Admin'}</div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="text-[9px] text-[#3A3835] uppercase tracking-widest px-5 mb-2 font-bold">Utama</div>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-all border-l-2 ${
              pathname === item.path ? 'text-[#C8F55A] border-[#C8F55A] bg-[#C8F55A]/5' : 'text-[#5A5751] border-transparent hover:text-[#F2EFE8] hover:bg-[#1C1C1C]'
            }`}>
              <span className="w-4 text-center">{item.icon}</span>
              {item.name}
            </div>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="text-[9px] text-[#3A3835] uppercase tracking-widest px-5 mt-6 mb-2 font-bold">Eksekutif</div>
            <Link href="/brand-deals">
              <div className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-[#5A5751] hover:text-[#F2EFE8] border-l-2 border-transparent hover:bg-[#1C1C1C]">
                <span className="w-4 text-center">◎</span>Brand Deals
              </div>
            </Link>
            <Link href="/admin">
              <div className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-[#5A5751] hover:text-[#F2EFE8] border-l-2 border-transparent hover:bg-[#1C1C1C]">
                <span className="w-4 text-center">⊕</span>Admin Panel
              </div>
            </Link>
          </>
        )}
      </div>

      <div className="p-5 border-t border-[#2C2C2C]">
        <button 
          onClick={handleLogout}
          className="text-xs text-[#5A5751] hover:text-[#F2EFE8] transition-colors"
        >
          ← Logout
        </button>
      </div>
    </aside>
  );
}