'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Play } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ ytCount: 0, shCount: 0, inProgress: 0, checkins: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
  if (typeof window === 'undefined') return;
  const savedUser = localStorage.getItem('cvkei_user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
    fetchDashboardData();
  }
}, []);

  async function fetchDashboardData() {
    // 1. Ambil jumlah konten minggu ini
    const { data: contents } = await supabase.from('content').select('*');
    if (contents) {
      setStats(prev => ({
        ...prev,
        ytCount: contents.filter(c => c.platform === 'youtube' && c.stage === 'uploaded').length,
        shCount: contents.filter(c => (c.platform === 'short' || c.platform === 'tiktok') && c.stage === 'uploaded').length,
        inProgress: contents.filter(c => c.stage !== 'uploaded').length
      }));
    }

    // 2. Ambil data metrik untuk grafik
    const { data: metrics } = await supabase
      .from('content_metrics')
      .select('views, fetched_at')
      .order('fetched_at', { ascending: true })
      .limit(7);
    
    if (metrics) {
      const formatted = metrics.map(m => ({
        name: new Date(m.fetched_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        views: m.views
      }));
      setChartData(formatted);
    }
  }

  if (!user) return null;

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Utama</h1>
            <p className="text-xs text-[#9E9A93] mt-1">Pantau performa konten & produktivitas tim</p>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] border border-[#2C2C2C] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-[#C8F55A] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{user.role} Aktif</span>
          </div>
        </header>

        {/* Statistik Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'YouTube Uploads', val: stats.ytCount, target: '/2', color: 'text-[#C8F55A]', icon: <Play size={14}/> },
            { label: 'Shorts/TT Uploads', val: stats.shCount, target: '/4', color: 'text-blue-400', icon: <TrendingUp size={14}/> },
            { label: 'In Progress', val: stats.inProgress, target: '', color: 'text-amber-500', icon: <AlertCircle size={14}/> },
            { label: 'Check-in Hari Ini', val: 0, target: '/7', color: 'text-teal-400', icon: <CheckCircle2 size={14}/> },
          ].map((s, i) => (
            <div key={i} className="bg-[#141414] border border-[#2C2C2C] p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] text-[#5A5751] uppercase font-bold tracking-widest">{s.label}</p>
                <span className={s.color}>{s.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.val}<span className="text-sm text-[#3A3835] font-medium">{s.target}</span></p>
            </div>
          ))}
        </div>

        {/* Grafik Performa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-[#9E9A93] mb-6 uppercase tracking-widest">Tren Views (7 Hari Terakhir)</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8F55A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C8F55A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" vertical={false} />
                  <XAxis dataKey="name" stroke="#3A3835" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#3A3835" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #2C2C2C', borderRadius: '8px' }}
                    itemStyle={{ color: '#C8F55A', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#C8F55A" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Follower Growth */}
          <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-[#9E9A93] mb-6 uppercase tracking-widest">Follower Growth</h2>
            <div className="space-y-6">
              {['YouTube', 'Instagram', 'TikTok'].map((plat) => (
                <div key={plat} className="flex justify-between items-end border-b border-[#1C1C1C] pb-4">
                  <div>
                    <p className="text-[10px] text-[#5A5751] font-bold uppercase mb-1">{plat}</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                  <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">+0%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}