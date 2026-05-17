//일반 수정 폼 전용 컴포넌트

'use client';

interface GeneralEditorProps {
  category: string;
  content: string;
  setContent: (val: string) => void;
}

export default function GeneralEditor({ category, content, setContent }: GeneralEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>📝 {category} 기록 수정하기</h3>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>내용 수정</label>
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', height: '200px', padding: '16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', lineHeight: '1.6', resize: 'none', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>
    </div>
  );
}