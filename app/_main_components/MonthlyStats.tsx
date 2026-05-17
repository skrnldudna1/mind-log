// 월간 미니 대시보드

// app/_main_components/MonthlyStats.tsx
'use client';

interface MonthlyStatsProps {
  diaries?: any[];
}

export default function MonthlyStats({ diaries = [] }: MonthlyStatsProps) {
  const totalCount = diaries.length;

  // 통계 계산
  const categoryCounts = diaries.reduce((acc: any, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + 1;
    return acc;
  }, {});

  let topCategory = '미지정';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, cnt]: any) => {
    if (cnt > topCategoryCount) {
      topCategory = cat;
      topCategoryCount = cnt;
    }
  });

  const emotionCounts = diaries.reduce((acc: any, cur) => {
    if (cur.emotion) acc[cur.emotion] = (acc[cur.emotion] || 0) + 1;
    return acc;
  }, {});

  let topEmotion = '평온';
  let topEmotionCount = 0;
  Object.entries(emotionCounts).forEach(([emo, cnt]: any) => {
    if (cnt > topEmotionCount) {
      topEmotion = emo;
      topEmotionCount = cnt;
    }
  });

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px',
      border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>📊 5월 흐름 요약</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {/* 누적 기록 수 */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>기록 횟수</span>
          <p style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{totalCount}<span style={{ fontSize: '13px', fontWeight: '500' }}>회</span></p>
        </div>

        {/* 최다 테마 */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>가장 자주 찾은 테마</span>
          <p style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: '800', color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {totalCount > 0 ? `${topCategory} (${topCategoryCount}회)` : '-'}
          </p>
        </div>

        {/* 주요 심리 */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>주요 마음 톤</span>
          <p style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: '800', color: '#ea580c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {totalCount > 0 ? topEmotion : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}