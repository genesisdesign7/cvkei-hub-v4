'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const STAGE_SLA: Record<string, number> = {
  ideation: 3, research: 2, script: 3, shooting: 2, editing: 3, review: 1, scheduled: 1, uploaded: 0
};

const STAGES = ['ideation', 'research', 'script', 'shooting', 'editing', 'review', 'scheduled'];

export default function ReportPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    setLoading(true);
    const { data: cData } = await supabase.from('content').select('*');
    const { data: ciData } = await supabase.from('checkins').select('*');
    if (cData) setContents(cData);
    if (ciData) setCheckins(ciData);
    setLoading(false);
  }

  // Hitung jumlah konten yang stuck melewati SLA per stage
  const getStuckCount = (stage: string) => {
    return contents.filter(c => {
      if (c.stage !== stage) return false;
      const age = (new Date().getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return age > (STAGE_SLA[stage] || 3);
    }).length;
  };

  // Hitung task completion rate dari check-in
  const completedCheckins = checkins.filter(ci => ci.progress === 'completed').length;
  const completionRate = checkins.length > 0 ? Math.round((completedCheckins / checkins.length) * 100) : 0;

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F2EFE8]">
      <Sidebar />
      <main className="ml-[216px] flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8 tracking-tight">Productivity Insight</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* STAT CARD: COMPLETION RATE */}
          <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl border-t-2 border-t-[#C8F55A]">
            <p className="text-[10px] text-[#5A5751] uppercase font-bold tracking-widest mb-1">Task Completion Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#C8F55A]">{completionRate}%</span>
              <span className="text-xs text-[#5A5751]">minggu ini</span>
            </div>
            <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full mt-4">
              <div className="bg-[#C8F55A] h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>

          {/* STAT CARD: STUCK CONTENT */}
          <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl border-t-2 border-t-red-500">
            <p className="text-[10px] text-[#5A5751] uppercase font-bold tracking-widest mb-1">Konten Stuck (Over SLA)</p>
            <span className="text-4xl font-bold text-red-500">
              {STAGES.reduce((acc, s) => acc + getStuckCount(s), 0)}
            </span>
            <p className="text-xs text-[#5A5751] mt-2">Segera cek di Content Tracker</p>
          </div>
        </div>

        {/* DELAY PER STAGE ANALYSIS */}
        <div className="bg-[#141414] border border-[#2C2C2C] p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-[#9E9A93] mb-6 uppercase tracking-widest">Delay Analysis Per Stage</h2>
          <div className="space-y-6">
            {STAGES.map(stage => {
              const stuckCount = getStuckCount(stage);
              const totalInStage = contents.filter(c => c.stage === stage).length;
              const delayPct = totalInStage > 0 ? (stuckCount / totalInStage) * 100 : 0;

              return (
                <div key={stage} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-[#F2EFE8] font-medium">{stage} <span className="text-[#3A3835] ml-2">SLA: {STAGE_SLA[stage]}d</span></span>
                    <span className={stuckCount > 0 ? 'text-red-400 font-bold' : 'text-[#5A5751]'}>
                      {stuckCount}/{totalInStage} Delayed
                    </span>
                  </div>
                  <div className="w-full bg-[#1C1C1C] h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${stuckCount > 0 ? 'bg-red-500' : 'bg-[#2C2C2C]'}`} 
                      style={{ width: `${totalInStage > 0 ? 100 : 0}%` }}
                    >
                      <div className="bg-red-600 h-full transition-all" style={{ width: `${delayPct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}