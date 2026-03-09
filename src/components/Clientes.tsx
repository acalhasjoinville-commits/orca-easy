import { useState } from 'react';
import { useClientes } from '@/hooks/useSupabaseData';
import { Cliente } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, Pencil, Trash2, Phone, Loader2 } from 'lucide-react';

import { ClienteFormModal } from './ClienteFormModal';
import { toast } from 'sonner';

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
        toast.success('Cliente atualizado!');
      } else {
        await addCliente.mutateAsync(c);
        toast.success('Cliente cadastrado!');
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error('Erro ao salvar cliente.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCliente.mutateAsync(id);
      toast.success('Cliente removido.');
    } catch {
      toast.error('Erro ao remover cliente.');
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
    <div className="px-4 pb-24 pt-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua base de clientes</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou documento..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold text-muted-foreground">
            {clientes.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado'}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {clientes.length === 0 ? 'Cadastre seu primeiro cliente para começar.' : 'Tente outra busca.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                        {c.tipo}
                      </span>
                      <p className="text-sm font-semibold truncate">{c.nomeRazaoSocial}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.documento}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{c.whatsapp}</p>
                    </div>
                    {c.cidade && <p className="text-xs text-muted-foreground mt-0.5">{c.cidade}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => handleEdit(c)} className="text-muted-foreground hover:text-primary p-1">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <button onClick={() => { setEditing(null); setModalOpen(true); }}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors">
        <Plus className="h-6 w-6" />
      </button>

      <ClienteFormModal key={editing?.id ?? 'new'} open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave} editing={editing} />
    </div>
  );
}
