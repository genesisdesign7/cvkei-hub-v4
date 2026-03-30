'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

// 8 Level Stage sesuai Arsitektur
const STAGES = ['ideation', 'research', 'script', 'shooting', 'editing', 'review', 'scheduled', 'uploaded'];

export default function TrackerPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('youtube');
  const [newOwner, setNewOwner] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: contentData } = await supabase.from('content').select('*').order('created_at', { ascending: false });
    const { data: userData } = await supabase.from('users').select('id, name');
    if (contentData) setContents(contentData);
    if (userData) setUsers(userData);
    setLoading(false);
  }

  // Fungsi Update Stage
  const handleUpdateStage = async (id: string, newStage: string) => {
    const { error } = await supabase
      .from('content')
      .update({ 
        stage: newStage, 
        updated_at: new Date().toISOString() // Penting untuk deteksi STUCK/SLA
      })
      .eq('id', id);

    if (!error) fetchData();
  };

  const handleAddContent = async () => {
    if (!newTitle || !newOwner) return alert('Isi judul dan PIC dulu!');
    const { error } = await supabase.from('content').insert([{ title: newTitle, platform: newPlatform, owner_id: newOwner, stage: 'ideation' }]);
    if (!error) { setShowModal(false); setNewTitle(''); fetchData(); }
  };

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Content Tracker</h1>
          <button onClick={() => setShowModal(true)} className="bg-[#C8F55A] text-[#0A0A0A] px-4 py-2 rounded-lg font-bold text-sm">+ Tambah Konten</button>
        </header>

        <div className="space-y-3">
          {contents.map((item) => (
            <div key={item.id} className="bg-[#141414] border border-[#2C2C2C] p-4 rounded-xl flex justify-between items-center group hover:border-[#383838] transition-all">
              <div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-[10px] text-[#5A5751] uppercase mt-1">{item.platform}</p>
              </div>
              
              {/* Dropdown Ganti Stage */}
              <select 
                value={item.stage}
                onChange={(e) => handleUpdateStage(item.id, e.target.value)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded bg-[#1C1C1C] border border-[#2C2C2C] uppercase cursor-pointer outline-none focus:border-[#C8F55A] ${
                  item.stage === 'uploaded' ? 'text-green-500' : 'text-[#C8F55A]'
                }`}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Modal Tambah Konten */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Tambah Konten Baru</h2>
              <div className="space-y-4">
                <input className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-2.5 text-sm outline-none focus:border-[#C8F55A]" placeholder="Judul Konten" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <select className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-2.5 text-sm outline-none focus:border-[#C8F55A]" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                  <option value="youtube">YouTube</option><option value="short">Shorts</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option>
                </select>
                <select className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-2.5 text-sm outline-none focus:border-[#C8F55A]" value={newOwner} onChange={(e) => setNewOwner(e.target.value)}>
                  <option value="">Pilih PIC...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div className="flex gap-3 mt-6"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-[#2C2C2C] rounded-lg text-sm font-bold">Batal</button>
                <button onClick={handleAddContent} className="flex-1 px-4 py-2 bg-[#C8F55A] text-[#0A0A0A] rounded-lg text-sm font-bold">Simpan</button></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}