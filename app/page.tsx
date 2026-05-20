'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import HomeHeader from './_main_components/HomeHeader';
import GrassCalendar from './_main_components/GrassCalendar';
import AIOverview from './_main_components/AIOverview';
import RecentCards from './_main_components/RecentCards';
import MonthlyStats from './_main_components/MonthlyStats';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function HomePage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [nickname, setNickname] = useState('사용자');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // ✅ 로그인 유저 정보 상태 추가

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    return html.replace(/<img[^>]*>/g, '').replace(/<[^>]*>/g, '');
  };

  useEffect(() => {
    // 세션이 바뀔 때마다 감지하는 리스너 설정
    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        fetchHomeData(session.user);
      } else {
        setLoading(false); 
      }
    });

    // 초기 세션 확인
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchHomeData(session.user);
      } else {
        setLoading(false);
      }
      
    };

    initSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchHomeData = async (user: any) => {
    setUser(user); // ✅ 여기서 로그인 유저 정보를 상태에 저장!
    
    try {
      setLoading(true);
      
      // 유저 정보 세팅
      setEmail(user.email || '');
      const name = user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0];
      setNickname(name || '사용자');

      // 데이터 가져오기
      const { data: diariesData, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

        if (error) {
          console.error("데이터 조회 에러:", error);
        } else {
          setDiaries(diariesData || []);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

  const cleanDiaries = diaries.map(diary => ({
    ...diary,
    content: stripHtmlTags(diary.content || '')
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#6366f1', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontFamily: 'sans-serif', fontWeight: '700', fontSize: '15px' }}>마인드 로그 충전 중... 🔮</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 20px 80px 20px' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <HomeHeader userName={nickname} recordCount={diaries.length} userEmail={email} />
        <GrassCalendar diaries={diaries} />
        <AIOverview diaries={diaries} />
        <MonthlyStats diaries={diaries} />
        <RecentCards diaries={cleanDiaries} />
      </main>
    </div>
  );
}