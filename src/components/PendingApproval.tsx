import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PendingApproval() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 text-center space-y-4">
          <Clock className="h-16 w-16 text-accent mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Aguardando Aprovação</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta <span className="font-medium text-foreground">{user?.email}</span> foi criada
            com sucesso, mas ainda não possui um papel de acesso atribuído.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o administrador do sistema para que ele atribua seu papel (admin, vendedor ou financeiro).
          </p>
          <Button variant="outline" onClick={signOut} className="w-full mt-4">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
