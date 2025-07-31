
import React, { forwardRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange }, ref) => {
  return (
    <div className="bg-slate-800 rounded-lg h-full flex flex-col">
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        className="w-full h-full p-6 bg-transparent text-slate-300 resize-none focus:outline-none font-mono text-base leading-relaxed"
        placeholder="Start typing your markdown here..."
        spellCheck="false"
      />
    </div>
  );
});
