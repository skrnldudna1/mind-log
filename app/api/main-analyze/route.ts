// 메인페이지 ai 분석

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai'; // 👈 정상 설치된 최신형 패키지 경로

export async function POST(request: Request) {
  try {
    const { diaries } = await request.json();

    if (!diaries || diaries.length === 0) {
      return NextResponse.json({ 
        summary: '아직 분석할 기록이 부족해요. 편안한 마음으로 첫 글을 남겨주세요. 🧭' 
      });
    }

    // 1. AI에게 보낼 최근 글들의 본문과 카테고리를 하나의 텍스트로 합치기
    const diaryContext = diaries
      .map((d: any, idx: number) => `[기록 ${idx + 1}] 카테고리: ${d.category}, 내용: ${d.content}`)
      .join('\n');

    // 2. 메인 화면 전용 '담백 에디션' 프롬프트 설정
    const prompt = `
당신은 개인 기록 앱의 따뜻하고 지혜로운 AI 페이스메이커입니다.
사용자가 최근에 작성한 다이어리 기록들을 바탕으로, 최근 이 사람의 생각 흐름이나 관심사를 가볍고 정갈하게 브리핑해 주어야 합니다.

[사용자의 최근 기록]
${diaryContext}

[🚨 작성 규칙 - 필수 엄수]
1. 절대로 "당신은 불안 상태입니다", "우울해 보입니다" 같은 무거운 심리 상담이나 진단조의 멘트는 금지합니다. 부담을 줍니다.
2. 친구나 동료가 옆에서 툭 던지듯, 담백하고 명료하게 최근 관심사를 짚어주세요.
3. 딱 2문장 이내로 핵심만 정갈하게 작성하세요.
4. 중요 키워드는 <strong>태그를 감싸서 강조해 주세요. (예: <strong style="color: #4f46e5;">투자 복기</strong>)
5. 문장 끝에는 흐름에 맞는 이모지(📈, 💡, 🧘 등)를 하나 얹어주세요.
`;

    // 3. 최신형 패키지 문법에 맞춘 호출 및 안전장치 처리
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    const responseText = response.text ? response.text.trim() : '최근 작성된 기록의 맥락을 분석하지 못했어요. ☕';

    return NextResponse.json({ summary: responseText });
  } catch (error) {
    console.error('메인 AI 분석 에러:', error);
    return NextResponse.json(
      { summary: '최근 생각을 읽어오는 중에 약간의 혼선이 생겼어요. 잠시 후 다시 확인해볼게요. ☕' },
      { status: 500 }
    );
  }
}