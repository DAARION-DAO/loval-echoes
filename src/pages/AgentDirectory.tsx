import { Bot, Shield, Brain, Workflow, Calendar, Check, ArrowRight, Download, LogIn, Sparkles, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation, Language } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function AgentDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const agents = [
    {
      name: "Steward Agent",
      badge: t.agentDirectory.stewardBadge,
      icon: Shield,
      color: "text-amber-500",
      borderColor: "border-amber-500/20",
      bgGradient: "from-amber-500/5 to-transparent",
      desc: t.agentDirectory.stewardDesc,
      capabilities: [
        t.agentDirectory.stewardFunc1,
        t.agentDirectory.stewardFunc2,
        t.agentDirectory.stewardFunc3,
        t.agentDirectory.stewardFunc4
      ],
      systemPrompt: t.agentDirectory.stewardPrompt
    },
    {
      name: "RAG Archivist",
      badge: t.agentDirectory.ragBadge,
      icon: Brain,
      color: "text-indigo-500",
      borderColor: "border-indigo-500/20",
      bgGradient: "from-indigo-500/5 to-transparent",
      desc: t.agentDirectory.ragDesc,
      capabilities: [
        t.agentDirectory.ragFunc1,
        t.agentDirectory.ragFunc2,
        t.agentDirectory.ragFunc3,
        t.agentDirectory.ragFunc4
      ],
      systemPrompt: t.agentDirectory.ragPrompt
    },
    {
      name: "Task Organizer",
      badge: t.agentDirectory.taskBadge,
      icon: Workflow,
      color: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      bgGradient: "from-emerald-500/5 to-transparent",
      desc: t.agentDirectory.taskDesc,
      capabilities: [
        t.agentDirectory.taskFunc1,
        t.agentDirectory.taskFunc2,
        t.agentDirectory.taskFunc3,
        t.agentDirectory.taskFunc4
      ],
      systemPrompt: t.agentDirectory.taskPrompt
    },
    {
      name: "Meeting Agent",
      badge: t.agentDirectory.procBadge,
      icon: Calendar,
      color: "text-cyan-500",
      borderColor: "border-cyan-500/20",
      bgGradient: "from-cyan-500/5 to-transparent",
      desc: t.agentDirectory.procDesc,
      capabilities: [
        t.agentDirectory.procFunc1,
        t.agentDirectory.procFunc2,
        t.agentDirectory.procFunc3,
        t.agentDirectory.procFunc4
      ],
      systemPrompt: t.agentDirectory.procPrompt
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.jpg" alt="MicroDAO" className="h-9 w-9 rounded-xl object-cover shadow-md" />
            <span className="font-bold text-lg tracking-tight">MicroDAO</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
              beta
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="text-xs sm:text-sm font-semibold h-9 px-2 sm:px-3 text-primary">
              {t.agentDirectory.navbarAgents}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")} className="text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.agentDirectory.navbarPricing}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/install")} className="text-xs sm:text-sm font-medium gap-1.5 h-9 px-2 sm:px-3">
              <Download className="h-4 w-4" />
              <span className="hidden xxs:inline">{t.agentDirectory.navbarClient}</span>
            </Button>
            
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="h-9 w-[70px] sm:w-[90px] bg-background/50 border-border/30 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">UA</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>

            {user ? (
              <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm font-semibold gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9">
                <span>{t.agentDirectory.panelBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-xs sm:text-sm font-medium gap-1 h-9 px-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden xs:inline">{t.landing.login}</span>
                </Button>
                <Button size="sm" onClick={() => navigate("/auth?signup=true")} className="text-xs sm:text-sm font-semibold gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.agentDirectory.startBtn}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Directory Hero ── */}
      <section className="relative py-16 sm:py-24 text-center overflow-hidden border-b border-border/10">
        <div className="landing-orb absolute top-10 left-[20%] w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-5 right-[20%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px]" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
            {t.agentDirectory.pageTitle}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t.agentDirectory.pageSubtitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.agentDirectory.pageDesc}
          </p>
        </div>
      </section>

      {/* ── Agents Grid ── */}
      <section className="py-20 bg-gradient-to-b from-muted/5 to-muted/15 flex-grow">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {agents.map((agent, index) => (
              <Card 
                key={index} 
                className={`flex flex-col bg-card/30 backdrop-blur-sm border border-border/40 hover:border-primary/30 rounded-2xl overflow-hidden transition-all duration-300 relative group`}
              >
                {/* Subtle gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-b ${agent.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <CardHeader className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <agent.icon className={`h-6 w-6 ${agent.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {agent.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-4">{agent.name}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {agent.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-grow relative z-10 space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest">{t.agentDirectory.labelFuncs}</h4>
                    <ul className="space-y-2">
                      {agent.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2 text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-border/10 pt-4 space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest">{t.agentDirectory.labelPrompt}</h4>
                    <p className="text-xs text-muted-foreground leading-normal bg-muted/30 border p-3 rounded-lg font-mono">
                      "{agent.systemPrompt}"
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 mt-auto relative z-10 border-t border-border/5">
                  {user ? (
                    <Button 
                      onClick={() => navigate("/chats")}
                      className="w-full h-10 font-semibold gap-1.5 border-border/60 hover:bg-primary/10 hover:text-primary transition-all"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t.agentDirectory.btnStartChat}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate("/auth?signup=true")}
                      className="w-full h-10 font-semibold gap-1.5"
                    >
                      {t.agentDirectory.btnCreateSpace}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.jpg" alt="MicroDAO" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-sm text-foreground/80">MicroDAO</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate("/agents")} className="hover:text-foreground transition-colors text-foreground">
              AI Agents Directory
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing Plans
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/install")} className="hover:text-foreground transition-colors">
              DAARION Edge Client
            </button>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/loval-echoes" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (MicroDAO Open Source)
            </a>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://daarion.city/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-foreground/80 font-medium transition-all">
              <img src="/daarion-logo.jpg" alt="DAARION.city" className="h-4 w-4 rounded-sm object-cover" />
              <span>DAARION.city</span>
            </a>
            <span>{t.agentDirectory.footerCopyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
