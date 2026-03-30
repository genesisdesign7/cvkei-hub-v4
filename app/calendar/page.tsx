'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

// Mapping warna sesuai desain v4 lo
const TYPE_COLORS: Record<string, string> = {
  yt: 'bg-blue-500/20 text-blue-400',
  sh: 'bg-orange-500/20 text-orange-400',
  bank: 'bg-purple-500/20 text-purple-400',
  live: 'bg-green-500/20 text-green-400',
  meet: 'bg-teal-500/20 text-teal-400',
  launch: 'bg-yellow-500/20 text-yellow-400',
  overseas: 'bg-lime-500/10 text-lime-500 border border-lime-500/20',
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    // Ambil data tugas kalender dari Supabase
    const { data } = await supabase.from('calendar_tasks').select('*');
    if (data) setTasks(data);
  }

  // Logika generate grid kalender sederhana
  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Offset untuk memulai hari Senin (sesuai index.html)
    const offset = (firstDay + 6) % 7;

    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-[#2C2C2C]/30 bg-transparent"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.task_date === dateStr);

      days.push(
        <div key={d} className="h-32 border border-[#2C2C2C] bg-[#141414] p-2 hover:bg-[#1C1C1C] transition-all overflow-y-auto">
          <span className="text-[10px] font-bold text-[#5A5751] mb-2 block">{d}</span>
          <div className="space-y-1">
            {dayTasks.map(t => (
              <div key={t.id} className={`text-[9px] px-2 py-0.5 rounded font-bold truncate ${TYPE_COLORS[t.type] || 'bg-[#2C2C2C] text-[#5A5751]'}`}>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-xs text-[#9E9A93] mt-1">Jadwal Publish, Shoot, dan Banking</p>
          </div>
        </header>

        {/* Legend Warna */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${color.split(' ')[0]}`}></div>
              <span className="text-[10px] uppercase font-bold text-[#5A5751] tracking-wider">{type}</span>
            </div>
          ))}
        </div>

        {/* Grid Kalender */}
        <div className="grid grid-cols-7 border-l border-t border-[#2C2C2C] rounded-xl overflow-hidden">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
            <div key={day} className="p-3 text-center text-[10px] font-bold text-[#5A5751] border-r border-b border-[#2C2C2C] uppercase bg-[#141414]">
              {day}
            </div>
          ))}
          {renderDays()}
        </div>
      </main>
    </div>
  );
}