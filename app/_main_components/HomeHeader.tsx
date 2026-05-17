//인사말 & 버튼
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 드롭다운 팝업 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 닉네임 변경 모달 상태
  const [newNickname, setNewNickname] = useState(userName); // 입력한 새 닉네임 상태
  const [isUpdating, setIsUpdating] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // 컴포넌트가 로드되거나 userName 프로필이 바뀌면 입력 필드 동기화
  useEffect(() => {
    setNewNickname(userName);
  }, [userName]);

  // 프로필 외부 영역 클릭 시 드롭다운 자동으로 닫히기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🚪 로그아웃 기능
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('로그아웃 중 오류가 발생했습니다.');
    } else {
      router.refresh();
    }
  };

  // 📝 Supabase Auth 메타데이터에 새 닉네임 저장하는 기능
  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }
    
    try {
      setIsUpdating(true);
      // 유저의 user_metadata 안에 nickname 필드를 업데이트합니다.
      const { error } = await supabase.auth.updateUser({
        data: { nickname: newNickname.trim() }
      });

      if (error) throw error;

      alert('닉네임이 성공적으로 변경되었습니다! ✨');
      setIsModalOpen(false);
      router.refresh(); // 변경 사항 반영을 위해 메인 새로고침 효과
    } catch (err) {
      console.error(err);
      alert('닉네임 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSubMessage = () => {
    if (recordCount === 0) {
      return '아직 비어있는 공간이네요. 오늘의 가벼운 생각부터 시작해볼까요? ✍️';
    }
    if (recordCount < 3) {
      return '최근 기록이 조금씩 쌓이고 있어요. 좋은 출발이에요! ✨';
    }
    return `이번 달 벌써 ${recordCount}개의 생각이 모였어요. 나만의 흐름이 단단해지는 중! 🌿`;
  };

  const avatarInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'sans-serif' }}>
      
      {/* 상단 탑바 영역 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', borderBottom: '1px solid #f1f5f9', position: 'relative'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#4f46e5', letterSpacing: '-0.3px' }}>
            🧠 마인드 로그
          </span>
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
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: '#e0e7ff', color: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800'
          }}>
            {avatarInitial}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
            {userName} ▾
          </span>

          {/* ▾ 내 프로필 누르면 내려오는 드롭다운 메뉴 */}
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
              {/* ✏️ 서비스 정보 대신 [닉네임 변경] 주입! */}
              <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false); // 메뉴 레이어는 닫아주기
                }}
                style={{
                  textAlign: 'left', backgroundColor: 'transparent', border: 'none',
                  padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '600', color: '#334155', cursor: 'pointer', transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ✏️ 닉네임 변경
              </button>

              <Link href="/report" style={{ textDecoration: 'none' }}>
                <div style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '600', color: '#4f46e5', transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📊 전체 리포트 목록
                </div>
              </Link>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

              <button 
                onClick={handleLogout}
                style={{
                  textAlign: 'left', backgroundColor: 'transparent', border: 'none',
                  padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '600', color: '#ef4444', cursor: 'pointer', transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🚪 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 중간 타이틀 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            오늘 어떤 하루였나요, {userName}님?
          </h1>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>
            {getSubMessage()}
          </p>
        </div>

        <Link href="/write" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#4f46e5',
            color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4338ca';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <span style={{ fontSize: '16px' }}>+</span> 기록하기
          </button>
        </Link>
      </div>

      {/* 🔮 [NEW] 닉네임 수정을 위한 세련된 팝업 모달창 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px',
            width: '90%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              새로운 이름 설정
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              마인드 로그 대문에 표시될 나만의 닉네임을 입력해 주세요.
            </p>

            <input 
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={15}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600',
                color: '#1e293b', outline: 'none', boxSizing: 'border-box',
                marginBottom: '20px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
                style={{
                  backgroundColor: '#f1f5f9', color: '#64748b', border: 'none',
                  padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '700', cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button 
                onClick={handleUpdateNickname}
                disabled={isUpdating}
                style={{
                  backgroundColor: '#4f46e5', color: '#ffffff', border: 'none',
                  padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)'
                }}
              >
                {isUpdating ? '변경 중...' : '변경 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}