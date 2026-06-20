import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Laptop,
  Link2,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  buildDeviceSetupPathFromPairingCode,
  createDevicePairingInvitation,
  getDeviceConnectionStatus,
  type DeviceConnectionStatusView,
} from '@/services/deviceConnection';

interface DeviceConnectionCardProps {
  userId: string | null | undefined;
  communityId: string | null | undefined;
  communityName: string | null | undefined;
  membershipRole: string | null | undefined;
  onOpenDeviceSetup: (installPath: string) => void;
  labels: {
    eyebrow: string;
    title: string;
    status: string;
    statusLoading: string;
    statusInviteCreated: string;
    statusConnected: string;
    statusNeedsAttention: string;
    statusBlocked: string;
    description: string;
    contextReady: string;
    backendReady: string;
    backendPending: string;
    inviteReady: string;
    dashboardAvailable: string;
    primaryCta: string;
    setupRequiredCta: string;
    continueSetupCta: string;
    refreshCta: string;
    copyCodeCta: string;
    codeCopied: string;
    codeLabel: string;
    expiresLabel: string;
    helper: string;
    loadError: string;
    createError: string;
    backendNotConfigured: string;
  };
}

function statusLabel(status: DeviceConnectionStatusView | null, loading: boolean, labels: DeviceConnectionCardProps['labels']) {
  if (loading) return labels.statusLoading;
  if (!status) return labels.status;

  if (status.dashboard_state === 'blocked') return labels.statusBlocked;
  if (status.dashboard_state === 'invite_created') return labels.statusInviteCreated;
  if (['online', 'degraded', 'maintenance', 'device_ready'].includes(status.dashboard_state)) {
    return labels.statusConnected;
  }
  if (['offline', 'contract_invalid', 'version_mismatch', 'pairing_required'].includes(status.dashboard_state)) {
    return labels.statusNeedsAttention;
  }
  return labels.status;
}

function formatExpiry(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function unavailableStatus(
  communityId: string,
  membershipRole: string | null | undefined,
  message: string,
): DeviceConnectionStatusView {
  return {
    ok: false,
    community_id: communityId,
    dashboard_state: 'blocked',
    pairing_status: 'not_paired',
    health_state: 'not_checked',
    genesis_status: 'not_started',
    readiness_state: 'blocked',
    purpose: 'standard_device',
    membership_role: membershipRole || 'member',
    next_action: 'wait_for_device_connection_setup',
    backend_profile_configured: false,
    message,
  };
}

function isSetupRequiredStatus(status: DeviceConnectionStatusView | null) {
  return (
    status?.backend_profile_configured === false ||
    status?.next_action === 'wait_for_backend_profile'
  );
}

export function DeviceConnectionCard({
  userId,
  communityId,
  communityName,
  membershipRole,
  onOpenDeviceSetup,
  labels,
}: DeviceConnectionCardProps) {
  const [status, setStatus] = useState<DeviceConnectionStatusView | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContext = Boolean(userId && communityId && communityName);
  const pairingCode = status?.pairing_code || null;
  const expiresAt = useMemo(() => formatExpiry(status?.expires_at), [status?.expires_at]);
  const setupRequired = isSetupRequiredStatus(status);
  const blocked = status?.dashboard_state === 'blocked' || setupRequired;

  const loadStatus = async () => {
    if (!communityId) return;

    setLoading(true);
    setError(null);
    try {
      const nextStatus = await getDeviceConnectionStatus({ communityId });
      setStatus(nextStatus);
    } catch {
      setStatus(unavailableStatus(communityId, membershipRole, labels.backendNotConfigured));
      setError(labels.backendNotConfigured);
      toast({
        title: labels.backendNotConfigured,
        description: labels.backendNotConfigured,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!communityId) {
      setStatus(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    getDeviceConnectionStatus({ communityId })
      .then((nextStatus) => {
        if (active) setStatus(nextStatus);
      })
      .catch(() => {
        if (!active) return;
        setStatus(unavailableStatus(communityId, membershipRole, labels.backendNotConfigured));
        setError(labels.backendNotConfigured);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [communityId, labels.backendNotConfigured, membershipRole]);

  const openPairingCode = (code: string) => {
    onOpenDeviceSetup(buildDeviceSetupPathFromPairingCode(code));
  };

  const handleCreateInvite = async () => {
    if (!communityId || !hasContext) return;

    if (pairingCode) {
      openPairingCode(pairingCode);
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const nextStatus = await createDevicePairingInvitation({
        communityId,
        deviceLabel: communityName ? `${communityName} device` : null,
      });
      setStatus(nextStatus);

      if (nextStatus.ok && nextStatus.pairing_code) {
        openPairingCode(nextStatus.pairing_code);
        return;
      }

      const message = isSetupRequiredStatus(nextStatus)
        ? labels.backendNotConfigured
        : nextStatus.message || labels.backendNotConfigured;
      setError(message);
      toast({
        title: labels.createError,
        description: message,
        variant: 'destructive',
      });
    } catch {
      setStatus(unavailableStatus(communityId, membershipRole, labels.backendNotConfigured));
      setError(labels.backendNotConfigured);
      toast({
        title: labels.backendNotConfigured,
        description: labels.backendNotConfigured,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyPairingCode = async () => {
    if (!pairingCode) return;

    try {
      await navigator.clipboard.writeText(pairingCode);
      toast({ title: labels.codeCopied });
    } catch (copyErr: unknown) {
      toast({
        title: labels.createError,
        description: errorMessage(copyErr, labels.createError),
        variant: 'destructive',
      });
    }
  };

  const busy = loading || creating;
  const canPrepare = hasContext && !busy && !blocked;
  const badgeLabel = statusLabel(status, loading, labels);
  const connectionMessage = setupRequired
    ? labels.backendNotConfigured
    : error || status?.message || labels.helper;

  return (
    <Card className="border-emerald-500/25 bg-emerald-950/10 backdrop-blur-lg shadow-elegant relative overflow-hidden text-left">
      <div className="absolute right-0 top-0 p-5 opacity-5">
        <Laptop className="h-28 w-28 rotate-12 text-emerald-400" />
      </div>
      <CardHeader className="relative z-10 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Laptop className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/80">
                {labels.eyebrow}
              </CardDescription>
              <CardTitle className="mt-1 text-lg font-bold text-slate-100">
                {labels.title}
              </CardTitle>
              {membershipRole && (
                <p className="mt-1 text-[11px] text-slate-500">{communityName} · {membershipRole}</p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 text-[10px] font-semibold text-emerald-300"
          >
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
          {labels.description}
        </p>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span className="text-xs leading-relaxed text-slate-300">{labels.contextReady}</span>
          </div>
          <div className={`flex items-start gap-2 rounded-lg border p-3 ${
            blocked ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'
          }`}>
            <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${blocked ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-xs leading-relaxed text-slate-300">
              {blocked ? labels.backendPending : pairingCode ? labels.inviteReady : labels.backendReady}
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <span className="text-xs leading-relaxed text-slate-300">{labels.dashboardAvailable}</span>
          </div>
        </div>

        {pairingCode && (
          <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                  {labels.codeLabel}
                </p>
                {expiresAt && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {labels.expiresLabel}: {expiresAt}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={copyPairingCode}>
                <Copy className="h-3.5 w-3.5" />
                {labels.copyCodeCta}
              </Button>
            </div>
            <div className="max-h-24 overflow-auto rounded-md border border-slate-800 bg-slate-950/60 p-2 font-mono text-[11px] leading-relaxed text-slate-200 break-all">
              {pairingCode}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-xs leading-relaxed ${error || blocked ? 'text-amber-200/80' : 'text-slate-400'}`}>
            {connectionMessage}
          </p>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={loadStatus}
              disabled={busy || !communityId}
              className="h-10 gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {labels.refreshCta}
            </Button>
            <Button
              disabled={!canPrepare}
              onClick={handleCreateInvite}
              className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {blocked ? labels.setupRequiredCta : pairingCode ? labels.continueSetupCta : labels.primaryCta}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
