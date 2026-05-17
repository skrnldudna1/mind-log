'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 연결 설정 (환경 변수 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  // --- 🔐 로그인 인증 관련 상태 관리 ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- 📝 일기 작성 및 AI 분석 상태 관리 ---
  const [diary, setDiary] = useState('');
  const [result, setResult] = useState<{ summary: string; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. 유저 로그인 세션 실시간 체크
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    checkUser();

    // 로그인/로그아웃 상태가 바뀌면 자동으로 새로고침
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // 로그인 완료 후 다시 우리 홈페이지로 리다이렉트
      },
    });
  };

  // 3. 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 4. 원래 있던 AI 일기 분석 핸들러
  const handleAnalyze = async () => {
    if (!diary.trim()) {
      alert('오늘의 이야기를 조금이라도 적어주세요.');
      return;
    }

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
      loading && setLoading(false);
    }
  };

  // 시스템 초기 로딩 중 화면
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <p style={{ fontSize: '15px', color: '#666f7a', fontFamily: 'sans-serif' }}>잠시만 기다려주세요...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '60px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* 🔐 1. 로그인이 안 되어 있을 때 보여주는 깔끔한 대문 화면 */}
        {!user ? (
          <div style={{ 
            textAlign: 'center', 
            width: '100%', 
            padding: '50px 30px', 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', 
            border: '1px solid #f1f5f9',
            marginTop: '40px'
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111214', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              🧠 MindLog
            </h1>
            <p style={{ fontSize: '15px', color: '#666f7a', marginBottom: '40px', lineHeight: '1.6' }}>
              오늘 하루 나의 숨겨진 마음을 기록하고<br/>
              Gemini AI의 따뜻한 맞춤형 감성 레포트를 받아보세요.
            </p>
            
            {/* 세련된 구글 소셜 로그인 버튼 */}
            <button 
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
            >
              🌐 구글 계정으로 3초만에 시작하기
            </button>
          </div>
        ) : (
          
          /* 🔓 2. 로그인이 완벽히 완료되었을 때 보여주는 수희님의 진짜 일기장 */
          <>
            {/* 상단 헤더 영역 (유저 환영 메시지 및 로그아웃 포함) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111214', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                  🧠 MindLog
                </h1>
                {/* 구글 로그인 유저의 이름을 동적으로 노출 */}
                <p style={{ margin: 0, fontSize: '14px', color: '#4f46e5', fontWeight: '600' }}>
                  ✨ 반가워요, {user.user_metadata?.full_name || '회원'}님!
                </p>
              </div>

              {/* 감성 리포트 링크와 로그아웃 버튼을 우측에 깔끔하게 배치 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/report" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff', color: '#4f46e5', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  📊 리포트
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '11px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  로그아웃
                </button>
              </div>
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
                style={{ width: '100%', height: '200px', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '16px', lineHeight: '1.6', color: '#334155', resize: 'none', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? '#93c5fd' : '#4f46e5', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}
              >
                {loading ? '✨ 대답을 생각하는 중...' : '🔮 내 마음 분석 요청하기'}
              </button>
            </div>

            {/* AI 분석 결과창 */}
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
          </>
        )}
      </main>
    </div>
  );
}