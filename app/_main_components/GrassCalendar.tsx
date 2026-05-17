// 잔디 캘린더
// app/_main_components/GrassCalendar.tsx
'use client';

interface GrassCalendarProps {
  diaries?: any[];
}

export default function GrassCalendar({ diaries = [] }: GrassCalendarProps) {
  // 최근 12주(84일) 데이터 생성하기
  const totalDays = 84;
  const blocks = Array.from({ length: totalDays }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (totalDays - 1 - i));
    const dateStr = date.toISOString().split('T')[0];

    // 해당 날짜의 기록 찾기
    const dayRecords = diaries.filter(d => d.created_at?.startsWith(dateStr));
    
    // 기본 잔디 색상 설정 (기록 없으면 연한 회색)
    let color = '#f1f5f9'; 
    let title = `${dateStr} : 기록 없음`;

    if (dayRecords.length > 0) {
      const mainCategory = dayRecords[0].category;
      title = `${dateStr} : ${dayRecords.length}개의 기록 (${mainCategory})`;
      if (mainCategory === '투자') color = '#fed7aa';      // 연한 주황
      else if (mainCategory === '일상') color = '#bfdbfe'; // 연한 파랑
      else if (mainCategory === '아이디어') color = '#e9d5ff'; // 연한 보라
      else color = '#bbf7d0'; // 기록 등 기타 연한 초록
    }

    return { dateStr, color, title };
  });

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px',
      border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>🌿 내 생각이 쌓이는 시간</h3>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>최근 12주</span>
      </div>

      {/* 잔디밭 Grid 구역 (7행 가로 정렬) */}
      <div style={{ 
        display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, 1fr)', 
        gap: '5px', overflowX: 'auto', paddingBottom: '8px' 
      }}>
        {blocks.map((block, idx) => (
          <div key={idx} title={block.title} style={{
            width: '12px', height: '12px', backgroundColor: block.color, 
            borderRadius: '3px', transition: 'transform 0.1s'
          }} />
        ))}
      </div>

      {/* 캘린더 범례(Legend) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}/> 비었음</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#bfdbfe', borderRadius: '2px' }}/> 일상</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#fed7aa', borderRadius: '2px' }}/> 투자</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#e9d5ff', borderRadius: '2px' }}/> 아이디어</div>
      </div>
    </div>
  );
}