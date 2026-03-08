import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { OrcamentoPDF } from '@/components/OrcamentoPDF';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { fetchLogoBase64 } from '@/lib/fetchLogoBase64';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PDFButtonProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  size?: 'sm' | 'default' | 'icon';
  className?: string;
}

export function PDFDownloadButton({ orcamento, cliente, empresa, size = 'default', className }: PDFButtonProps) {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const corDestaque = empresa?.corDestaque || '#F57C00';

  useEffect(() => {
    let cancelled = false;
    if (empresa?.logoUrl) {
      fetchLogoBase64(empresa.logoUrl).then((b64) => {
        if (!cancelled) setLogoBase64(b64);
      });
    }
    return () => { cancelled = true; };
  }, [empresa?.logoUrl]);

  const handleShare = async () => {
    if (generating) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 50));

    const buildBlob = async (withLogo: boolean) => {
      return pdf(
        <OrcamentoPDF
          orcamento={orcamento}
          cliente={cliente}
          empresa={empresa}
          logoBase64={withLogo ? logoBase64 : null}
        />
      ).toBlob();
    };

    try {
      let blob: Blob;
      try {
        blob = await buildBlob(Boolean(logoBase64));
      } catch (firstError) {
        if (!logoBase64) throw firstError;
        console.warn('Falha ao renderizar PDF com logo, tentando sem logo.', firstError);
        blob = await buildBlob(false);
      }

      const fileName = `orcamento-${orcamento.numeroOrcamento || 'novo'}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // Try Web Share API (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Orçamento OrçaCalhas',
          text: 'Segue o orçamento solicitado.',
        });
      } else {
        // Fallback: open in new tab (desktop)
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (err: any) {
      // User cancelling share is not an error
      if (err?.name === 'AbortError') return;
      console.error('Erro ao gerar/enviar PDF:', err);
      toast({ title: 'Erro ao gerar PDF', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      style={{ backgroundColor: corDestaque, color: '#fff' }}
      disabled={generating}
      onClick={(e) => { e.stopPropagation(); handleShare(); }}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {size !== 'icon' && <span className="ml-2">Gerando...</span>}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Enviar Orçamento</span>}
        </>
      )}
    </Button>
  );
}
