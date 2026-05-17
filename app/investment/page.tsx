// app/investment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
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
  const [diary, setDiary] = useState('');

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
    if (!diary.trim()) return alert('자유 판단 기록을 적어주세요.');
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
          .insert([
            {
              user_id: user.id,
              content: diary,
              summary: aiData.summary,
              feedback: aiData.feedback,
              category: '투자',
              ticker: ticker.trim(),
              action: action,
              emotion: emotion
            }
          ])
          .select();

        if (dbError) throw new Error(dbError.message);

        alert('📈 투자 복기 작성이 완료되었습니다. AI 분석 결과를 확인하세요!');
        router.push(`/report/${dbData[0].id}`);
      } else {
        alert(aiData.error || 'AI 서버가 잠시 혼잡합니다.');
      }
    } catch (err: any) {
      alert(`저장 중 오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) return <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>보안 세션 확인 중... 🔐</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* 상단바 디자인 통일 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800' }}>
              📈 NEW INVESTMENT RECORD
            </span>
          </div>
          <Link href="/" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: '600' }}>
            ← 메인으로 가기
          </Link>
        </div>

        {/* 📝 메인 작성 카드 (상세 페이지와 동일한 화이트 카드 스타일) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '35px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>투자 판단 복기하기</h2>
          <p style={{ margin: '0 0 30px 0', fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>
            오늘의 매매는 이성적이었나요? 감정과 판단 근거를 솔직하게 기록하세요.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* 1. 종목명 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>1. 투자 종목명</label>
              <input 
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="예: 테슬라, SOXL, 비트코인"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '600', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa' }}
              />
            </div>

            {/* 2. 포지션 결정 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>2. 포지션 결정</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['매수', '매도', '관망', '물타기/불타기'].map((act) => {
                  const isAct = action === act;
                  return (
                    <button key={act} onClick={() => setAction(act)} style={{
                      flex: 1, padding: '14px 0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>3. 진입 당시 심리</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['확신', '불안/초조', 'FOMO (소외감)', '평온'].map((emo) => {
                  const isEmo = emotion === emo;
                  return (
                    <button key={emo} onClick={() => setEmotion(emo)} style={{
                      padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                      border: isEmo ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      backgroundColor: isEmo ? '#fffbeb' : '#fff', color: isEmo ? '#b45309' : '#64748b'
                    }}>
                      {emo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. 자유 판단 기록 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>4. 자유 판단 기록 (이유와 반성)</label>
              <textarea
                value={diary}
                onChange={(e) => setDiary(e.target.value)}
                placeholder="오늘 매매의 근거와 현재 느끼는 감정을 솔직하게 적어주세요. 훗날 이 기록이 당신의 실수를 줄여줄 것입니다."
                style={{ width: '100%', height: '180px', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '16px', lineHeight: '1.7', resize: 'none', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa', fontFamily: 'inherit' }}
              />
            </div>

            {/* 분석 완료 버튼 */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: '100%', backgroundColor: loading ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
            >
              {loading ? '🔮 AI가 매매 패턴 분석 중...' : '✨ 이성적으로 복기 완료하기'}
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}