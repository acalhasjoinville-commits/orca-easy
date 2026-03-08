import { useEffect, useRef, useState } from 'react';
import { generatePdfFromHtml } from '@/lib/generatePdf';

export default function PrintPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const printedRef = useRef(false);

  const html = sessionStorage.getItem('printHtml') || '';
  const numero = parseInt(sessionStorage.getItem('printNumero') || '0', 10);

  useEffect(() => {
    if (!html) {
      window.location.href = '/';
      return;
    }

    // Inject the template styles into the page head
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const style = doc.querySelector('style');
    if (style) {
      const s = document.createElement('style');
      s.textContent = style.textContent;
      document.head.appendChild(s);
      return () => { document.head.removeChild(s); };
    }
  }, [html]);

  useEffect(() => {
    if (!html || printedRef.current) return;
    printedRef.current = true;

    const timer = setTimeout(() => {
      try {
        window.print();
      } catch {
        setFallback(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [html]);

  useEffect(() => {
    if (fallback && html) {
      generatePdfFromHtml(html, numero);
      goBack();
    }
  }, [fallback, html, numero]);

  const goBack = () => {
    sessionStorage.removeItem('printHtml');
    sessionStorage.removeItem('printNumero');
    window.history.back();
  };

  if (!html) return null;

  // Extract body content from the full HTML
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');
  const bodyHtml = parsed.body.innerHTML;

  return (
    <>
      <style>{`
        @media print { .print-back-btn { display: none !important; } }
        body { margin: 0; padding: 0; background: #fff; }
      `}</style>
      <button
        onClick={goBack}
        className="print-back-btn"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 9999,
          background: '#1B2A4A',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        ← Voltar
      </button>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
