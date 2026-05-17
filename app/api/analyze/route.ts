// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../../lib/supabase'; 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { diary } = await request.json();

    if (!diary) {
      return NextResponse.json({ error: '일기 내용이 없습니다.' }, { status: 400 });
    }

    const prompt = `
사용자가 작성한 일기를 보고 다음 조건에 맞춰 응답해줘.

[일기 내용]
"${diary}"

[요구사항]
1. 오늘 일과 및 사건을 아주 간결하게 딱 '2줄'로 요약해줘.
2. 작성자의 우울감이나 감정을 어루만져주는 따뜻한 심리 상담사 톤으로 위로나 조언을 3줄 내외로 작성해줘.
3. 결과를 아래 JSON 형식으로만 출력해줘. 다른 말은 절대 하지 마.

{"summary": "2줄 요약 내용", "feedback": "위로 및 조언 내용"}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text || '{}';
    const data = JSON.parse(resultText);

    // 💾 [핵심!] AI 분석이 끝나면 Supabase DB 테이블에 저장하는 코드 추가
    const { error: dbError } = await supabase
      .from('diaries')
      .insert([
        {
          content: diary,
          summary: data.summary,
          feedback: data.feedback
        }
      ]);

    if (dbError) {
      console.error('Supabase DB 저장 에러:', dbError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI 분석 에러:', error);
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}