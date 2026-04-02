import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EmpresaSuspensa() {
  const { user, signOut, empresaStatus } = useAuth();
  const isBloqueada = empresaStatus === 'bloqueada';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-xl font-bold text-foreground">
            {isBloqueada ? 'Conta Bloqueada' : 'Conta Suspensa'}
          </h1>
          <p className="text-sm text-muted-foreground">
            A empresa vinculada à sua conta <span className="font-medium text-foreground">{user?.email}</span>{' '}
            está {isBloqueada ? 'bloqueada' : 'suspensa'}.
          </p>
          <p className="text-sm text-muted-foreground">
            {isBloqueada
              ? 'Entre em contato com o suporte da plataforma para mais informações.'
              : 'Entre em contato com o administrador da plataforma para reativação.'}
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
