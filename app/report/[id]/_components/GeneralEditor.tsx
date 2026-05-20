'use client';

interface GeneralEditorProps {
  category: string;
  // content, setContent props 제거
}

export default function GeneralEditor({ category }: GeneralEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
        📝 {category} 기록 수정하기
      </h3>
      {/* textarea와 라벨을 삭제하여 Tiptap과 겹치지 않게 합니다. */}
    </div>
  );
}