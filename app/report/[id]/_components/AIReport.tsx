//AI 피드백 전용 컴포넌트

'use client';

interface AIReportProps {
  category: string;
  summary: string;
  feedback: string;
}

export default function AIReport({ category, summary, feedback }: AIReportProps) {
  // ✨ AI 답변 정제기
  const cleanAIResponse = (text: string) => {
    if (!text) return '';
    return text
      .replace(/```json|```/gi, '')
      .replace(/^(summary|요약|feedback|조언|AI의\s*조언)\s*:\s*/gi, '')
      .replace(/["'{}]/g, '')
      .trim();
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 25px 0' }}>
        {category === '투자' ? '🧠 AI 마켓 인사이트 & 피드백' : '🧠 AI 마인드 리포트'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. 한줄 핵심 요약 */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #3b82f6' }}>
          <span style={{ color: '#2563eb', fontWeight: '800', fontSize: '14px' }}>한줄 핵심 요약</span>
          {/* 💡 whiteSpace: 'pre-wrap' 추가 */}
          <p style={{ margin: '10px 0 0 0', fontSize: '15px', color: '#1e3a8a', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {cleanAIResponse(summary)}
          </p>
        </div>
        
        {/* 2. AI의 심리 분석 및 조언 */}
        <div style={{ backgroundColor: category === '투자' ? '#fff7ed' : '#f0fdf4', padding: '20px', borderRadius: '16px', borderLeft: category === '투자' ? '5px solid #f97316' : '5px solid #22c55e' }}>
          <span style={{ color: category === '투자' ? '#c2410c' : '#15803d', fontWeight: '800', fontSize: '14px' }}>AI의 심리 분석 및 조언</span>
          {/* 💡여기에 whiteSpace: 'pre-wrap'이 있어야 줄바꿈이 정상 작동합니다! */}
          <p style={{ margin: '10px 0 0 0', fontSize: '15px', color: '#431407', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {cleanAIResponse(feedback)}
          </p>
        </div>

      </div>
    </div>
  );
}