import { useMemo, useState } from "react";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFaqPublic } from "@/hooks/useFaq";

const normalize = (v: string) =>
  (v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function Ajuda() {
  const { data: faqs, isLoading } = useFaqPublic();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");

  const categories = useMemo(() => {
    if (!faqs?.length) return [];
    const set = new Set(faqs.map((f) => f.categoria));
    return Array.from(set).sort();
  }, [faqs]);

  const filtered = useMemo(() => {
    if (!faqs) return [];
    const q = normalize(search);
    return faqs.filter((f) => {
      if (catFilter !== "Todos" && f.categoria !== catFilter) return false;
      if (!q) return true;
      return normalize(f.pergunta).includes(q) || normalize(f.resposta).includes(q) || normalize(f.categoria).includes(q);
    });
  }, [faqs, search, catFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Central de Ajuda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontre respostas rápidas sobre o funcionamento do sistema.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por palavra-chave..."
          className="pl-9"
        />
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCatFilter("Todos")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              catFilter === "Todos"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                catFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {faqs?.length === 0
                ? "Nenhuma pergunta cadastrada ainda."
                : "Nenhuma pergunta encontrada para esta busca."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {filtered.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-xl border bg-card px-4"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">
                <div className="flex items-start gap-3 pr-4">
                  <span className="flex-1">{faq.pergunta}</span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {faq.categoria}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {faq.resposta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
