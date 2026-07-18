'use client';
import { useEffect, useRef } from 'react';

// Lagani WYSIWYG editor (contentEditable) — bez zavisnosti.
// Vraća HTML; backend ga dodatno sanitizuje (sanitize-html) prije upisa.

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const BTN = [
  { cmd: 'bold', label: 'B', title: 'Podebljano', style: { fontWeight: 800 } },
  { cmd: 'italic', label: 'I', title: 'Kurziv', style: { fontStyle: 'italic' as const } },
  { cmd: 'underline', label: 'U', title: 'Podvučeno', style: { textDecoration: 'underline' } },
  { cmd: 'formatBlock', arg: 'h2', label: 'Naslov', title: 'Podnaslov' },
  { cmd: 'formatBlock', arg: 'p', label: '¶', title: 'Običan pasus' },
  { cmd: 'insertUnorderedList', label: '• Lista', title: 'Lista' },
  { cmd: 'insertOrderedList', label: '1. Lista', title: 'Numerisana lista' },
];

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sinhronizuj spoljnu vrijednost (npr. pri "Uredi" ili resetu forme)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  }

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = prompt('Adresa linka (https://...):');
    if (url) exec('createLink', url);
  }

  function addImage() {
    const url = prompt('Direktan link na sliku (https://... .jpg/.png):');
    if (url) exec('insertImage', url);
  }

  const toolBtn = {
    border: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'transparent',
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {BTN.map(b => (
          <button key={b.label} type="button" title={b.title} onClick={() => exec(b.cmd, b.arg)}
            style={{ ...toolBtn, ...(b.style || {}) }}
            className="px-2.5 py-1 rounded-md text-sm hover:text-white transition-colors">
            {b.label}
          </button>
        ))}
        <button type="button" title="Link" onClick={addLink} style={toolBtn}
          className="px-2.5 py-1 rounded-md text-sm hover:text-white transition-colors">🔗 Link</button>
        <button type="button" title="Slika" onClick={addImage} style={toolBtn}
          className="px-2.5 py-1 rounded-md text-sm hover:text-white transition-colors">🖼️ Slika</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder || 'Tekst vijesti...'}
        className="rich-editor px-4 py-3 rounded-lg outline-none min-h-44 focus:border-red-600"
        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
      />
      <style jsx global>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: #777; }
        .rich-editor h2 { font-size: 1.35rem; font-weight: 800; margin: 0.8em 0 0.4em; color: white; }
        .rich-editor p { margin: 0.5em 0; }
        .rich-editor ul { list-style: disc; padding-left: 1.4em; margin: 0.5em 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.4em; margin: 0.5em 0; }
        .rich-editor a { color: #E8546F; text-decoration: underline; }
        .rich-editor img { max-width: 100%; border-radius: 8px; margin: 0.6em 0; }
      `}</style>
    </div>
  );
}
