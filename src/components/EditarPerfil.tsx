import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Lock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface EditarPerfilProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarPerfil({ open, onOpenChange }: EditarPerfilProps) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [fullName, setFullName] = useState('');
  const [nameLoaded, setNameLoaded] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Sync name from profile on first load
  if (profile && !nameLoaded) {
    setFullName(profile.full_name || '');
    setNameLoaded(true);
  }

  // Reset when sheet closes
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setNameLoaded(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    onOpenChange(v);
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Nome atualizado!');
    } catch {
      toast.error('Erro ao salvar nome.');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Senha alterada com sucesso!');
    } catch {
      toast.error('Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Name section */}
          <div className="space-y-3">
            <Label htmlFor="profile-name" className="text-sm font-medium">Nome</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <Input value={profile?.email || user?.email || ''} disabled className="bg-muted" />
            <Button onClick={handleSaveName} disabled={savingName} size="sm">
              {savingName && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Salvar Nome
            </Button>
          </div>

          <Separator />

          {/* Password section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Alterar Senha</Label>
            </div>
            <Input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword} size="sm">
              {savingPassword && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Alterar Senha
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
