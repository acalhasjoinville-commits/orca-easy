import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = 'Você não tem permissão para acessar esta área.' }: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-6 text-center space-y-3">
          <ShieldAlert className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
