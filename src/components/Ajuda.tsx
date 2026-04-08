import { useMemo, useState } from "react";
import { HelpCircle, Loader2, Search } from "lucide-react";
import { useFaqPublic } from "@/hooks/useFaq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Ajuda() {
  const { data: faqs = [], isLoading } = useFaqPublic();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const categorias = useMemo(() => {
    const values = Array.from(new Set(faqs.map((item) => item.categoria.trim()).filter(Boolean)));
    return ["Todas", ...values];
  }, [faqs]);

  const filtered = useMemo(() => {
    const query = normalize(search.trim());

    return faqs.filter((item) => {
      const matchCategory = categoria === "Todas" || item.categoria === categoria;
      const haystack = normalize(`${item.pergunta} ${item.resposta} ${item.categoria}`);
      const matchSearch = !query || haystack.includes(query);
      return matchCategory && matchSearch;
    });
  }, [faqs, search, categoria]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4 space-y-4">
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Central de Ajuda</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Encontre respostas rápidas sobre orçamento, agenda, follow-up, financeiro e configurações do sistema.
              </p>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por pergunta, resposta ou categoria..."
              className="pl-9"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {categorias.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={categoria === item ? "default" : "outline"}
                onClick={() => setCategoria(item)}
                className="h-8 rounded-full px-3 text-xs"
              >
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Perguntas frequentes</p>
              <p className="text-xs text-muted-foreground">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/25" />
              <p className="text-sm font-medium text-foreground">Nenhuma FAQ encontrada</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Tente ajustar a busca ou trocar a categoria para encontrar o conteúdo que você precisa.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left text-sm">{item.pergunta}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                        {item.categoria}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.resposta}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Ajuda;
