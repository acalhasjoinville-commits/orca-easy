import type { PortalPayload } from "@/hooks/useShareLink";

interface Props {
  empresa: PortalPayload["empresa"];
}

export function PortalHeader({ empresa }: Props) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:py-4">
        {empresa.logo_url ? (
          <img
            src={empresa.logo_url}
            alt={empresa.nome_fantasia}
            className="h-10 w-10 rounded-md object-contain sm:h-12 sm:w-12"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground sm:h-12 sm:w-12"
            aria-hidden
          >
            {empresa.nome_fantasia.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
            {empresa.nome_fantasia}
          </h1>
          {empresa.slogan ? (
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{empresa.slogan}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
