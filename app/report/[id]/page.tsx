'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 기존 컴포넌트들 그대로 유지
import DiaryViewer from './_components/DiaryViewer';
import InvestmentEditor from './_components/InvestmentEditor';
import GeneralEditor from './_components/GeneralEditor';
import AIReport from './_components/AIReport';
import TiptapEditor from './_components/TiptapEditor';


export default function DiaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    setIsUpdating(true);
    try {
      // AI 분석 로직은 기존처럼 유지
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
          content: editContent, // Tiptap에서 수정된 HTML이 여기로 저장됩니다
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><img src="/images/로그.png" alt="MindLog" style={{ width: '320px', height: '140px', objectFit: 'contain' }} /></Link>
          <Link href="/report" style={{ fontSize: '14px', color: '#64748b' }}>← 리포트 목록</Link>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {!isEditing ? (
            <DiaryViewer diary={diary} onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
          ) : (
            <div>
              {/* 카테고리별 에디터 + Tiptap 조합 */}
              {diary.category === '투자' ? (
                <InvestmentEditor ticker={editTicker} setTicker={setEditTicker} action={editAction} setAction={setEditAction} emotion={editEmotion} setEmotion={setEditEmotion} content={editContent} setContent={setEditContent} />
              ) : (
                <GeneralEditor category={diary.category} content={editContent} setContent={setEditContent} />
              )}
              
              {/* 추가된 부분: Tiptap을 에디터 하단에 배치 (원한다면 기존 에디터 컴포넌트 내부로 옮겨도 됩니다!) */}
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>자유 판단 기록</p>
                <TiptapEditor content={editContent} onChange={setEditContent} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#e2e8f0', cursor: 'pointer' }}>취소</button>
                <button onClick={handleUpdate} disabled={isUpdating} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer' }}>
                  {isUpdating ? '🔮 AI 재분석 중...' : '✨ 수정 완료'}
                </button>
              </div>
            </div>
          )}
        </div>
        <AIReport category={diary.category} summary={diary.summary} feedback={diary.feedback} />
      </main>
    </div>
  );
}