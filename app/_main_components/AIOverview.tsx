// 최근 흐름
'use client';

import { useEffect, useState } from 'react';

interface AIOverviewProps {
  diaries?: any[];
}

export default function AIOverview({ diaries = [] }: AIOverviewProps) {
  const [aiMessage, setAiMessage] = useState('최근 생각 흐름을 분석하고 있어요... 🧠');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 분석할 기록이 아예 없으면 API 요청 없이 빠른 기본 멘트 처리
    if (diaries.length === 0) {
      setAiMessage('아직 분석할 기록이 부족해요. 편안한 마음으로 첫 글을 남겨주세요. 🧭');
      return;
    }

    const fetchAiSummary = async () => {
      try {
        setLoading(true);
        // 최근 글 최대 7개까지만 컷해서 AI에게 요약 요청 (할당량 및 문맥 최적화)
        const recentDiaries = diaries.slice(0, 7);

        const res = await fetch('/api/main-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diaries: recentDiaries }),
        });
        
        const data = await res.json();
        if (data && data.summary) {
          setAiMessage(data.summary);
        }
      } catch (err) {
        console.error('AI 흐름 분석 요청 실패:', err);
        setAiMessage('생각 흐름을 정리하는 중에 잠시 연결이 고르지 못했어요. ☕');
      } finally {
        setLoading(false);
      }
    };

    fetchAiSummary();
  }, [diaries]); // diaries 데이터가 갱신될 때마다 실시간으로 동기화됨

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px',
      border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>🧠 AI가 본 최근 흐름</h3>
      <p style={{
        margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.7', fontWeight: '500',
        backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #6366f1',
        opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s'
      }} dangerouslySetInnerHTML={{ __html: aiMessage }} />
    </div>
  );
}