async function blobToDataUrl(blob: Blob): Promise<string | null> {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function rasterBlobToPngDataUrl(blob: Blob): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return blobToDataUrl(blob);
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = objectUrl;
    });

    if (!image) return blobToDataUrl(blob);

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return blobToDataUrl(blob);

    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return blobToDataUrl(blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function fetchLogoBase64(url: string): Promise<string | null> {
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
      return blobToDataUrl(blob);
    }

    return rasterBlobToPngDataUrl(blob);
  } catch (error) {
    console.warn("Falha ao converter logo em base64 para PDF.", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
