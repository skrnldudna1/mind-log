// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

// 1. 클라이언트 생성 함수
const createClientInstance = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 2. 개발 환경에서 HMR 때문에 인스턴스가 여러 개 생기는 것을 방지
const globalForSupabase = global as unknown as { supabase: any };

export const supabase = globalForSupabase.supabase || createClientInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}