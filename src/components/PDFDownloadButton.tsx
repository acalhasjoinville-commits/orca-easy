import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { OrcamentoPDF } from '@/components/OrcamentoPDF';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { fetchLogoBase64 } from '@/lib/fetchLogoBase64';
import { FileDown, Loader2 } from 'lucide-react';
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

  const handleDownload = async () => {
    if (generating) return;

    const popup = window.open('about:blank', '_blank');
    setGenerating(true);

    // Yield to UI thread so spinner renders before heavy PDF work
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

      const url = URL.createObjectURL(blob);
      const fileName = `orcamento-${orcamento.numeroOrcamento || 'novo'}.pdf`;

      if (popup && !popup.closed) {
        popup.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      console.error('Erro ao gerar PDF:', err);
      toast({ title: 'Erro ao gerar PDF', description: 'Tente novamente. Se persistir, gere sem logo.', variant: 'destructive' });
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
      onClick={(e) => { e.stopPropagation(); handleDownload(); }}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {size !== 'icon' && <span className="ml-2">Gerando...</span>}
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Baixar PDF</span>}
        </>
      )}
    </Button>
  );
}
