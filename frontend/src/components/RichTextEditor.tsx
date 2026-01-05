import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const syncValue = () => {
    if (disabled) return;
    const editor = editorRef.current;
    if (!editor) return;
    const textContent = editor.innerText || '';
    const html = editor.innerHTML;
    onChange(textContent.trim().length > 0 ? html : '');
  };

  const exec = (command: string, commandValue?: string) => {
    if (disabled) return;
    document.execCommand(command, false, commandValue);
    syncValue();
    editorRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => exec('bold')} disabled={disabled}>
          Жирный
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec('italic')} disabled={disabled}>
          Курсив
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec('underline')} disabled={disabled}>
          Подчеркнуть
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec('formatBlock', 'H2')} disabled={disabled}>
          Заголовок
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec('insertUnorderedList')} disabled={disabled}>
          Маркеры
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec('insertOrderedList')} disabled={disabled}>
          Нумерация
        </Button>
      </div>
      <div
        ref={editorRef}
        className={`rich-text-input rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2${disabled ? ' opacity-60' : ''}`}
        style={{ minHeight }}
        contentEditable={!disabled}
        onInput={syncValue}
        data-placeholder={placeholder || 'Введите текст...'}
        suppressContentEditableWarning
      />
    </div>
  );
};
