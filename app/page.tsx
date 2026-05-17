// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [diary, setDiary] = useState('');
  const [result, setResult] = useState<{ summary: string; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!diary.trim()) {
      alert('오늘의 이야기를 조금이라도 적어주세요.');
      return;
    }

    setLoading(false);
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '60px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* 상단 헤더 영역 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111214', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              🧠 MindLog
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666f7a' }}>Gemini AI가 내 마음을 맑게 정리해 드려요</p>
          </div>
          <Link href="/report" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff', color: '#4f46e5', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
            📊 감성 리포트 ➡️
          </Link>
        </div>

        {/* 일기 작성 카드 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', marginBottom: '30px' }}>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            오늘 하루는 어떠셨나요? 😉
          </label>
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="아무에게도 하지 못한 말이나 오늘 있었던 일을 편하게 털어놓으세요..."
            style={{ width: '100%', height: '200px', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '16px', lineHeight: '1.6', color: '#334155', resize: 'none', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ width: '100%', backgroundColor: loading ? '#93c5fd' : '#4f46e5', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', transition: 'background-color 0.2s' }}
          >
            {loading ? '✨ 대답을 생각하는 중...' : '🔮 내 마음 분석 요청하기'}
          </button>
        </div>

        {/* AI 분석 결과창 (매끄러운 애니메이션 스타일) */}
        {result && (
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              🧠 MindLog AI 분석 레포트
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #dbeafe' }}>
                <span style={{ display: 'block', color: '#1d4ed8', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>📝 오늘의 핵심 요약</span>
                <p style={{ margin: 0, fontSize: '15px', color: '#1e40af', lineHeight: '1.6' }}>{result.summary}</p>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #dcfce7' }}>
                <span style={{ display: 'block', color: '#15803d', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>🌸 당신을 위한 마음 테라피</span>
                <p style={{ margin: 0, fontSize: '15px', color: '#166534', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{result.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}