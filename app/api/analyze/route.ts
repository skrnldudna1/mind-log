// app/api/analyze/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { diary, category } = await req.json();

    if (!diary) {
      return NextResponse.json({ error: '내용이 없습니다.' }, { status: 400 });
    }

    const safeCategory = ['일상', '투자', '기록', '아이디어'].includes(category) ? category : '일상';

    let systemPrompt = '';

    if (safeCategory === '일상') {
      systemPrompt = `
너는 사용자의 하루와 감정을 싹 긁어모아 대신 깔끔하게 다 정리해주는 관찰자다.
상담사처럼 뻔하게 위로하거나 감성적인 표현은 절대 쓰지 않는다.
사용자가 스스로 정리할 필요가 없도록, 오늘의 상황과 감정 흐름을 담백하고 콤팩트하게 대변해준다.
`;
    } else if (safeCategory === '투자') {
      systemPrompt = `
너는 냉철하고 현실적인 투자 복기 파트너다.
'수익을 기록하신 점은 확인됩니다' 같은 불필요한 격식이나 칭찬, 뻔한 리스크 조언은 전부 생략한다.
유저가 왜 그런 판단을 내렸는지, 감정(FOMO, 공포, 욕심)이 어떻게 개입했는지 핵심만 짚어 한 통으로 정리한다.
`;
    } else if (safeCategory === '기록') {
      systemPrompt = `
너는 사용자의 루틴과 성장을 정리해주는 기록 코치다.
부담스러운 자기계발식 말투나 칭찬은 금지한다.
오늘의 행동 패턴과 꾸준함의 흐름을 유저 대신 명확하게 한 번에 요약해준다.
`;
    } else if (safeCategory === '아이디어') {
      systemPrompt = `
너는 사용자의 생각을 정리하고 확장해주는 창작 파트너다.
무조건 천재적이라고 치켜세우거나 뻔한 교과서 같은 조언은 금지한다.
아이디어의 핵심과 앞으로 구체화하면 좋을 포인트만 현실적이고 센스 있게 요약한다.
`;
    }

    // 🔥 수희님 맞춤형 통합 프롬프트 세팅
    const finalPrompt = `
      ${systemPrompt}
      유저의 글: "${diary}"
      
      ⚠️ 핵심 규칙 (목숨 걸고 지킬 것):
      1. 서론, 결론, 인사말, 뻔한 훈수('~하는 것이 중요합니다' 등)는 절대 쓰지 마세요.
      2. 유저의 글에 담긴 상황, 감정, 피드백을 모두 '하나로 버무려서' 딱 2~3줄 내외의 한 문단으로 완성해 주세요.
      3. 말투는 차분하고 정갈한 존댓말로 작성해 주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: finalPrompt,
      config: {
        responseMimeType: 'application/json',
        // 🔥 서랍을 'aiSummary' 딱 하나로 통합해서 두 줄 요약본만 깔끔하게 받아옵니다.
        responseSchema: {
          type: 'OBJECT',
          properties: {
            aiSummary: { 
              type: 'STRING', 
              description: '상황과 감정, 피드백을 한 통으로 버무려 정갈하게 작성한 2~3줄 내외의 요약 및 조언' 
            },
          },
          required: ['aiSummary'],
        },
      }
    });

    const resText = response.text?.trim() || '';

    if (!resText) {
      return NextResponse.json({ aiSummary: 'AI가 오늘의 마음을 정리하지 못했습니다. 잠시 후 다시 시도해 주세요!' });
    }

    const parsedJson = JSON.parse(resText);
    
    // 🔥 깔끔하게 합쳐진 한 덩어리의 데이터만 프론트엔드로 던져줍니다.
    return NextResponse.json({
      aiSummary: parsedJson.aiSummary?.trim() || '오늘의 마음을 구성하지 못했습니다.'
    });

  } catch (error: any) {
    console.error('🔥 [ANALYZE_API_ERROR]:', error);
    
    return NextResponse.json({ 
      aiSummary: '현재 AI 응답 지연으로 기본 저장만 완료되었습니다. 다시 수정하기를 시도해 주세요! ✨' 
    });
  }
}