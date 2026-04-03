import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, LogIn, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginTab = "login" | "signup";

const TAB_COPY: Record<LoginTab, { title: string; description: string; helper: string; button: string }> = {
  login: {
    title: "Entrar no sistema",
    description: "Use seu e-mail e senha para continuar de onde parou.",
    helper: "Se o acesso ainda não funcionar, confirme com um administrador se seu papel já foi liberado.",
    button: "Entrar",
  },
  signup: {
    title: "Criar sua conta",
    description: "Cadastre seus dados para entrar na empresa e depois receber seu acesso.",
    helper: "Depois do cadastro, um administrador precisa definir seu papel antes do primeiro uso.",
    button: "Criar conta",
  },
};

const HIGHLIGHTS = [
  {
    icon: FileText,
    title: "Orçamentos organizados",
    description: "Monte, revise e acompanhe cada proposta com mais clareza.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso controlado",
    description: "Cada pessoa entra com o papel certo para a rotina dela.",
  },
  {
    icon: Users,
    title: "Equipe alinhada",
    description: "Clientes, financeiro e operação no mesmo lugar.",
  },
];

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<LoginTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const currentCopy = useMemo(() => TAB_COPY[tab], [tab]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message, {
        duration: 5000,
      });
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password || !fullName) return;

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.", { duration: 5000 });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      toast.error(error.message, { duration: 5000 });
    } else {
      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.", { duration: 3000 });
      setTab("login");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden overflow-hidden bg-primary p-10 lg:flex lg:w-[500px] lg:flex-col lg:justify-between">
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">
              OC
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">OrçaCalhas</span>
          </div>

          <div className="max-w-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">Plataforma operacional</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              Gestão de orçamentos, clientes e operação em um só lugar
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Uma base mais organizada para acompanhar orçamento, execução, financeiro e atendimento sem depender de
              planilhas soltas.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/70">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} OrçaCalhas</div>

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 top-1/3 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:hidden">
            <div className="mb-1 flex items-center justify-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                OC
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">OrçaCalhas</span>
            </div>
            <p className="text-sm text-muted-foreground">Sistema de gestão para calhas, rufos e operação diária.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Acesso ao sistema</p>
            <h1 className="text-2xl font-bold text-foreground">{currentCopy.title}</h1>
            <p className="text-sm text-muted-foreground">{currentCopy.description}</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="space-y-6 p-6">
              <Tabs value={tab} onValueChange={(value) => setTab(value as LoginTab)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar conta</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">{currentCopy.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currentCopy.helper}</p>
              </div>

              {tab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">E-mail</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      autoFocus
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Senha</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="h-11 w-full font-semibold">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    {currentCopy.button}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nome completo</Label>
                    <Input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Seu nome"
                      autoComplete="name"
                      autoFocus
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">E-mail</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Senha</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs font-medium text-foreground">O que acontece depois do cadastro?</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Sua conta é criada primeiro. Depois, um administrador da empresa precisa liberar o papel certo
                      para você usar o sistema.
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="h-11 w-full font-semibold">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {currentCopy.button}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
