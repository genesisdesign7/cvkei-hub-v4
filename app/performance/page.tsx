'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function PerformancePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalTasks: 0, completed: 0 });
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cvkei_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchPerformanceData(parsedUser.id);
    }
  }, []);

  async function fetchPerformanceData(userId: string) {
    // Ambil data check-in user
    const { data: checkinData } = await supabase.from('checkins').select('*').eq('user_id', userId);
    // Ambil feedback untuk user
    const { data: fbData } = await supabase.from('feedback').select('*').eq('target_user_id', userId).order('created_at', { ascending: false });

    if (checkinData) {
      setStats({
        totalTasks: checkinData.length,
        completed: checkinData.filter((ci: any) => ci.progress === 'completed').length
      });
    }
    if (fbData) setFeedbacks(fbData);
  }

  if (!user) return null;

  const rate = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">My Performance</h1>
        <p className="text-xs text-[#5A5751] uppercase mb-8 tracking-widest">Data pribadi • Hanya lo & Admin yang bisa lihat</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl">
            <p className="text-[10px] text-[#5A5751] uppercase font-bold mb-1">Task Completion</p>
            <p className="text-3xl font-bold text-[#C8F55A]">{rate}%</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-[#9E9A93] mb-4 uppercase tracking-widest">Feedback & Catatan</h2>
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb.id} className="border-l-2 border-[#C8F55A] bg-[#1C1C1C] p-4 rounded-r-lg">
                <p className="text-sm italic">"{fb.text}"</p>
                <p className="text-[10px] text-[#5A5751] mt-2 uppercase">Dari: Admin • {new Date(fb.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {feedbacks.length === 0 && <p className="text-xs text-[#3A3835] italic">Belum ada feedback masuk.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}