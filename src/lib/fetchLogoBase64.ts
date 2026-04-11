export type PdfLogoKind = "icon" | "lockup";

export interface PdfLogoAsset {
  dataUrl: string;
  width: number;
  height: number;
  kind: PdfLogoKind;
}

function inferPdfLogoKind(width: number, height: number): PdfLogoKind {
  if (!width || !height) return "lockup";
  return width / height >= 1.8 ? "lockup" : "icon";
}

async function blobToDataUrl(blob: Blob): Promise<string | null> {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

function parseSvgDimension(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractSvgSize(svgContent: string): { width: number; height: number } {
  const widthMatch = svgContent.match(/\bwidth=["']([^"']+)["']/i);
  const heightMatch = svgContent.match(/\bheight=["']([^"']+)["']/i);
  const viewBoxMatch = svgContent.match(/\bviewBox=["']([^"']+)["']/i);

  const width = parseSvgDimension(widthMatch?.[1]);
  const height = parseSvgDimension(heightMatch?.[1]);

  if (width > 0 && height > 0) {
    return { width, height };
  }

  if (!viewBoxMatch?.[1]) {
    return { width: 0, height: 0 };
  }

  const parts = viewBoxMatch[1]
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part));

  if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
    return { width: parts[2], height: parts[3] };
  }

  return { width: 0, height: 0 };
}

async function svgBlobToAsset(blob: Blob): Promise<PdfLogoAsset | null> {
  const [dataUrl, svgContent] = await Promise.all([blobToDataUrl(blob), blob.text()]);
  if (!dataUrl) return null;

  const { width, height } = extractSvgSize(svgContent);
  return {
    dataUrl,
    width,
    height,
    kind: inferPdfLogoKind(width, height),
  };
}

async function rasterBlobToAsset(blob: Blob): Promise<PdfLogoAsset | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    const dataUrl = await blobToDataUrl(blob);
    return dataUrl ? { dataUrl, width: 0, height: 0, kind: "lockup" } : null;
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = objectUrl;
    });

    if (!image) {
      const dataUrl = await blobToDataUrl(blob);
      return dataUrl ? { dataUrl, width: 0, height: 0, kind: "lockup" } : null;
    }

    const width = image.naturalWidth || image.width || 0;
    const height = image.naturalHeight || image.height || 0;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const dataUrl = await blobToDataUrl(blob);
      return dataUrl ? { dataUrl, width, height, kind: inferPdfLogoKind(width, height) } : null;
    }

    ctx.drawImage(image, 0, 0);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width,
      height,
      kind: inferPdfLogoKind(width, height),
    };
  } catch {
    const dataUrl = await blobToDataUrl(blob);
    return dataUrl ? { dataUrl, width: 0, height: 0, kind: "lockup" } : null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function fetchPdfLogoAsset(url: string): Promise<PdfLogoAsset | null> {
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.warn(`Falha ao carregar logo para PDF: HTTP ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image/")) {
      console.warn("Falha ao carregar logo para PDF: arquivo nao e imagem valida.");
      return null;
    }

    const blob = await res.blob();
    if (contentType.includes("image/svg")) {
      return svgBlobToAsset(blob);
    }

    return rasterBlobToAsset(blob);
  } catch (error) {
    console.warn("Falha ao converter logo para PDF.", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
