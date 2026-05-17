// 최근 기록 리스트

// app/_main_components/RecentCards.tsx
'use client';

import Link from 'next/link';

interface RecentCardsProps {
  diaries?: any[];
}

export default function RecentCards({ diaries = [] }: RecentCardsProps) {
  const recentList = diaries.slice(0, 5); // 최근 5개만 컷

  const getBadgeStyle = (category: string) => {
    if (category === '투자') return { bg: '#fff7ed', text: '#ea580c' };
    if (category === '일상') return { bg: '#eff6ff', text: '#2563eb' };
    if (category === '아이디어') return { bg: '#fdf4ff', text: '#9333ea' };
    return { bg: '#f0fdf4', text: '#16a34a' };
  };

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px',
      border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>🗂️ 최근 기록 복기</h3>
        <Link href="/report" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}>전체보기 →</Link>
      </div>

      {recentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>최근 작성된 기록 리포트가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentList.map((item) => {
            const badge = getBadgeStyle(item.category);
            return (
              <Link key={item.id} href={`/report/${item.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9',
                  backgroundColor: '#fff', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '80%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                        {item.category}
                      </span>
                      {item.category === '투자' && item.ticker && (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{item.ticker}</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.content}
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}