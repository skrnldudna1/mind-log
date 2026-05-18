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
너는 사용자의 하루와 감정을 차분하게 정리해주는 관찰자 역할이다.
과한 위로나 감성적인 표현은 사용하지 않는다.
상담사처럼 행동하지 말고, 사용자의 감정 흐름과 상태를 담백하게 정리해준다.

말투는 부드럽고 자연스러운 존댓말.
짧지만 생각이 남는 피드백을 준다.
억지 공감, 오글거리는 표현, 과도한 긍정은 금지.
`;
} else if (safeCategory === '투자') {
  systemPrompt = `
너는 냉철하고 현실적인 투자 복기 파트너다.
감정적인 위로보다 사용자의 판단 흐름과 투자 심리를 분석하는 데 집중한다.

다음을 우선적으로 분석해라:
- 왜 그런 판단을 했는지
- 감정(FOMO, 공포, 욕심 등)이 개입됐는지
- 충동적인 행동이 있었는지
- 논리보다 감정이 앞섰는지
- 반복되는 패턴이 있는지

말투는 차분하고 객관적인 존댓말.
불필요한 칭찬 금지.
근거 없는 희망회로 금지.
현실적으로 피드백한다.
`;
} else if (safeCategory === '기록') {
  systemPrompt = `
너는 사용자의 루틴과 성장을 정리해주는 기록 코치다.
무조건적인 응원보다 사용자의 흐름과 꾸준함을 객관적으로 보여준다.

다음을 중심으로 피드백한다:
- 오늘의 행동 패턴
- 꾸준함 여부
- 흐름의 변화
- 유지하면 좋은 습관

말투는 담백하고 정돈된 존댓말.
부담스러운 자기계발식 말투 금지.
가볍게 다음 흐름을 이어갈 수 있게 도와준다.
`;
} else if (safeCategory === '아이디어') {
  systemPrompt = `
너는 사용자의 생각을 정리하고 확장해주는 창작 파트너다.
무조건 천재적이라고 치켜세우지 않는다.
아이디어의 핵심과 가능성을 현실적으로 분석한다.

다음을 중심으로 피드백한다:
- 아이디어 핵심
- 흥미로운 포인트
- 확장 가능성
- 구체화하면 좋을 부분

말투는 차분하고 센스 있는 존댓말.
과한 리액션 금지.
창작자의 흐름을 끊지 않는 선에서 자연스럽게 피드백한다.
`;
}

    const finalPrompt = `
      ${systemPrompt}
      유저의 글: "${diary}"
      
      위 성격에 완전히 빙의해서 분석하고 피드백을 작성해 주세요.
      ⚠️ 규칙: 반말 절대 금지(존댓말 필수), 전체 조언은 3문장 이내로 짧게 작성, 문장 사이에 자연스럽게 줄바꿈을 넣어서 가독성을 높여주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: finalPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { 
              type: 'STRING', 
              description: '유저의 글을 정갈하게 1문장으로 요약한 내용' 
            },
            feedback: { 
              type: 'STRING', 
              description: '페르소나에 걸맞은 존댓말 기반의 상세한 조언 및 줄바꿈 문장들' 
            },
          },
          required: ['summary', 'feedback'],
        },
      }
    });

    // ✨ 에러가 나던 부분을 깔끔하게 고쳤습니다. () 없이 접근해야 합니다.
    const resText = response.text?.trim() || '';

    if (!resText) {
      return NextResponse.json({ summary: `${safeCategory} 요약 완료`, feedback: 'AI 분석 내용을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
    }

    const parsedJson = JSON.parse(resText);
    
    return NextResponse.json({
      summary: parsedJson.summary?.trim() || `${safeCategory} 요약`,
      feedback: parsedJson.feedback?.trim() || '피드백을 구성하지 못했습니다.'
    });

  } catch (error: any) {
    // 🚨 에러 원인을 추적하기 위한 백엔드 터미널 로그
    console.error('🔥 [ANALYZE_API_ERROR]:', error);
    
    return NextResponse.json({ 
      summary: '기록 요약 완료', 
      feedback: '현재 시스템 파싱 문제 또는 AI 응답 지연으로 기본 저장만 완료되었습니다. 다시 수정하기를 시도해 주세요! ✨' 
    });
  }
}