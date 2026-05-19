// app/report/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ['전체', '일상', '투자', '기록', '아이디어'];

export default function ReportPage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // 🔥 필터링 및 월간 요약 상태
  const [selectedTab, setSelectedTab] = useState('전체');
  const [monthlyReport, setMonthlyReport] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error) setDiaries(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🔗 월간 총정리 리포트 요청 함수
  const generateMonthlySummary = async () => {
    if (diaries.length === 0) return alert('분석할 기록이 없습니다.');
    
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          diaries: diaries, 
          nickname: user?.user_metadata?.nickname || '회원' 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyReport(data.report);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('요약 중 에러가 발생했습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // 🔥 탭 선택에 따른 필터링 로직
  const filteredDiaries = selectedTab === '전체' 
    ? diaries 
    : diaries.filter(d => d.category === selectedTab);

  if (loading) return <div style={{ padding: '20px' }}>로딩 중...</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          
          {/* 🦙 알파카 이미지 추가 */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/images/로그.png" 
            alt="MindLog Mascot" 
            style={{ width: '320px', height: '140px', objectFit: 'contain' }} 
          />
        </Link>
        
          <Link href="/" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>← 기록하러 가기</Link>
        </div>

        {/* 🌟 월간 총정리 섹션 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>🗓️ 이번 달 마음 총정리</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>한 달 동안 쌓인 모든 기록을 분석하여<br/>AI가 특별한 통합 레포트를 작성해 드립니다.</p>
          
          {monthlyReport ? (
            <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '16px', textAlign: 'left', border: '1px solid #dcfce7', whiteSpace: 'pre-wrap', fontSize: '15px', color: '#166534', lineHeight: '1.7' }}>
              {monthlyReport}
            </div>
          ) : (
            <button 
              onClick={generateMonthlySummary} 
              disabled={isSummarizing}
              style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
            >
              {isSummarizing ? '✨ AI가 기억을 모으는 중...' : '🔮 월간 총정리 리포트 발행하기'}
            </button>
          )}
        </div>

        {/* 🏷️ 카테고리 필터 탭 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedTab(cat)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: selectedTab === cat ? '#4f46e5' : '#fff',
                color: selectedTab === cat ? '#fff' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 📜 기록 리스트 */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
  {filteredDiaries.length === 0 ? (
    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>해당 카테고리에 기록된 내용이 없습니다. 🌸</p>
  ) : (
    filteredDiaries.map((item) => (
      <Link 
        key={item.id} 
        href={`/report/${item.id}`} // 🔥 클릭 시 동적 상세 페이지로 이동!
        style={{ 
          textDecoration: 'none', 
          display: 'block', 
          backgroundColor: '#fff', 
          borderRadius: '20px', 
          padding: '24px', 
          border: '1px solid #f1f5f9',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        // 마우스 올렸을 때 살짝 뜨는 이펙트 (선택사항)
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ backgroundColor: '#eff6ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
            {item.category || '일상'}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
        <p style={{ fontSize: '16px', color: '#1e293b', lineHeight: '1.6', margin: '0 0 16px 0', fontWeight: '600' }}>
          {item.content}
        </p>
        <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '16px' }}>
          <p style={{ fontSize: '14px', color: '#475569', margin: '0' }}>
            <strong style={{ color: '#4f46e5' }}>AI 요약:</strong> {item.summary}
          </p>
        </div>
      </Link>
    ))
  )}
</div>
      </main>
    </div>
  );
}