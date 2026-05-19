'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import TiptapEditor from '../report/[id]/_components/TiptapEditor'; // 경로를 실제 위치에 맞게 조정하세요!
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvestmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('');
  const [emotion, setEmotion] = useState('');
  const [diary, setDiary] = useState(''); // Tiptap이 생성하는 HTML 문자열

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('로그인이 필요한 페이지입니다. 🌸');
        router.push('/');
      } else {
        setUser(session.user);
      }
      setAuthChecking(false);
    };
    checkUser();
  }, [router]);

  const handleAnalyze = async () => {
    if (!ticker.trim()) return alert('투자 종목을 입력해 주세요.');
    if (!action) return alert('포지션 결정을 선택해 주세요.');
    if (!emotion) return alert('진입 당시 심리를 선택해 주세요.');
    if (!diary.trim() || diary === '<p></p>') return alert('자유 판단 기록을 적어주세요.');
    
    setLoading(true);

    try {
      const investmentContext = `[투자 분석 요청]\n- 종목: ${ticker}\n- 매매 행동: ${action}\n- 투자 심리 상태: ${emotion}\n\n[투자 복기 본문]\n"${diary}"`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary: investmentContext, category: '투자' }),
      });

      const aiData = await res.json();

      if (res.ok) {
        const { data: dbData, error: dbError } = await supabase
          .from('diaries')
          .insert([{
            user_id: user.id,
            content: diary, // Tiptap의 HTML 데이터
            summary: aiData.summary,
            feedback: aiData.feedback,
            category: '투자',
            ticker: ticker.trim(),
            action: action,
            emotion: emotion,
          }])
          .select();

        if (dbError) throw new Error(dbError.message);

        alert('📈 투자 복기 작성이 완료되었습니다.');
        router.push(`/report/${dbData[0].id}`);
      }
    } catch (err: any) {
      alert(`저장 중 오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) return <div style={{ textAlign: 'center', padding: '100px' }}>보안 세션 확인 중... 🔐</div>;

  return (
    
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '35px', border: '1px solid #f1f5f9' }}>
          
 {/* 🦙 알파카 이미지 추가 */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/images/로그.png" 
            alt="MindLog Mascot" 
            style={{ width: '320px', height: '140px', objectFit: 'contain' }} 
          />
        </Link>

          
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>투자 판단 복기하기</h2>

          {/* 종목, 포지션, 심리 입력란은 동일하게 유지 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>1. 투자 종목명</label>
              <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} />
            </div>

            <div>
              <label style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>2. 포지션 결정</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['매수', '매도', '관망', '물타기/불타기'].map((act) => (
                  <button key={act} onClick={() => setAction(act)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: action === act ? '2px solid #ef4444' : '1px solid #e2e8f0', backgroundColor: action === act ? '#fef2f2' : '#fff' }}>{act}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>3. 진입 당시 심리</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['확신', '불안/초조', 'FOMO (소외감)', '평온'].map((emo) => (
                  <button key={emo} onClick={() => setEmotion(emo)} style={{ padding: '12px 20px', borderRadius: '14px', border: emotion === emo ? '2px solid #f59e0b' : '1px solid #e2e8f0', backgroundColor: emotion === emo ? '#fffbeb' : '#fff' }}>{emo}</button>
                ))}
              </div>
            </div>

            {/* Tiptap 에디터 도입 (기존 textarea 제거) */}
            <div>
              <label style={{ fontWeight: '700', fontSize: '13px', color: '#64748b', marginBottom: '8px', display: 'block' }}>4. 자유 판단 기록 (이유와 반성)</label>
              <TiptapEditor content={diary} onChange={setDiary} />
            </div>

            <button onClick={handleAnalyze} disabled={loading} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: loading ? '#94a3b8' : '#bdb7b3', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? '🔮 AI 분석 및 저장 중...' : '복기 완료'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}