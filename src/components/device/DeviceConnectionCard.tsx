import { ArrowRight, CheckCircle2, Laptop, Link2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prepareDeviceConnection } from '@/services/deviceConnection';

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
    description: string;
    contextReady: string;
    contractPending: string;
    dashboardAvailable: string;
    primaryCta: string;
    helper: string;
  };
}

export function DeviceConnectionCard({
  userId,
  communityId,
  communityName,
  membershipRole,
  onOpenDeviceSetup,
  labels,
}: DeviceConnectionCardProps) {
  const prepared = prepareDeviceConnection(
    userId && communityId && communityName
      ? {
          userId,
          communityId,
          communityName,
          membershipRole: membershipRole || 'member',
        }
      : null,
  );
  const ready = prepared.status === 'ready_to_connect';

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
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 text-[10px] font-semibold text-emerald-300"
          >
            {labels.status}
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
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span className="text-xs leading-relaxed text-slate-300">{labels.contractPending}</span>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <span className="text-xs leading-relaxed text-slate-300">{labels.dashboardAvailable}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-400">{labels.helper}</p>
          <Button
            disabled={!ready}
            onClick={() => onOpenDeviceSetup(prepared.installPath)}
            className="h-10 shrink-0 gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {labels.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
