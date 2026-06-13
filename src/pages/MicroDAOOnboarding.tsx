import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  UserPlus, 
  Users, 
  Key, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  LogOut,
  Building,
  UserCheck
} from 'lucide-react';

interface AnswersState {
  name: string;
  type: string;
  description: string;
  mission: string;
  goal_30_days: string;
  values_rules: string;
  agent_name: string;
  tone: string;
  autonomy_level: 'assistant' | 'coordinator' | 'supervised_admin';
  can_invite_guests: boolean;
  can_create_tasks: boolean;
  can_send_welcome_messages: boolean;
  can_create_summaries: boolean;
  can_suggest_roles: boolean;
  member_code: string;
  admin_code: string;
  code_max_uses: number;
  initial_notes: string;
  first_task_title: string;
  first_task_desc: string;
}

const defaultAnswers: AnswersState = {
  name: '',
  type: 'workspace',
  description: '',
  mission: '',
  goal_30_days: '',
  values_rules: '',
  agent_name: '',
  tone: 'warm',
  autonomy_level: 'coordinator',
  can_invite_guests: true,
  can_create_tasks: true,
  can_send_welcome_messages: true,
  can_create_summaries: true,
  can_suggest_roles: true,
  member_code: '',
  admin_code: '',
  code_max_uses: 50,
  initial_notes: '',
  first_task_title: '',
  first_task_desc: ''
};

export default function MicroDAOOnboarding() {
  const { user, signOut } = useAuth();
  const { memberships, refresh, setActiveCommunityId } = useActiveCommunity();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Onboarding modes: 'lobby' | 'wizard'
  const [mode, setMode] = useState<'lobby' | 'wizard'>('lobby');
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersState>(defaultAnswers);

  const agentMessages: Record<number, string> = {
    1: t.onboardingWizard.agentMsg1,
    2: t.onboardingWizard.agentMsg2,
    3: t.onboardingWizard.agentMsg3,
    4: t.onboardingWizard.agentMsg4,
    5: t.onboardingWizard.agentMsg5,
    6: t.onboardingWizard.agentMsg6,
    7: t.onboardingWizard.agentMsg7,
    8: t.onboardingWizard.agentMsg8,
  };

  useEffect(() => {
    setAnswers(prev => ({
      ...prev,
      agent_name: prev.agent_name || t.onboardingWizard.defaultAgentName,
      first_task_title: prev.first_task_title || t.onboardingWizard.defaultFirstTaskTitle,
      first_task_desc: prev.first_task_desc || t.onboardingWizard.defaultFirstTaskDesc,
    }));
  }, [t]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [draftSession, setDraftSession] = useState<any>(null);

  // Redirect unauthenticated users or users who already have communities
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    } else if (memberships.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, memberships, navigate]);

  // Load existing draft setup session on mount
  useEffect(() => {
    const checkDraft = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('community_setup_sessions')
          .select('*')
          .eq('leader_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setDraftSession(data[0]);
        }
      } catch (err) {
        console.error('Error fetching draft session:', err);
      }
    };
    checkDraft();
  }, [user]);

  // Handle invitation code validation
  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: t.onboardingWizard.toastErrorTitle,
        description: t.onboardingWizard.toastEnterInviteCode,
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_community_by_code', {
        p_code: inviteCode.trim().toUpperCase()
      });

      if (error) throw error;

      toast({
        title: t.onboardingWizard.toastJoinSuccessTitle,
        description: t.onboardingWizard.toastJoinSuccessDesc
      });
      
      const newCommId = (data as any).community_id;
      setActiveCommunityId(newCommId);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastJoinErrorTitle,
        description: err.message || t.onboardingWizard.toastJoinErrorDesc
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit Partner application
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerMessage.trim()) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('access_requests')
        .insert({
          user_id: user?.id,
          email: user?.email,
          display_name: user?.user_metadata?.display_name || user?.email,
          use_case: partnerMessage.trim(),
          requested_tier: 'founder',
          status: 'pending'
        });

      if (error) throw error;
      setPartnerSubmitted(true);
      toast({
        title: t.onboardingWizard.toastPartnerSuccessTitle,
        description: t.onboardingWizard.toastPartnerSuccessDesc
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastPartnerErrorTitle,
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Restore Draft
  const handleRestoreDraft = () => {
    if (!draftSession) return;
    const restoredAnswers = { ...defaultAnswers, ...draftSession.answers };
    setAnswers(restoredAnswers);
    setSessionId(draftSession.id);
    const savedStep = parseInt(draftSession.current_step) || 1;
    setStep(savedStep);
    setMode('wizard');
    toast({
      title: t.onboardingWizard.toastDraftRestoredTitle,
      description: t.onboardingWizard.toastDraftRestoredDesc.replace('{step}', savedStep.toString())
    });
  };

  // Save Setup Session Draft
  const handleSaveDraft = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_setup_sessions')
        .upsert({
          id: sessionId || undefined,
          leader_id: user.id,
          current_step: step.toString(),
          status: 'draft',
          answers: answers as any,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        toast({
          title: t.onboardingWizard.toastDraftSavedTitle,
          description: t.onboardingWizard.toastDraftSavedDesc
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastDraftSaveErrorTitle,
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Start fresh setup wizard
  const handleStartSetup = () => {
    setAnswers(defaultAnswers);
    setSessionId(null);
    setStep(1);
    setMode('wizard');
  };

  // Auto-fill codes when name is entered (Step 1 -> Step 6)
  useEffect(() => {
    if (answers.name && !answers.member_code) {
      const prefix = answers.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      setAnswers(prev => ({
        ...prev,
        member_code: `${prefix}-MEMBER-${Math.floor(100 + Math.random() * 900)}`,
        admin_code: `${prefix}-ADMIN-${Math.floor(100 + Math.random() * 900)}`
      }));
    }
  }, [answers.name]);

  // Final Action: Complete creation transaction
  const handleCreateMicroDAO = async () => {
    if (!user) return;
    if (!answers.name.trim()) {
      toast({
        title: t.onboardingWizard.toastStep1ErrorTitle,
        description: t.onboardingWizard.toastStep1ErrorDesc,
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // 1. Call atomic database transaction RPC
      const { data, error: rpcErr } = await supabase.rpc('create_microdao_with_spirit_agent', {
        p_name: answers.name.trim(),
        p_type: answers.type,
        p_description: answers.description.trim() || null,
        p_mission: answers.mission.trim() || null,
        p_goal_30_days: answers.goal_30_days.trim() || null,
        p_values_rules: answers.values_rules.trim() || null,
        p_agent_name: answers.agent_name.trim(),
        p_autonomy_level: answers.autonomy_level,
        p_setup_answers: answers as any,
        p_setup_session_id: sessionId || null
      });

      if (rpcErr) throw rpcErr;
      const { community_id } = data as any;

      // 2. Create custom invitation codes if specified
      if (answers.member_code) {
        await supabase.from('invitation_codes').insert({
          scope: 'community',
          community_id: community_id,
          code: answers.member_code.trim().toUpperCase(),
          role_to_grant: 'member',
          max_uses: answers.code_max_uses || null,
          is_active: true,
          created_by: user.id
        });
      }

      if (answers.admin_code) {
        await supabase.from('invitation_codes').insert({
          scope: 'community',
          community_id: community_id,
          code: answers.admin_code.trim().toUpperCase(),
          role_to_grant: 'admin',
          max_uses: answers.code_max_uses || null,
          is_active: true,
          created_by: user.id
        });
      }

      // 3. Create starter task if title is provided and conversations/projects setup is done
      // Note: We'll create a default "general" conversation for the community first if required,
      // but since project tasks require conversations, we can look up or insert a default one.
      const { data: conv, error: convErr } = await (supabase as any)
        .from('conversations')
        .insert({
          name: t.onboardingWizard.defaultChatName,
          type: 'group',
          community_id: community_id,
          created_by: user.id
        })
        .select()
        .single();

      if (!convErr && conv && answers.first_task_title.trim()) {
        await supabase.from('kanban_cards').insert({
          project_id: conv.id,
          title: answers.first_task_title.trim(),
          description: answers.first_task_desc.trim() || null,
          column_type: 'todo',
          created_by: user.id
        });
      }

      toast({
        title: t.onboardingWizard.toastCreateSuccessTitle,
        description: t.onboardingWizard.toastCreateSuccessDesc.replace('{name}', answers.name).replace('{agentName}', answers.agent_name)
      });

      setActiveCommunityId(community_id);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error creating microdao:', err);
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastCreateErrorTitle,
        description: err.message || t.onboardingWizard.toastCreateErrorDesc
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-indigo-400 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
            DAARION MicroDAO
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-slate-300 hover:text-red-400 gap-2">
            <LogOut className="h-4 w-4" />
            <span>{t.onboardingWizard.exitBtn}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl flex-grow flex items-center justify-center">
        {mode === 'lobby' ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-6 text-left pr-0 lg:pr-4 py-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {t.onboardingWizard.ecosystemTitle}
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                {t.onboardingWizard.ecosystemSubtitle1} <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {t.onboardingWizard.ecosystemSubtitle2}
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t.onboardingWizard.ecosystemDesc}
              </p>

              {draftSession && (
                <Card className="bg-indigo-950/20 border-indigo-500/30 backdrop-blur-md">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Zap className="h-5 w-5 animate-pulse" />
                      <span className="font-semibold text-sm">{t.onboardingWizard.draftFoundTitle}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.onboardingWizard.draftFoundDesc
                        .replace('{step}', draftSession.current_step)
                        .replace('{name}', draftSession.answers?.name || '...')}
                    </p>
                    <Button onClick={handleRestoreDraft} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>{t.onboardingWizard.restoreDraftBtn}</span>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {memberships.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.onboardingWizard.existingCommTitle}
                  </h3>
                  <div className="space-y-2">
                    {memberships.map((m) => (
                      <div 
                        key={m.community_id}
                        onClick={() => {
                          setActiveCommunityId(m.community_id);
                          navigate('/dashboard');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
                            {m.community.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{m.community.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{m.role} • {m.community.type}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side options */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Create Space */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-indigo-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <span>{t.onboardingWizard.createCommTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.onboardingWizard.createCommDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.onboarding.createCommunityDesc}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartSetup} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>{t.onboardingWizard.startCreationBtn}</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 2: Join by Invite Code */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-purple-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-400" />
                    <span>{t.onboardingWizard.joinCommTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.onboardingWizard.joinCommDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder={t.onboardingWizard.joinCommPlaceholder}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-slate-950/80 border-slate-800 focus-visible:ring-purple-500 uppercase tracking-widest text-center"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleJoinByCode} 
                    disabled={loading || !inviteCode.trim()}
                    className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    {loading ? t.onboardingWizard.joiningBtn : t.onboardingWizard.joinBtn}
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 3: Apply for Founder Tier */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-pink-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-400" />
                    <span>{t.onboardingWizard.partnerTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.onboardingWizard.partnerDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerSubmitted ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div className="text-xs font-semibold text-green-300">{t.onboardingWizard.partnerPendingTitle}</div>
                      <p className="text-[10px] text-slate-400 max-w-xs">
                        {t.onboardingWizard.partnerPendingDesc}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePartnerSubmit} className="space-y-3">
                      <Textarea 
                        placeholder={t.onboardingWizard.partnerPlaceholder}
                        value={partnerMessage}
                        onChange={(e) => setPartnerMessage(e.target.value)}
                        className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px]"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !partnerMessage.trim()}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs"
                      >
                        {loading ? t.onboardingWizard.sendingBtn : t.onboardingWizard.sendRequestBtn}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        ) : (
          /* Wizard Setup View */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Community Spirit Agent chat bubbles */}
            <div className="lg:col-span-5 flex flex-col bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-md min-h-[400px]">
              
              {/* Agent Profile Header */}
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {answers.agent_name || t.onboardingWizard.defaultAgentName}
                  </h3>
                  <div className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">
                    {t.onboardingWizard.aiGuide}
                  </div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-6 flex-grow flex flex-col justify-end space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none p-4 shadow-lg text-left max-w-[90%] self-start space-y-3 relative group">
                  <MessageSquare className="h-4 w-4 text-indigo-400 absolute -top-2 -left-2 bg-slate-950 p-0.5 rounded-full border border-indigo-400/20" />
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                    {agentMessages[step] || t.onboardingWizard.defaultStepMsg}
                  </p>
                </div>
                
                {/* Micro animation representation */}
                <div className="flex items-center gap-1.5 self-start pl-2 text-[10px] text-indigo-300">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>{t.onboardingWizard.listening}</span>
                </div>
              </div>

              {/* Autonomy Badge */}
              <div className="p-3 bg-slate-900/30 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400">
                <span>{t.onboardingWizard.autonomy}: <strong className="text-indigo-400 capitalize">{t.onboardingWizard.autonomyLevels[answers.autonomy_level === 'supervised_admin' ? 'admin' : answers.autonomy_level]}</strong></span>
                <span>{t.onboardingWizard.stepOf.replace('{step}', step.toString()).replace('{total}', '8')}</span>
              </div>
            </div>

            {/* Right: Embedded Form Card */}
            <div className="lg:col-span-7 flex flex-col">
              <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl flex-grow flex flex-col justify-between">
                
                <CardHeader className="border-b border-slate-800/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
                      {t.onboardingWizard.stepsTitle[step - 1]}
                    </CardTitle>
                    <span className="text-xs text-slate-500 font-semibold">
                      {Math.round((step / 8) * 100)}% {t.onboardingWizard.completed}
                    </span>
                  </div>
                  <Progress value={(step / 8) * 100} className="h-1 bg-slate-950 mt-2" />
                </CardHeader>

                <CardContent className="pt-6 flex-grow space-y-4 text-left">
                  
                  {/* STEP 1: IDENTITY */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-name" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommName}</Label>
                        <Input 
                          id="comm-name"
                          placeholder={t.onboardingWizard.placeholderCommName}
                          value={answers.name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comm-type" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommType}</Label>
                        <Select 
                          value={answers.type}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, type: val }))}
                        >
                          <SelectTrigger id="comm-type" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder={t.onboardingWizard.placeholderCommType} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="workspace">{t.onboardingWizard.types.workspace}</SelectItem>
                            <SelectItem value="eco-village">{t.onboardingWizard.types.village}</SelectItem>
                            <SelectItem value="dao">{t.onboardingWizard.types.dao}</SelectItem>
                            <SelectItem value="club">{t.onboardingWizard.types.club}</SelectItem>
                            <SelectItem value="charity">{t.onboardingWizard.types.charity}</SelectItem>
                            <SelectItem value="other">{t.onboardingWizard.types.other}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-desc" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommDesc}</Label>
                        <Textarea 
                          id="comm-desc"
                          placeholder={t.onboardingWizard.placeholderCommDesc}
                          value={answers.description}
                          onChange={(e) => setAnswers(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MISSION */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-mission" className="text-xs font-bold text-slate-300">{t.onboarding.labelMission}</Label>
                        <Textarea 
                          id="comm-mission"
                          placeholder={t.onboardingWizard.placeholderCommMission}
                          value={answers.mission}
                          onChange={(e) => setAnswers(prev => ({ ...prev, mission: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-goal" className="text-xs font-bold text-slate-300">{t.onboarding.labelGoal30Days}</Label>
                        <Textarea 
                          id="comm-goal"
                          placeholder={t.onboardingWizard.placeholderCommGoal}
                          value={answers.goal_30_days}
                          onChange={(e) => setAnswers(prev => ({ ...prev, goal_30_days: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VALUES & RULES */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-values" className="text-xs font-bold text-slate-300">{t.onboarding.labelCommunityRules}</Label>
                        <Textarea 
                          id="comm-values"
                          placeholder={t.onboardingWizard.placeholderCommValues}
                          value={answers.values_rules}
                          onChange={(e) => setAnswers(prev => ({ ...prev, values_rules: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[180px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: AGENT PERSONALITY */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent-name" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelAgentName}</Label>
                        <Input 
                          id="agent-name"
                          value={answers.agent_name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, agent_name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-tone" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelAgentTone}</Label>
                        <Select 
                          value={answers.tone}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, tone: val }))}
                        >
                          <SelectTrigger id="agent-tone" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder={t.onboardingWizard.placeholderAgentTone} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="warm">{t.onboardingWizard.tones.warm}</SelectItem>
                            <SelectItem value="philosophical">{t.onboardingWizard.tones.philosophical}</SelectItem>
                            <SelectItem value="technical">{t.onboardingWizard.tones.technical}</SelectItem>
                            <SelectItem value="formal">{t.onboardingWizard.tones.formal}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: AUTONOMY & PERMISSIONS */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">{t.onboardingWizard.autonomyLevelLabel}</Label>
                        <RadioGroup 
                          value={answers.autonomy_level} 
                          onValueChange={(val: any) => setAnswers(prev => ({ ...prev, autonomy_level: val }))}
                          className="grid grid-cols-1 gap-2 pt-1"
                        >
                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="assistant" id="autonomy-assistant" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-assistant" className="font-semibold text-slate-200">{t.onboardingWizard.autonomyLevels.assistant}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.assistantDesc}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-indigo-500/30 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="coordinator" id="autonomy-coordinator" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-coordinator" className="font-semibold text-indigo-300">{t.onboardingWizard.autonomyLevels.coordinator}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.coordinatorDesc}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="supervised_admin" id="autonomy-admin" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-admin" className="font-semibold text-slate-200">{t.onboardingWizard.autonomyLevels.admin}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.adminDesc}</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-bold text-slate-300">{t.onboardingWizard.permissionsLabel}</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-welcome" 
                              checked={answers.can_send_welcome_messages} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_send_welcome_messages: !!checked }))}
                            />
                            <Label htmlFor="perm-welcome" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.welcome}</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-tasks" 
                              checked={answers.can_create_tasks} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_tasks: !!checked }))}
                            />
                            <Label htmlFor="perm-tasks" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.tasks}</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-invites" 
                              checked={answers.can_invite_guests} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_invite_guests: !!checked }))}
                            />
                            <Label htmlFor="perm-invites" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.invites}</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-summaries" 
                              checked={answers.can_create_summaries} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_summaries: !!checked }))}
                            />
                            <Label htmlFor="perm-summaries" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.summaries}</Label>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2.5 items-start text-[10px] text-amber-300 leading-relaxed">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          {t.onboardingWizard.sensitiveActionsWarning}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: INVITES */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-member" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelInviteMember}</Label>
                        <Input 
                          id="invite-member"
                          value={answers.member_code}
                          onChange={(e) => setAnswers(prev => ({ ...prev, member_code: e.target.value.toUpperCase() }))}
                          className="bg-slate-950/80 border-slate-800 font-mono text-center tracking-widest focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invite-admin" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelInviteAdmin}</Label>
                        <Input 
                          id="invite-admin"
                          value={answers.admin_code}
                          onChange={(e) => setAnswers(prev => ({ ...prev, admin_code: e.target.value.toUpperCase() }))}
                          className="bg-slate-950/80 border-slate-800 font-mono text-center tracking-widest focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-uses" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelMaxUses}</Label>
                        <Input 
                          id="max-uses"
                          type="number"
                          value={answers.code_max_uses}
                          onChange={(e) => setAnswers(prev => ({ ...prev, code_max_uses: parseInt(e.target.value) || 1 }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 7: KNOWLEDGE SEED */}
                  {step === 7 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kb-seed" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelKbSeed}</Label>
                        <Textarea 
                          id="kb-seed"
                          placeholder={t.onboardingWizard.placeholderKbSeed}
                          value={answers.initial_notes}
                          onChange={(e) => setAnswers(prev => ({ ...prev, initial_notes: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[180px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 8: FIRST ACTIONS & REVIEW */}
                  {step === 8 && (
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg space-y-2 text-xs text-indigo-200">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-indigo-400" />
                          <span>{t.onboardingWizard.taskPlanningTitle}</span>
                        </span>
                        <div className="space-y-2 pt-1 text-slate-100">
                          <div>
                            <Label htmlFor="task-title" className="text-[10px] text-slate-400">{t.onboardingWizard.taskTitleLabel}</Label>
                            <Input 
                              id="task-title"
                              value={answers.first_task_title}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_title: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs focus-visible:ring-indigo-500 h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-desc" className="text-[10px] text-slate-400">{t.onboardingWizard.taskDescLabel}</Label>
                            <Textarea 
                              id="task-desc"
                              value={answers.first_task_desc}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_desc: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs min-h-[50px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-300">{t.onboardingWizard.configReviewTitle}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-slate-400">
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.name}</span> {answers.name}</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.type}</span> {t.onboardingWizard.types[answers.type as keyof typeof t.onboardingWizard.types] || answers.type}</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.agent}</span> {answers.agent_name} ({t.onboardingWizard.tones[answers.tone as keyof typeof t.onboardingWizard.tones] || answers.tone})</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.autonomy}</span> {t.onboardingWizard.autonomyLevels[answers.autonomy_level === 'supervised_admin' ? 'admin' : answers.autonomy_level]}</div>
                          <div className="col-span-2 truncate"><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.code}</span> {answers.member_code}</div>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>

                <CardFooter className="border-t border-slate-800/50 pt-4 flex justify-between items-center gap-4">
                  <div className="flex gap-2">
                    {step > 1 ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setStep(prev => prev - 1)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                        <span>{t.onboarding.btnPrevStep}</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMode('lobby')}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                        <span>{t.onboardingWizard.lobbyBtn}</span>
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="border-slate-800 text-slate-400 hover:text-slate-200 text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{t.onboardingWizard.draftBtn}</span>
                    </Button>
                  </div>

                  {step < 8 ? (
                    <Button 
                      onClick={() => {
                        if (step === 1 && !answers.name.trim()) {
                          toast({
                            title: t.onboardingWizard.errorNameRequired,
                            description: t.onboardingWizard.errorNameDesc,
                            variant: "destructive"
                          });
                          return;
                        }
                        setStep(prev => prev + 1);
                      }} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                    >
                      <span>{t.onboardingWizard.nextBtn}</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCreateMicroDAO} 
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
                    >
                      {loading ? t.onboarding.btnCompleting : t.onboardingWizard.launchBtn}
                    </Button>
                  )}
                </CardFooter>

              </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
