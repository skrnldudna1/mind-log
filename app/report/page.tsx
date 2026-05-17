// app/report/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

interface DiaryItem {
  id: number;
  created_at: string;
  content: string;
  summary: string;
  feedback: string;
}

export default function ReportPage() {
  const [diaries, setDiaries] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
        alert('리포트를 불러오지 못했어요.');
      } else if (data) {
        setDiaries(data);
      }
      setLoading(false);
    };

    fetchDiaries();
  }, []);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '60px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <main style={{ maxWidth: '760px', margin: '0 auto' }}>
        
        {/* 상단 헤더 영역 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111214', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              📊 마음 아카이브
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666f7a' }}>그동안 차곡차곡 쌓인 수희님의 감정 기록들이에요</p>
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#4f46e5', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
            ✏️ 새 일기 쓰기
          </Link>
        </div>

        {/* 로딩 및 빈 상태 UI */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#666f7a', fontSize: '16px' }}>🔮 과거의 기억 조각들을 불러오는 중...</div>
        ) : diaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0 0 16px 0' }}>아직 기록된 마음이 없습니다.</p>
            <Link href="/" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>첫 번째 감정 기록하러 가기 ➡️</Link>
          </div>
        ) : (
          /* 일기 피드 리스트 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {diaries.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)', border: '1px solid #f1f5f9' }}>
                
                {/* 세련된 날짜 뱃지 */}
                <div style={{ display: 'inline-block', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px', marginBottom: '18px' }}>
                  📅 {new Date(item.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* 작성한 일기 원문 내용 */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ margin: 0, color: '#334155', fontSize: '16px', lineHeight: '1.7', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    {item.content}
                  </p>
                </div>

                {/* AI 분석 결과 섹션 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>📝 AI 요약</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>{item.summary}</p>
                  </div>
                  <div style={{ borderLeft: '1px dashed #e2e8f0', paddingLeft: '20px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>🌸 마음 위로</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.feedback}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}