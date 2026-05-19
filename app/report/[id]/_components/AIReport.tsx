// AI 피드백 전용 컴포넌트
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

  // 기존 데이터(요약과 피드백)가 둘 다 있으면 줄바꿈을 넣어서 하나로 합쳐줍니다.
  const displaySummary = cleanAIResponse(summary);
  const displayFeedback = cleanAIResponse(feedback);
  const combinedText = [displaySummary, displayFeedback].filter(Boolean).join('\n\n');

  return (
    // 🎨 [바깥 박스] 올 화이트 배경 + 큼직한 라운딩(32px) + 부드러운 미세 그림자
    <div className="w-full rounded-[32px] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9]">
      
      {/* 텍스트 타이틀 */}
      <h3 className="text-[18px] font-bold text-[#0f172a] mb-6 tracking-tight">
        {category === '투자' ? 'AI 마켓 인사이트' : 'AI 마인드 리포트'}
      </h3>
      
      {/* 🎨 [내부 박스] 스크린샷의 차분한 회색 배경색(#f4f6f8) 단일 박스로 통합 */}
      <div className="rounded-[20px] bg-[#f4f6f8] px-8 py-7">
        
        {/* 내부 고정 소제목 */}
        <span className="text-[14px] font-bold text-[#0f172a] mb-3 block">
          AI가 정리한 오늘의 마음 & 피드백
        </span>
        
        {/* 뭉쳐서 나오는 본문 영역 (줄바꿈 pre-wrap 완벽 보존) */}
        <p 
          className="text-[15px] leading-relaxed text-[#334155] font-medium mt-2"
          style={{ whiteSpace: 'pre-wrap' }} 
        >
          {combinedText || "---"}
        </p>
      </div>
    </div>
  );
}