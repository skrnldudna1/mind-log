// app/_main_components/HomeHeader.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HomeHeaderProps {
  userName?: string;
  recordCount?: number;
  userEmail?: string;
}

export default function HomeHeader({ userName = '사용자', recordCount = 0, userEmail = '' }: HomeHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 📸 진짜 프로필 이미지 URL 상태
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const isLoggedIn = !!userEmail;
  

  // 메뉴 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔄 [긴급 수정] 404 에러를 유발하는 profiles 테이블 조회를 제거하고 세션 메타데이터에서 직접 추출
  useEffect(() => {
    async function loadDirectAvatar() {
      if (!isLoggedIn) {
        setAvatarUrl('');
        return;
      }

      try {
        // 1. 현재 로그인한 유저의 세션 정보를 가져옵니다.
        const { data: { user } } = await supabase.auth.getUser();
        
        // 2. 유저 정보나 메타데이터가 있으면 그 안의 avatar_url이나 picture 확인
        if (user) {
          // 구글 로그인인 경우 user_metadata.picture에, 마이페이지 저장 방식에 따라 avatar_url에 주소가 들어있습니다.
          const rawAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

          if (rawAvatarUrl) {
            // 주소가 이미 완전한 URL 형태(http...)라면 그대로 쓰고, 파일명만 들어있다면 Storage 주소로 변환합니다.
            if (rawAvatarUrl.startsWith('http')) {
              setAvatarUrl(rawAvatarUrl);
            } else {
              const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(rawAvatarUrl);

              if (data?.publicUrl) {
                setAvatarUrl(data.publicUrl);
              }
            }
          }
        }
      } catch (err) {
        console.error('메인 헤더 이미지 직통 로드 실패:', err);
      }
    }

    loadDirectAvatar();
  }, [userEmail, isLoggedIn]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    window.location.reload();
    if (error) {
      alert('로그아웃 중 오류가 발생했습니다.');
    } else {
      setIsMenuOpen(false);
      setAvatarUrl('');
      router.refresh(); 
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsMenuOpen(false);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : '',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('구글 로그인 에러:', err.message);
      alert('로그인 연결 중 오류가 발생했습니다.');
    }
  };

  const getSubMessage = () => {
    if (!isLoggedIn) {
      return '나만의 기록을 안전하게 보관하려면 로그인이 필요해요. 😉';
    }
    if (recordCount === 0) {
      return '아직 비어있는 공간이네요. 오늘의 가벼운 생각부터 시작해볼까요? ✍️';
    }
    if (recordCount < 3) {
      return '최근 기록이 조금씩 쌓이고 있어요. 좋은 출발이에요! ✨';
    }
    return `이번 달 벌써 ${recordCount}개의 생각이 모였어요. 나만의 흐름이 단단해지는 중! 🌿`;
  };

  const avatarInitial = isLoggedIn && userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'sans-serif' }}>
      
      {/* 상단 탑바 영역 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', borderBottom: '1px solid #f1f5f9', position: 'relative'
      }}>
        
      {/* 🦙 알파카 이미지 추가 */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/images/로그.png" 
            alt="MindLog Mascot" 
            style={{ width: '320px', height: '140px', objectFit: 'contain' }} 
          />
        </Link>

        {/* 미니 프로필 아바타 버튼 */}
        <div 
          ref={menuRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            padding: '6px 12px', borderRadius: '12px', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* 아바타 원형 구역 */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: isLoggedIn ? '#e0e7ff' : '#f1f5f9', 
            color: isLoggedIn ? '#4f46e5' : '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', overflow: 'hidden', position: 'relative'
          }}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={() => setAvatarUrl('')} 
              />
            ) : (
              avatarInitial
            )}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
            {isLoggedIn ? userName : 'GUEST'} ▾
          </span>

          {/* 드롭다운 메뉴 영역 */}
          {isMenuOpen && (
            <div style={{
              position: 'absolute', top: '55px', right: '0',
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '8px', minWidth: '160px', zIndex: 999,
              display: 'flex', flexDirection: 'column', gap: '4px'
            }}
            onClick={(e) => e.stopPropagation()} 
            >
              {isLoggedIn ? (
                <>
                  <Link href="/mypage" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                    <div style={menuItemStyle} onMouseEnter={toggleHoverIn} onMouseLeave={toggleHoverOut}>
                      👤 내 프로필
                    </div>
                  </Link>

                  <Link href="/report" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                    <div style={{ ...menuItemStyle, color: '#4f46e5' }} onMouseEnter={toggleHoverInPurple} onMouseLeave={toggleHoverOut}>
                      📊 전체 리포트 목록
                    </div>
                  </Link>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                  <button onClick={handleLogout} style={menuButtonStyle} onMouseEnter={toggleHoverInRed} onMouseLeave={toggleHoverOut}>
                    🚪 로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                    <div 
                      style={{ ...menuItemStyle, color: '#4f46e5', fontWeight: '700', textAlign: 'center' }} 
                      onMouseEnter={toggleHoverInPurple} 
                      onMouseLeave={toggleHoverOut}
                    >
                       로그인하기
                    </div>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 중간 타이틀 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            {isLoggedIn ? `오늘 어떤 하루였나요, ${userName}님?` : '반갑습니다! 방문자님'}
          </h1>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>
            {getSubMessage()}
          </p>
        </div>

        {isLoggedIn && (
          <Link href="/write" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#bdb7b3',
              color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#bdb7b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#bdb7b3';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <span style={{ fontSize: '16px' }}>+</span> 기록하기
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

const menuItemStyle = {
  textAlign: 'left' as const, padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
  fontWeight: '600', color: '#334155', transition: 'background 0.15s', cursor: 'pointer'
};

const menuButtonStyle = {
  textAlign: 'left' as const, backgroundColor: 'transparent', border: 'none',
  padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
  fontWeight: '600', color: '#ef4444', cursor: 'pointer', transition: 'background 0.15s', width: '100%'
};

const toggleHoverIn = (e: any) => e.currentTarget.style.backgroundColor = '#f8fafc';
const toggleHoverInPurple = (e: any) => e.currentTarget.style.backgroundColor = '#f5f3ff';
const toggleHoverInRed = (e: any) => e.currentTarget.style.backgroundColor = '#fef2f2';
const toggleHoverOut = (e: any) => e.currentTarget.style.backgroundColor = 'transparent';