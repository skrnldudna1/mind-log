//보기 모드 (투자/일반) 전용 컴포넌트

// app/report/[id]/_components/DiaryViewer.tsx
'use client';

interface DiaryViewerProps {
  diary: any;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DiaryViewer({ diary, onEdit, onDelete }: DiaryViewerProps) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
        <span style={{ fontWeight: '700' }}>내가 남긴 기록 복기</span>
        <span>{new Date(diary.created_at).toLocaleDateString()}</span>
      </div>

      {diary.category === '투자' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. 종목 */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>1. 투자 종목명</h4>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{diary.ticker || '미지정'}</p>
          </div>
          
          {/* 2. 포지션 결정 */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>2. 포지션 결정</h4>
            <span style={{ 
              display: 'inline-block', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
              backgroundColor: diary.action === '매수' ? '#fee2e2' : diary.action === '매도' ? '#dcfce7' : '#f1f5f9',
              color: diary.action === '매수' ? '#dc2626' : diary.action === '매도' ? '#166534' : '#475569',
            }}>
              {diary.action === '매수' ? '🟢 ' : diary.action === '매도' ? '🔴 ' : diary.action === '관망' ? '👀 ' : '🔥 '}{diary.action}
            </span>
          </div>

          {/* 3. 진입 당시 심리 */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>3. 진입 당시 심리</h4>
            <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
              {diary.emotion === '확신' ? '😎 ' : diary.emotion === '불안/초조' ? '😨 ' : diary.emotion === 'FOMO (소외감)' ? '🚀 ' : '🧘 '}{diary.emotion}
            </span>
          </div>

          {/* 4. 자유 복기 */}
          <div style={{ marginTop: '5px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>4. 자유 판단 기록 (이유와 반성)</h4>
            
            {/* <p> 태그를 <div>로 바꾸고 아래 속성을 추가합니다 */}
            <div 
              style={{ fontSize: '16px', color: '#1e293b', lineHeight: '1.8', margin: 0 }}
              dangerouslySetInnerHTML={{ __html: diary.content }} 
            />
          </div>
        </div>
      ) : (
        /* 일반 일기용 보기 출력 */
        <div 
            style={{ fontSize: '16px', color: '#1e293b', lineHeight: '1.8', margin: 0 }}
            dangerouslySetInnerHTML={{ __html: diary.content }} 
          />
      )}

      {/* 하단 관리 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '24px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>수정</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>삭제</button>
      </div>
    </>
  );
}