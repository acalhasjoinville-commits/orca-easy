import { useState } from 'react';
import { useClientes } from '@/hooks/useSupabaseData';
import { Cliente } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, Loader2, Phone, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ClienteFormModal } from './ClienteFormModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function Clientes() {
  const { clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientes();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const isMobile = useIsMobile();

  const filtered = clientes.filter(c =>
    c.nomeRazaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search)
  );

  const handleSave = async (c: Cliente) => {
    try {
      if (editing) {
        await updateCliente.mutateAsync(c);
        toast.success('Cliente atualizado!', { duration: 2500 });
      } else {
        await addCliente.mutateAsync(c);
        toast.success('Cliente cadastrado!', { duration: 2500 });
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error('Erro ao salvar cliente.', { duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteCliente.mutateAsync(id);
      toast.success('Cliente removido.', { duration: 2500 });
    } catch {
      toast.error('Erro ao remover cliente.', { duration: 5000 });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (c: Cliente) => {
    setEditing(c);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-24 lg:pb-8 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clientes.length > 0 ? `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}` : 'Gerencie sua base de clientes'}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}
          size="sm" className="hidden sm:flex bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1.5 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou documento..." className="pl-9 h-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            {clientes.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado'}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {clientes.length === 0 ? 'Cadastre seu primeiro cliente para começar.' : 'Tente outra busca.'}
          </p>
          {clientes.length === 0 && (
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}
              className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-1.5 h-4 w-4" /> Novo Cliente
            </Button>
          )}
        </div>
      ) : !isMobile ? (
        /* Desktop: Table */
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] text-muted-foreground">
                  <th className="py-2.5 px-3 font-medium w-12">Tipo</th>
                  <th className="py-2.5 px-3 font-medium">Nome / Razão Social</th>
                  <th className="py-2.5 px-3 font-medium w-36">Documento</th>
                  <th className="py-2.5 px-3 font-medium w-36">WhatsApp</th>
                  <th className="py-2.5 px-3 font-medium w-32">Cidade</th>
                  <th className="py-2.5 px-3 font-medium w-10 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                        c.tipo === 'PJ' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'
                      )}>
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium truncate max-w-[250px]">{c.nomeRazaoSocial}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.documento}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.whatsapp || '—'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.cidade || '—'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                          <DropdownMenuItem onClick={() => handleEdit(c)} className="text-xs gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="text-xs gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        /* Mobile: Cards */
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id} className={cn(
              "overflow-hidden border-l-4",
              c.tipo === 'PJ' ? 'border-l-accent/60' : 'border-l-primary/40'
            )}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                        c.tipo === 'PJ' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'
                      )}>
                        {c.tipo}
                      </span>
                      <p className="text-sm font-medium truncate">{c.nomeRazaoSocial}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>{c.documento}</span>
                      {c.whatsapp && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.whatsapp}
                        </span>
                      )}
                      {c.cidade && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.cidade}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[120px]">
                      <DropdownMenuItem onClick={() => handleEdit(c)} className="text-xs gap-2">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="text-xs gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o cliente <strong>{deleteTarget?.nomeRazaoSocial}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAB for mobile */}
      <button onClick={() => { setEditing(null); setModalOpen(true); }}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors sm:hidden">
        <Plus className="h-6 w-6" />
      </button>

      <ClienteFormModal key={editing?.id ?? 'new'} open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave} editing={editing} />
    </div>
  );
}
