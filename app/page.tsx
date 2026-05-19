'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import HomeHeader from './_main_components/HomeHeader';
import GrassCalendar from './_main_components/GrassCalendar';
import AIOverview from './_main_components/AIOverview';
import RecentCards from './_main_components/RecentCards';
import MonthlyStats from './_main_components/MonthlyStats';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [nickname, setNickname] = useState('사용자');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // 이미지 태그와 HTML 태그를 제거하는 함수
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const textOnly = html.replace(/<img[^>]*>/g, '');
    return textOnly.replace(/<[^>]*>/g, '');
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // 1. 유저 정보 로드
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const name = user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0];
          setNickname(name || '사용자');
        }

        // 2. 기록 데이터 가져오기
        const { data: diariesData, error } = await supabase
          .from('diaries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && diariesData) {
          setDiaries(diariesData);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // 3. RecentCards용으로 이미지를 제거한 텍스트 전용 데이터 생성
  const cleanDiaries = diaries.map(diary => ({
    ...diary,
    content: stripHtmlTags(diary.content || '')
  }));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', backgroundColor: '#f8fafc', color: '#6366f1',
        flexDirection: 'column', gap: '12px'
      }}>
        <p style={{ fontFamily: 'sans-serif', fontWeight: '700', fontSize: '15px' }}>마인드 로그 충전 중... 🔮</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 20px 80px 20px' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 상단 헤더 */}
        <HomeHeader userName={nickname} recordCount={diaries.length} userEmail={email} />

        {/* 🌿 잔디밭 */}
        <GrassCalendar diaries={diaries} />

        {/* 🧠 AI가 본 최근 흐름 */}
        <AIOverview diaries={diaries} />

        {/* 📊 월간 흐름 요약 */}
        <MonthlyStats diaries={diaries} />

        {/* 🗂️ 최근 기록 복기 카드 (이미지 없는 cleanDiaries 전달) */}
        <RecentCards diaries={cleanDiaries} />

      </main>
    </div>
  );
}