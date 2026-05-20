'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 수희님 supabase 경로 확인!

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 이메일 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(`로그인 실패: ${error.message}`);
    alert('반갑습니다! 로그인 성공 🦙');
    router.push('/');
    router.refresh();
  };

  // 이메일 회원가입
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return alert('비밀번호는 최소 6자리 이상이어야 합니다!');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://mind-log-cyan.vercel.app/' },
    });
    setLoading(false);
    if (error) return alert(`회원가입 실패: ${error.message}`);
    alert('회원가입이 완료되었습니다! 가입하신 계정으로 로그인해 주세요. 🎉');
    setIsSignUp(false);
    setPassword('');
  };

 // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }, 
    });
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin },
    });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF9F6] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EFECE6] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2D2A26]">Mind Log</h1>
          <p className="mt-2 text-sm text-[#8C867C]">
            {isSignUp ? '나만의 프라이빗 아카이브 시작하기' : '오늘의 마음을 기록하러 오셨나요?'}
          </p>
        </div>

        {/* 이메일 폼 */}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#5C564E] mb-1">이메일 주소</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-[#CDCECE] px-4 py-3 text-sm text-[#2D2A26] focus:border-[#4F46E5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5C564E] mb-1">비밀번호 (6자리 이상)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#CDCECE] px-4 py-3 text-sm text-[#2D2A26] focus:border-[#4F46E5] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4F46E5] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4338CA] transition disabled:bg-[#CDCECE]"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입 하기' : '로그인 하기'}
          </button>
        </form>

        {/* ---------------- 구분선 ---------------- */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EFECE6]"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#8C867C]">또는 소셜 로그인</span></div>
        </div>

        {/* 소셜 로그인 버튼 모음 🔥 추가됨! */}
        <div className="space-y-3">
          {/* 카카오 로그인 버튼 (카카오 브랜드 컬러 적용) */}
          <button
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-semibold text-[#191919] hover:bg-[#FADA0A] transition"
          >
            💬 카카오톡으로 시작하기
          </button>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#CDCECE] bg-white py-3 text-sm font-semibold text-[#2D2A26] hover:bg-[#FBF9F6] transition"
          >
            🌐 Google로 시작하기
          </button>
        </div>

        {/* 모드 전환 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-[#8C867C]">{isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}</span>{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setPassword(''); }} className="font-semibold text-[#4F46E5] hover:underline">
            {isSignUp ? '로그인하기' : '회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
}