'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Ambil daftar nama tim dari Supabase
  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('users').select('id, name, pin_hash');
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleLogin = () => {
    const user = users.find((u) => u.name === selectedUser);
    
    // Cek apakah PIN benar (sesuai kolom pin_hash di database)
    if (user && user.pin_hash === pin) {
      // Simpan data login sementara di browser
      localStorage.setItem('cvkei_user', JSON.stringify(user));
      router.push('/dashboard'); // Pindah ke dashboard jika sukses
    } else {
      setError('PIN salah atau nama belum dipilih!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#F2EFE8] font-sans">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-5xl font-extrabold text-[#C8F55A] tracking-tighter mb-2">CV KEI</h1>
        <p className="text-xs text-[#5A5751] uppercase tracking-widest mb-10">Team Hub v4</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-2">Pilih Nama</label>
            <select 
              className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-3 text-sm outline-none focus:border-[#C8F55A]"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Pilih anggota...</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[#5A5751] uppercase font-bold mb-2">PIN</label>
            <input 
              type="password" 
              maxLength={4}
              className="w-full bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-3 text-center text-xl tracking-[10px] outline-none focus:border-[#C8F55A]"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-[#C8F55A] text-[#0A0A0A] font-bold py-3 rounded-lg hover:bg-[#9DC43A] transition-all"
          >
            Masuk →
          </button>
          
          {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}