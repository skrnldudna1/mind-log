// app/api/summary/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from "next/server";

// 🔗 최신 SDK는 이렇게 인스턴스를 만들고 환경변수에 들어있는 GEMINI_API_KEY를 자동으로 가져와요!
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { diaries, nickname } = await req.json();

    if (!diaries || diaries.length === 0) {
      return NextResponse.json({ error: "분석할 데이터가 없습니다." }, { status: 400 });
    }

    // 🔗 모든 일기 내용을 카테고리와 함께 하나의 텍스트로 합치기
    const combinedContent = diaries.map((d: any) => `[${d.category}] ${d.content}`).join("\n\n");

    // 🔗 최신 라이브러리 문법인 ai.models.generateContent를 사용합니다!
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        유저 이름: ${nickname}
        아래는 이 유저가 한 달 동안 작성한 다양한 카테고리의 기록들이다:
        
        ${combinedContent}
        
        이 기록들을 토대로 다음 포맷에 맞춰 월간 보고서를 작성해줘:
        1. [한 달 총평]: 이 유저가 이번 달에 어떤 일과를 보냈고 어떤 감정 흐름을 보였는지 입체적으로 요약해줘 (3~4문장).
        2. [성장 포인트]: 일상, 투자, 기록, 아이디어 등에서 발견된 긍정적인 변화나 성취를 언급해줘.
        3. [짧은 조언]: 다음 달을 더 멋지게 보내기 위한 날카롭고 따뜻한 한 줄 조언을 해줘.
        
        형식은 친절하지만 전문적인 말투로 작성해줘.
      `,
    });

    // 최신 SDK는 결과 텍스트를 response.text로 바로 깔끔하게 가져옵니다.
    return NextResponse.json({ report: response.text });
  } catch (error) {
    console.error("AI 요약 중 에러 발생:", error);
    return NextResponse.json({ error: "AI 요약 중 오류가 발생했습니다." }, { status: 500 });
  }
}