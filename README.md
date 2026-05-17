# 🧠 MindLog - AI 감성 리포트 달력 일기장

> **Gemini AI와 Supabase를 연동하여 하루의 감정을 기록하고 분석받는 프라이빗 웹 서비스**
> 
> 투박한 일기장을 넘어 사용자의 감정을 따뜻하게 위로하고, 날짜별 기록을 모아볼 수 있는 모던한 모바일 중심의 웹 애플리케이션입니다.

---

## ✨ 주요 기능 (Key Features)

* **📝 AI 일기 분석**: 오늘 하루 있었던 일을 편하게 작성하면, Gemini AI가 핵심 내용을 **2줄 요약**해 줍니다.
* **🌸 마음 테라피 피드백**: 작성된 감정에 공감하고 위로를 전하는 맞춤형 **심리 상담 피드백**을 제공합니다.
* **📊 마음 아카이브 (리포트 달력)**: 그동안 작성한 일기 기록들을 데이터베이스에서 싹 긁어와 날짜별 카드 형태로 모아볼 수 있습니다.
* **📱 모던 모바일 UI**: 깔끔하고 부드러운 라운드 처리와 세련된 그림자 효과를 적용한 보급형 앱 스타일 디자인.

---

## 🛠️ 사용 기술 (Tech Stack)

* **Frontend**: `Next.js 14 (App Router)`, `React`, `TypeScript`
* **Backend**: `Next.js Route Handlers (API)`
* **AI Engine**: `Google Gemini AI API (@google/generative-ai)`
* **Database**: `Supabase (PostgreSQL)`
* **Package Manager**: `pnpm`

---

## 🚀 시작 가이드 (Getting Started)

### 1. 환경 변수 세팅 (`.env.local`)
프로젝트 루트 위치에 `.env.local` 파일을 생성하고 아래 키 값을 입력해야 작동합니다.
(※ 보안을 위해 이 파일은 GitHub에 업로드되지 않습니다.)

```text
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
