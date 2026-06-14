/**
 * Sprint F3 — Telegram Link Component
 * 
 * Manual Telegram username entry for MVP.
 * Bot verification is F3B (placeholder button shown).
 */

import { useState, useEffect } from 'react';
import { 
  Send, 
  Check, 
  Bot,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';

interface TelegramLinkProps {
  currentUsername?: string | null;
  onSaved?: (username: string) => void;
}

export const TelegramLink = ({ currentUsername, onSaved }: TelegramLinkProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [username, setUsername] = useState(currentUsername || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  const sanitizeUsername = (input: string): string => {
    // Remove @ prefix if present, trim whitespace
    let cleaned = input.trim();
    if (cleaned.startsWith('@')) {
      cleaned = cleaned.slice(1);
    }
    // Only allow valid Telegram username characters
    return cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  };

  const handleSave = async () => {
    if (!user) return;

    const sanitized = sanitizeUsername(username);
    if (!sanitized || sanitized.length < 5) {
      setError('Username must be at least 5 characters');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_username: sanitized,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        // Column may not exist yet — show warning but keep local state
        console.warn('[TelegramLink] Could not save to profile (column may not exist):', updateError.message);
        setError('Saved locally only — database column not yet available');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved?.(sanitized);
    } catch (err) {
      console.error('[TelegramLink] Save error:', err);
      setError('Failed to save Telegram username');
    } finally {
      setSaving(false);
    }
  };

  const status = currentUsername
    ? 'manual'
    : 'not_linked';

  const statusBadge = () => {
    switch (status) {
      case 'manual':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-bold">
            {t.identity.telegramStatusManual}
          </Badge>
        );
      case 'not_linked':
        return (
          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[9px] uppercase font-bold">
            {t.identity.telegramStatusNotLinked}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-slate-800/60 bg-slate-900/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Send className="h-4 w-4 text-sky-400" />
            {t.identity.telegramTitle}
          </CardTitle>
          {statusBadge()}
        </div>
        <CardDescription className="text-xs text-slate-400">
          {t.identity.telegramDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Username input */}
        <div className="space-y-2">
          <Label htmlFor="telegram-username" className="text-xs text-slate-300">
            {t.identity.telegramUsername}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <Input
                id="telegram-username"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.startsWith('@') ? e.target.value.slice(1) : e.target.value;
                  setUsername(val);
                  setSaved(false);
                  setError(null);
                }}
                placeholder="username"
                className="pl-7 bg-slate-950/50 border-slate-700/50 text-sm"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !username.trim()}
              size="sm"
              className={`min-w-[80px] ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-sky-600 hover:bg-sky-500'
              } text-white`}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {t.identity.telegramSaved}
                </>
              ) : (
                t.identity.telegramSave
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Bot verification placeholder (F3B) */}
        <div className="pt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="text-xs border-slate-700/50 text-slate-500 w-full"
                >
                  <Bot className="h-3.5 w-3.5 mr-1.5" />
                  {t.identity.telegramVerifyBot}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{t.identity.telegramVerifyBotTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
