'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
// 경로 문제 방지를 위해 직접 생성합니다
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TiptapEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // 스토리지 업로드
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file);
      
      if (error) throw error;

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(fileName);
      editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
      
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 min-h-[300px] bg-white">
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} 
        />
      </div>
      <div className="prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}