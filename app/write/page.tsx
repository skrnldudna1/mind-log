// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  { id: 'daily', name: '일상', emoji: '🌸', desc: '감정이나 오늘 하루 일기' },
  { id: 'investment', name: '투자', emoji: '📈', desc: '매매 기록 및 투자 심리' },
  { id: 'record', name: '기록', emoji: '🎯', desc: '운동, 공부 등 자기관리' },
  { id: 'idea', name: '아이디어', emoji: '💡', desc: '창작, 망상, 번뜩이는 메모' },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [updatingNickname, setUpdatingNickname] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('일상');
  const [diary, setDiary] = useState('');
  const [result, setResult] = useState<{ summary: string; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // ⚡ [핵심 추가] '투자' 카테고리를 선택하면 즉시 투자 전용 페이지로 이동시킵니다.
  useEffect(() => {
    if (selectedCategory === '투자') {
      router.push('/investment');
    }
  }, [selectedCategory, router]);

  useEffect(() => {
    const timer = setTimeout(() => { setAuthLoading(false); }, 1000);
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setNickname(session.user.user_metadata?.nickname || session.user.user_metadata?.full_name || '');
        }
      } catch (err) {
        console.error("유저 세션 로드 실패:", err);
      } finally {
        setAuthLoading(false);
        clearTimeout(timer);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setNickname(session.user.user_metadata?.nickname || session.user.user_metadata?.full_name || '');
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleUpdateNickname = async () => {
    if (!nickname.trim()) return alert('닉네임을 입력해 주세요.');
    setUpdatingNickname(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { nickname: nickname.trim() }
    });
    if (error) alert('실패: ' + error.message);
    else {
      alert('닉네임이 변경되었습니다! ✨');
      setUser(data.user);
      setIsModalOpen(false);
    }
    setUpdatingNickname(false);
  };

  const handleAnalyze = async () => {
    if (!diary.trim()) return alert('내용을 적어주세요.');
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary, category: selectedCategory }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);

        const { data: dbData, error: dbError } = await supabase
          .from('diaries')
          .insert([
            {
              user_id: user.id,       
              content: diary,         
              summary: data.summary,  
              feedback: data.feedback,
              category: selectedCategory 
            }
          ])
          .select();

        if (dbError) {
          alert('저장 실패: ' + dbError.message);
        } else {
          if (dbData && dbData.length > 0) {
            alert(`오늘의 [${selectedCategory}] 기록이 분석 완료되었습니다! 📁✨`);
            setDiary(''); 
            router.push(`/report/${dbData[0].id}`);
          }
        }
      } else {
        alert(data.error || '분석 중 오류 발생');
      }
    } catch (err) {
      alert('통신 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa', fontSize: '16px', fontWeight: '600', color: '#64748b' }}>
        마인드로그를 준비하고 있습니다... 🔮
      </div>
    );
  }

  const currentDisplayName = user?.user_metadata?.nickname || user?.user_metadata?.full_name || '회원';

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {!user ? (
          <div style={{ textAlign: 'center', padding: '50px 30px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', marginTop: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111214', marginBottom: '12px' }}>🧠 MindLog</h1>
            <p style={{ fontSize: '15px', color: '#666f7a', marginBottom: '40px' }}>나의 모든 기록을 보관하고<br/>AI의 입체적인 레포트를 받아보세요.</p>
            <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>🌐 구글로 시작하기</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111214', margin: '0 0 8px 0' }}>🧠 MindLog</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#4f46e5', fontWeight: '600' }}>✨ {currentDisplayName}님의 공간</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#fff', color: '#334155', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', border: '1px solid #e2e8f0', cursor: 'pointer' }}>⚙️ 정보</button>
                <Link href="/report" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff', color: '#4f46e5', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0' }}>📊 리포트</Link>
                <button onClick={handleLogout} style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '11px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>로그아웃</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>어떤 기록을 남길까요? ✨</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      title={cat.desc}
                      style={{
                        padding: '12px 20px', borderRadius: '16px',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#fff', color: isSelected ? '#4f46e5' : '#475569',
                        fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              <textarea 
                value={diary} 
                onChange={(e) => setDiary(e.target.value)} 
                placeholder={
                  selectedCategory === '일상' ? "오늘 무슨 일이 있었나요?" :
                  selectedCategory === '기록' ? "작더라도, 쌓이면 결국 변화가 돼요." : "상상이 현실이 되는 그날까지"
                } 
                style={{ width: '100%', height: '200px', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '16px', lineHeight: '1.6', resize: 'none', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
              />
              
              <button onClick={handleAnalyze} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93c5fd' : '#4f46e5', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px' }}>
                {loading ? '🔮 분석 중...' : `✨ ${selectedCategory} 분석 완료하기`}
              </button>
            </div>
          </>
        )}

        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0' }}>⚙️ 프로필 설정</h2>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임 입력" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '24px' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer', border: 'none', padding: '10px 16px', borderRadius: '10px' }}>취소</button>
                <button onClick={handleUpdateNickname} disabled={updatingNickname} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>저장</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}