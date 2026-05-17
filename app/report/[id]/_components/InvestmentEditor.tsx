// 투자 수정 폼 전용 컴포넌트

'use client';

interface InvestmentEditorProps {
  ticker: string;
  setTicker: (val: string) => void;
  action: string;
  setAction: (val: string) => void;
  emotion: string;
  setEmotion: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
}

export default function InvestmentEditor({
  ticker, setTicker, action, setAction, emotion, setEmotion, content, setContent
}: InvestmentEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>📈 투자 일지 내용 수정하기</h3>

      {/* 1. 종목명 */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>1. 투자 종목명</label>
        <input 
          type="text" value={ticker} onChange={(e) => setTicker(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* 2. 포지션 결정 */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>2. 포지션 결정</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['매수', '매도', '관망', '불타기/물타기'].map((act) => {
            const isAct = action === act;
            return (
              <button key={act} onClick={() => setAction(act)} style={{
                flex: 1, padding: '12px 0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                border: isAct ? '2px solid #ef4444' : '1px solid #e2e8f0',
                backgroundColor: isAct ? '#fef2f2' : '#fff', color: isAct ? '#ef4444' : '#64748b'
              }}>
                {act}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 진입 당시 심리 */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>3. 진입 당시 심리</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['확신', '불안/초조', 'FOMO (소외감)', '평온'].map((emo) => {
            const isEmo = emotion === emo;
            return (
              <button key={emo} onClick={() => setEmotion(emo)} style={{
                padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                border: isEmo ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                backgroundColor: isEmo ? '#fffbeb' : '#fff', color: isEmo ? '#b45309' : '#64748b'
              }}>
                {emo}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 자유 복기 기록 */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>4. 자유 판단 기록 (이유와 반성)</label>
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', height: '150px', padding: '16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', lineHeight: '1.6', resize: 'none', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>
    </div>
  );
}