import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OrcamentoPDF } from '@/components/OrcamentoPDF';
import { Orcamento, Cliente, MinhaEmpresa } from '@/lib/types';
import { fetchLogoBase64 } from '@/lib/fetchLogoBase64';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFButtonProps {
  orcamento: Orcamento;
  cliente?: Cliente | null;
  empresa?: MinhaEmpresa | null;
  size?: 'sm' | 'default' | 'icon';
  className?: string;
}

export function PDFDownloadButton({ orcamento, cliente, empresa, size = 'default', className }: PDFButtonProps) {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const corDestaque = empresa?.corDestaque || '#F57C00';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (empresa?.logoUrl) {
        const b64 = await fetchLogoBase64(empresa.logoUrl);
        if (!cancelled) setLogoBase64(b64);
      }
      if (!cancelled) setReady(true);
    };
    load();
    return () => { cancelled = true; };
  }, [empresa?.logoUrl]);

  if (!ready) {
    return (
      <Button size={size} variant="outline" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const fileName = `orcamento-${orcamento.numeroOrcamento || 'novo'}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <OrcamentoPDF
          orcamento={orcamento}
          cliente={cliente}
          empresa={empresa}
          logoBase64={logoBase64}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          size={size}
          className={className}
          style={{ backgroundColor: corDestaque, color: '#fff' }}
          disabled={loading}
          asChild={false}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              {size !== 'icon' && <span className="ml-2">Baixar PDF</span>}
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
