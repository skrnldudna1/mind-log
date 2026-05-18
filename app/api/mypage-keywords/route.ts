// app/api/mypage-keywords/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { diaries } = await request.json();

    if (!diaries || !Array.isArray(diaries) || diaries.length === 0) {
      return NextResponse.json({ keywords: ['기록 시작하기 🌱', '일상', '생각'] });
    }

    const diaryTexts = diaries
      .filter((d: any) => d && d.content)
      .map((d: any) => d.content)
      .join('\n');

    if (!diaryTexts.trim()) {
      return NextResponse.json({ keywords: ['기록 시작하기 🌱', '일상', '생각'] });
    }

    const prompt = `
당신은 사용자의 다이어리 기록을 분석하여 현재 이 사람의 마음을 지배하고 있는 핵심 관심사나 키워드를 추출하는 AI 언어 모델입니다.

[사용자의 다이어리 기록]
${diaryTexts}

[🚨 작성 규칙 - 필수 엄수]
1. 위 기록들에서 가장 핵심이 되는 단일 단어 키워드를 딱 3개만 추출하세요.
2. 출력 형식은 반드시 쉼표(,)로만 구분된 3개의 단어여야 합니다. 뒤에 이모지를 하나씩 붙여주세요.
   예시: 재테크 📈, 일상 ☕, 개발 💻
`;

    const apiKey = process.env.GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    let rawText = '';
    if (response) {
      const resAny = response as any;
      if (typeof resAny.text === 'function') {
        rawText = await resAny.text();
      } else if (resAny.text) {
        rawText = resAny.text;
      }
    }
    
    const textStr = String(rawText || '').trim();
    let keywords = textStr.split(',').map((word: string) => word.trim()).filter(Boolean);

    if (keywords.length === 0) {
      keywords = ['일상 ☕', '생각 💭', '기록 📝'];
    }

    return NextResponse.json({ keywords });
  } catch (error: any) {
    console.error('마이페이지 키워드 추출 에러:', error);
    // 🚨 구글 할당량 초과(429) 등의 에러가 발생하면 사용자에게 서비스가 멈춘 것처럼 보이지 않게 이쁜 기본 칩을 보여줍니다.
    return NextResponse.json({ keywords: ['반가워요 👋', '소소한 하루', '생각 정리'] });
  }
}