'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const TASK_TYPES = ['Research', 'Scripting', 'Shooting', 'Editing', 'Upload', 'Meeting', 'Other'];

export default function CheckinPage() {
  const [user, setUser] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [progress, setProgress] = useState('ongoing');
  const [blocker, setBlocker] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('cvkei_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchTodayCheckins();
  }, []);

  async function fetchTodayCheckins() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('checkins')
      .select('*, users(name)') // Join dengan tabel users untuk ambil nama
      .eq('check_date', today)
      .order('created_at', { ascending: false });
    
    if (data) setCheckins(data);
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = async () => {
    if (!description) return alert('Isi task hari ini dulu!');

    const { error } = await supabase.from('checkins').insert([{
      user_id: user.id,
      check_date: new Date().toISOString().split('T')[0],
      tasks: selectedTypes, // Simpan array tipe task ke kolom JSONB
      description: description,
      progress: progress,
      blocker: blocker,
      attachment_link: link
    }]);

    if (!error) {
      setDescription('');
      setSelectedTypes([]);
      setBlocker('');
      setLink('');
      fetchTodayCheckins();
    }
  };

  if (!user) return null;

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Daily Check-in</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORM CHECK-IN */}
          <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl h-fit">
            <h2 className="text-sm font-bold text-[#C8F55A] mb-6 uppercase tracking-wider">Form Check-in</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-2 text-widest">Tipe Task</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map(t => (
                    <button 
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        selectedTypes.includes(t) ? 'bg-[#C8F55A] text-[#0A0A0A] border-[#C8F55A]' : 'border-[#2C2C2C] text-[#5A5751]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-1">Apa yang lo kerjain hari ini?</label>
                <textarea 
                  className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-3 text-sm outline-none focus:border-[#C8F55A] min-h-[80px]"
                  placeholder="Contoh: Beresin script video Gen Z..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-1">Status</label>
                  <select 
                    className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-2.5 text-sm outline-none focus:border-[#C8F55A]"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                  >
                    <option value="ongoing">⏳ Ongoing</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-1">Link (Opsional)</label>
                  <input className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-2.5 text-sm outline-none focus:border-[#C8F55A]" placeholder="Link G-Drive/Asset" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-red-500/70 uppercase font-bold mb-1 text-widest">Blocker (Kendala)</label>
                <input className="w-full bg-[#1C1C1C] border border-red-500/20 rounded-lg p-2.5 text-sm outline-none focus:border-red-500/50" placeholder="Kosongin kalau aman" value={blocker} onChange={(e) => setBlocker(e.target.value)} />
              </div>

              <button onClick={handleSubmit} className="w-full bg-[#C8F55A] text-[#0A0A0A] font-bold py-3 rounded-xl mt-4 hover:bg-[#9DC43A] transition-all">Submit Check-in ↗</button>
            </div>
          </div>

          {/* LOG CHECK-IN HARI INI */}
          <div>
            <h2 className="text-xs font-bold text-[#5A5751] mb-4 uppercase tracking-widest">Feed Hari Ini</h2>
            <div className="space-y-3">
              {checkins.map((ci) => (
                <div key={ci.id} className="bg-[#141414] border border-[#2C2C2C] p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-[#C8F55A]">{ci.users?.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${ci.progress === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {ci.progress}
                    </span>
                  </div>
                  <p className="text-sm text-[#F2EFE8] leading-relaxed">{ci.description}</p>
                  {ci.blocker && <p className="text-[11px] text-red-400 mt-2 bg-red-400/5 p-2 rounded border border-red-400/10">⚠ Blocker: {ci.blocker}</p>}
                </div>
              ))}
              {checkins.length === 0 && <p className="text-center py-10 text-[#3A3835] text-sm italic">Belum ada tim yang absen hari ini.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}