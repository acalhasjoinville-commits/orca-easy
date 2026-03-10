import { useState } from 'react';
import { useClientes } from '@/hooks/useSupabaseData';
import { Cliente } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, Pencil, Trash2, Phone, Loader2, MapPin } from 'lucide-react';

import { ClienteFormModal } from './ClienteFormModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Clientes() {
  const { clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientes();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      toast.success('Cliente removido.');
    } catch {
      toast.error('Erro ao remover cliente.');
    } finally {
      setDeletingId(null);
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="hidden sm:flex bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1.5 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou documento..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/40" />
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
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className={cn(
              "overflow-hidden border-l-4",
              c.tipo === 'PJ' ? 'border-l-accent/60' : 'border-l-primary/40'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
                        c.tipo === 'PJ' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'
                      )}>
                        {c.tipo}
                      </span>
                      <p className="text-sm font-semibold truncate">{c.nomeRazaoSocial}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{c.documento}</span>
                      {c.whatsapp && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.whatsapp}
                        </span>
                      )}
                    </div>
                    {c.cidade && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {c.cidade}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-0.5 ml-3">
                    <button onClick={() => handleEdit(c)} className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50">
                      {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
