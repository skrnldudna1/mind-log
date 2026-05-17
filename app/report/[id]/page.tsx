// app/report/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// 📦 새로 만든 배달원 컴포넌트들 호출
import DiaryViewer from './_components/DiaryViewer';
import InvestmentEditor from './_components/InvestmentEditor';
import GeneralEditor from './_components/GeneralEditor';
import AIReport from './_components/AIReport';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DiaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 수정 전용 상태 변수들
  const [isEditing, setIsEditing] = useState(false);
  const [editTicker, setEditTicker] = useState('');
  const [editAction, setEditAction] = useState('');
  const [editEmotion, setEditEmotion] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('diaries').select('*').eq('id', id).single();
      if (!error && data) {
        setDiary(data);
        setEditTicker(data.ticker || '');
        setEditAction(data.action || '');
        setEditEmotion(data.emotion || '');
        setEditContent(data.content || '');
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('diaries').delete().eq('id', id);
    if (!error) { alert('삭제 완료! 🗑️'); router.push('/report'); }
  };

  const handleUpdate = async () => {
    if (diary.category === '투자') {
      if (!editTicker.trim()) return alert('투자 종목을 입력해 주세요.');
      if (!editAction) return alert('포지션 결정을 선택해 주세요.');
      if (!editEmotion) return alert('진입 당시 심리를 선택해 주세요.');
    }
    if (!editContent.trim()) return alert('내용을 입력해 주세요.');
    
    setIsUpdating(true);
    try {
      const updatedContext = diary.category === '투자' 
        ? `[투자 분석 요청]\n- 종목: ${editTicker}\n- 매매 행동: ${editAction}\n- 투자 심리 상태: ${editEmotion}\n\n[투자 복기 본문]\n"${editContent}"`
        : editContent;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary: updatedContext, category: diary.category }),
      });
      const aiData = await res.json();

      const { error } = await supabase
        .from('diaries')
        .update({
          ticker: diary.category === '투자' ? editTicker.trim() : null,
          action: diary.category === '투자' ? editAction : null,
          emotion: diary.category === '투자' ? editEmotion : null,
          content: editContent,
          summary: aiData.summary,
          feedback: aiData.feedback,
        })
        .eq('id', id);

      if (!error) {
        alert('리포트 수정 완료! ✨');
        setDiary({ ...diary, ticker: editTicker, action: editAction, emotion: editEmotion, content: editContent, summary: aiData.summary, feedback: aiData.feedback });
        setIsEditing(false);
      }
    } catch (err) { alert('수정 오류 발생'); } finally { setIsUpdating(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>데이터 로드 중... 🔮</div>;
  if (!diary) return <div style={{ textAlign: 'center', padding: '100px' }}>기록이 없습니다.</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* 상단바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ backgroundColor: diary.category === '투자' ? '#0f172a' : '#eff6ff', color: diary.category === '투자' ? '#fff' : '#4f46e5', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800' }}>
            {diary.category === '투자' ? '📈 INVESTMENT REPORT' : `${diary.category.toUpperCase()} REPORT`}
          </span>
          <Link href="/report" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>← 리포트 목록</Link>
        </div>

        {/* 📝 원문 카드 (조회/수정 모드에 따라 컴포넌트 동적 교체) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          {!isEditing ? (
            <DiaryViewer diary={diary} onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
          ) : (
            <div>
              {diary.category === '투자' ? (
                <InvestmentEditor ticker={editTicker} setTicker={setEditTicker} action={editAction} setAction={setEditAction} emotion={editEmotion} setEmotion={setEditEmotion} content={editContent} setContent={setEditContent} />
              ) : (
                <GeneralEditor category={diary.category} content={editContent} setContent={setEditContent} />
              )}
              
              {/* 수정 제어 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#e2e8f0', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>취소</button>
                <button onClick={handleUpdate} disabled={isUpdating} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                  {isUpdating ? '🔮 AI 재분석 중...' : '✨ 수정 완료'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🧠 AI 리포트 결과 영역 */}
        <AIReport category={diary.category} summary={diary.summary} feedback={diary.feedback} />

      </main>
    </div>
  );
}