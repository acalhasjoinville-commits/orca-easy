/**
 * Helpers para o Portal do Cliente.
 * - Monta a URL pública absoluta do orçamento
 * - Monta o link de WhatsApp com mensagem pré-pronta
 * - Sanitiza telefone (apenas dígitos, 10–15 chars)
 */

import { z } from "zod";

const phoneSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .pipe(z.string().min(10).max(15));

/** URL absoluta do portal do cliente para um token. */
export function buildPortalUrl(token: string): string {
  if (typeof window === "undefined") return `/p/o/${token}`;
  return `${window.location.origin}/p/o/${token}`;
}

/** Sanitiza telefone para WhatsApp. Retorna null se inválido. */
export function sanitizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const result = phoneSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/** Monta URL do WhatsApp. Se telefone inválido, abre o WhatsApp sem destinatário. */
export function buildWhatsappUrl(phone: string | null | undefined, message: string): string {
  const clean = sanitizePhone(phone);
  const text = encodeURIComponent(message);
  if (clean) return `https://wa.me/${clean}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}

/** Mensagem padrão para envio do orçamento. */
export function buildShareMessage(opts: {
  empresaNome: string;
  numeroOrcamento: number;
  url: string;
}): string {
  return (
    `Olá! Segue o seu orçamento *Nº ${opts.numeroOrcamento}* da ${opts.empresaNome}.\n\n` +
    `Você pode visualizar, aprovar ou enviar comentários neste link:\n${opts.url}\n\n` +
    `Qualquer dúvida estamos à disposição.`
  );
}
