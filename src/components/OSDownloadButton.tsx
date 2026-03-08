import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { OrdemServicoPDF } from '@/components/OrdemServicoPDF';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { fetchLogoBase64 } from '@/lib/fetchLogoBase64';
import { usePoliticas } from '@/hooks/useSupabaseData';
import { ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface OSButtonProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  size?: 'sm' | 'default' | 'icon';
  className?: string;
}

export function OSDownloadButton({ orcamento, cliente, empresa, size = 'default', className }: OSButtonProps) {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { politicas } = usePoliticas();

  // Get the first politica's termoRecebimentoOs as default
  const termoRecebimento = politicas.length > 0 ? politicas[0].termoRecebimentoOs : '';

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
        <OrdemServicoPDF
          orcamento={orcamento}
          cliente={cliente}
          empresa={empresa}
          logoBase64={withLogo ? logoBase64 : null}
          termoRecebimento={termoRecebimento}
        />
      ).toBlob();
    };

    try {
      let blob: Blob;
      try {
        blob = await buildBlob(Boolean(logoBase64));
      } catch (firstError) {
        if (!logoBase64) throw firstError;
        console.warn('Falha ao renderizar OS com logo, tentando sem logo.', firstError);
        blob = await buildBlob(false);
      }

      const nomeCliente = (cliente?.nomeRazaoSocial || orcamento.nomeCliente || 'Cliente')
        .trim().replace(/\s+/g, '_');
      const nomeArquivo = `OS_${orcamento.numeroOrcamento || 'novo'}_${nomeCliente}.pdf`;
      const file = new File([blob], nomeArquivo, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ordem de Serviço',
          text: 'Segue a Ordem de Serviço para execução.',
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Erro ao gerar/enviar OS:', err);
      toast({ title: 'Erro ao gerar OS', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      size={size}
      variant="outline"
      className={className}
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
          <ClipboardList className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Gerar OS</span>}
        </>
      )}
    </Button>
  );
}
