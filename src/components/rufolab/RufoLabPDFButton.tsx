// RufoLab — Botão de gerar PDF técnico da obra (download/share).
// Lazy import do gerador para não inflar o bundle inicial.
import { useEffect, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { fetchPdfLogoAsset, type PdfLogoAsset } from "@/lib/fetchLogoBase64";
import { useEmpresa } from "@/hooks/useSupabaseData";
import type { RufoLabPiece, RufoLabProject } from "@/lib/rufolab/types";

interface Props {
  project: RufoLabProject;
  pieces: RufoLabPiece[];
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function RufoLabPDFButton({ project, pieces, size = "default", className }: Props) {
  const { empresa } = useEmpresa();
  const [logoAsset, setLogoAsset] = useState<PdfLogoAsset | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (empresa?.logoUrl) {
      fetchPdfLogoAsset(empresa.logoUrl).then((asset) => {
        if (!cancelled) setLogoAsset(asset);
      });
    } else {
      setLogoAsset(null);
    }
    return () => {
      cancelled = true;
    };
  }, [empresa?.logoUrl]);

  const handleClick = async () => {
    if (generating) return;
    if (pieces.length === 0) {
      toast({
        title: "Adicione peças à obra",
        description: "A ficha técnica precisa de pelo menos uma peça.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 30));

    try {
      const [{ pdf }, { RufoLabPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/rufolab/RufoLabPDF"),
      ]);

      const buildBlob = async (withLogo: boolean) =>
        pdf(
          <RufoLabPDF
            project={project}
            pieces={pieces}
            empresa={empresa}
            logo={withLogo ? logoAsset : null}
          />,
        ).toBlob();

      let blob: Blob;
      try {
        blob = await buildBlob(Boolean(logoAsset));
      } catch (firstError) {
        if (!logoAsset) throw firstError;
        console.warn("Falha ao renderizar PDF com logo, tentando sem logo.", firstError);
        blob = await buildBlob(false);
      }

      const slug = (project.nome || "obra").trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
      const nomeArquivo = `RufoLab_${slug}.pdf`;
      const file = new File([blob], nomeArquivo, { type: "application/pdf" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Ficha técnica RufoLab",
          text: `Ficha técnica da obra ${project.nome}.`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Erro ao gerar PDF RufoLab:", err);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      variant="outline"
      disabled={generating}
      onClick={handleClick}
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {size !== "icon" && <span className="ml-2">{generating ? "Gerando..." : "Ficha técnica (PDF)"}</span>}
    </Button>
  );
}
