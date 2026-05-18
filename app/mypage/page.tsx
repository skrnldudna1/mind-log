// app/mypage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 🚨 [수정] 지난번 묶어둔 공용 인스턴스로 교체하여 경고 방지

export default function MyPage() {
  const router = useRouter();
  
  const [nickname, setNickname] = useState('사용자');
  const [email, setEmail] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // 🔮 AI 연동 키워드 상태 변수
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isKeywordLoading, setIsKeywordLoading] = useState(true);

  // 📸 프로필 이미지 상태 변수 (기본값 설정)
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadMyPageData = async () => {
      try {
        // 1. 로그인 유저 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('로그인이 필요한 페이지입니다.');
          router.push('/');
          return;
        }

        setEmail(user.email || '');
        
        // 메타데이터에서 닉네임 및 사진 정보 가져오기
        const name = user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0];
        setNickname(name || '사용자');
        setTempNickname(name || '사용자');
        
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }

        // 2. 최근 다이어리 데이터 로드 (user_id 필터링 추가로 정확성 향상)
        const { data: diariesData } = await supabase
          .from('diaries')
          .select('content')
          .eq('user_id', user.id) // 👈 수희님의 데이터만 정확하게 필터링
          .order('created_at', { ascending: false })
          .limit(15);

        // 3. 제미나이 키워드 API 호출
        if (diariesData && diariesData.length > 0) {
          const res = await fetch('/api/mypage-keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ diaries: diariesData }),
          });
          const result = await res.json();
          setKeywords(result.keywords || []);
        } else {
          setKeywords([]);
        }
      } catch (error) {
        console.error('마이페이지 로딩 에러:', error);
      } finally {
        setPageLoading(false);
        setIsKeywordLoading(false);
      }
    };

    loadMyPageData();
  }, [router]);

  // 📸 프로필 사진 업로드 및 변경 함수
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // 유저별 고유 파일명 생성
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // A. Supabase Storage 'avatars' 버킷에 이미지 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // B. 스토리지에 올라간 이미지의 Public URL 주소 가져오기
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // C. Supabase Auth 메타데이터에 새 이미지 주소 갱신하기
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert('🎉 프로필 사진이 성공적으로 변경되었습니다!');
      router.refresh();
    } catch (error: any) {
      console.error('사진 업로드 실패:', error.message);
      alert('사진 변경에 실패했습니다. Supabase Storage 설정을 확인해 주세요.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.updateUser({
        data: { nickname: tempNickname.trim() }
      });

      if (error) throw error;

      setNickname(tempNickname.trim());
      setIsEditingNickname(false);
      alert('닉네임이 성공적으로 업데이트되었습니다! ✨');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('닉네임 저장 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
      router.refresh();
    }
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#ffffff', color: '#6366f1', fontWeight: '700' }}>
        프로필 및 생각 분석 중... 🔮
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto', padding: '24px 24px 40px 24px',
      fontFamily: 'sans-serif', backgroundColor: '#ffffff', minHeight: '100vh'
    }}>
      
      {/* 상단 네비게이션 바 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/" style={{
          textDecoration: 'none', fontSize: '20px', color: '#334155', 
          padding: '8px 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center'
        }}>
          ❮
        </Link>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginLeft: '4px' }}>메인으로</span>
      </div>

      {/* 타이틀 */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>내 프로필</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{email}</p>
      </div>

      {/* 프로필 카드 섹션 */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 24px', backgroundColor: '#f8fafc', borderRadius: '24px',
        border: '1px solid #f1f5f9', marginBottom: '32px'
      }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <img 
            src={avatarUrl} 
            alt="프로필 사진" 
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <label htmlFor="profile-upload" style={{
            position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0f172a',
            color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '14px', border: '2px solid #ffffff'
          }}>
            {uploading ? '⏳' : '📷'}
          </label>
          <input 
            id="profile-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange} 
            disabled={uploading} 
            style={{ display: 'none' }} 
          />
        </div>

        {isEditingNickname ? (
          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '240px', marginTop: '8px' }}>
            <input 
              type="text" 
              value={tempNickname} 
              onChange={(e) => setTempNickname(e.target.value)}
              disabled={isUpdating}
              maxLength={15}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '12px', border: '1px solid #cbd5e1',
                fontSize: '15px', fontWeight: '600', textAlign: 'center', outline: 'none'
              }}
            />
            <button onClick={handleSaveNickname} disabled={isUpdating} style={{
              padding: '8px 14px', backgroundColor: '#6366f1', color: '#ffffff',
              borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}>
              {isUpdating ? '...' : '저장'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{nickname}</span>
            <button 
              onClick={() => { setTempNickname(nickname); setIsEditingNickname(true); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748b', padding: '4px' }}
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* 📊 최근 자주 나온 단일 단어 키워드 */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🧩 최근 생각의 주요 키워드
        </h3>
        
        {isKeywordLoading ? (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>생각의 실타래를 푸는 중... ✨</span>
        ) : keywords.length === 0 ? (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>아직 수집된 키워드가 없어요. 기록을 남겨보세요! 🌿</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {keywords.map((word, idx) => (
              <span key={idx} style={{
                fontSize: '13px', fontWeight: '700', color: '#4f46e5',
                backgroundColor: '#f5f3ff', padding: '8px 14px', borderRadius: '20px',
                border: '1px solid #e0e7ff', display: 'inline-block'
              }}>
                ✨ {word}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

      {/* 서비스 설정 섹션 */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px' }}>⚙️ 서비스 설정</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={settingItemStyle}>
            <span>🔔 알림 설정</span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>❯</span>
          </div>
          <div style={settingItemStyle}>
            <span>🔒 보안 및 개인정보</span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>❯</span>
          </div>
          <div style={{ ...settingItemStyle, color: '#ef4444' }} onClick={handleLogout}>
            <span>🚪 로그아웃</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const settingItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
  cursor: 'pointer',
  borderBottom: '1px solid #f8fafc',
};