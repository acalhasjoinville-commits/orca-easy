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

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image/')) {
      console.warn('Falha ao carregar logo para PDF: arquivo não é imagem válida.');
      return null;
    }

    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Falha ao converter logo em base64 para PDF.', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

