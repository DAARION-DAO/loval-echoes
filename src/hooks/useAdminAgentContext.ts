import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAdminOverview, getAdminAccessRequests, getAdminAgentOps } from '@/lib/adminQueries';
import { useBillingPlanConfig } from '@/lib/cryptoBilling';

export interface AdminAgentContext {
  billing: {
    activeSubscriptions: number;
    pendingPayments: number;
    manualReviewPayments: number;
    currentLeaderPlan: {
      priceUsd: number;
      priceDaar: number;
      paymentNetwork: string;
      acceptedAssets: string[];
      treasuryAddress: string;
      daarPurchaseUrl: string;
    };
  };
  access: {
    pendingRequests: number;
    founderRequests: number;
    partnerRequests: number;
    sovereignRequests: number;
    workerNodeRequests: number;
  };
  team: {
    guardiansCount: number;
    pendingInvites: number;
    revokedInvites: number;
    acceptedInvites: number;
  };
  microdaos: {
    total: number;
    active: number;
    withoutSpiritAgent: number;
  };
  agentOps: {
    activeAgents: number;
    pendingApprovals: number;
    failedActions: number;
  };
}

export const useAdminAgentContext = () => {
  const [context, setContext] = useState<AdminAgentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { config: billingConfig, loading: billingConfigLoading } = useBillingPlanConfig();

  const fetchContext = async () => {
    try {
      // 1. Fetch Subscription Stats & Billing Config
      let activeSubscriptions = 0;
      let pendingPayments = 0;
      let manualReviewPayments = 0;

      try {
        const { data: statsData, error: statsError } = await (supabase as any).rpc('admin_get_subscription_stats');
        if (!statsError && statsData) {
          activeSubscriptions = statsData.active || 0;
          pendingPayments = statsData.pending_payment || 0;
          manualReviewPayments = statsData.manual_review || 0;
        }
      } catch (err) {
        console.warn('[useAdminAgentContext] Failed to fetch subscription stats:', err);
      }

      // 2. Fetch Access Requests Stats
      let pendingRequests = 0;
      let founderRequests = 0;
      let partnerRequests = 0;
      let sovereignRequests = 0;
      let workerNodeRequests = 0;

      try {
        const { data: reqData } = await getAdminAccessRequests();
        if (reqData) {
          reqData.forEach((req) => {
            const status = req.status?.toLowerCase();
            const tier = req.requested_tier?.toLowerCase();
            if (status === 'pending') {
              pendingRequests++;
            }
            if (tier === 'founder') founderRequests++;
            else if (tier === 'partner') partnerRequests++;
            else if (tier === 'sovereign' || tier === 'network') sovereignRequests++;
            else if (tier === 'worker_node' || tier === 'worker') workerNodeRequests++;
          });
        }
      } catch (err) {
        console.warn('[useAdminAgentContext] Failed to fetch access requests:', err);
      }

      // 3. Fetch Team (Guardians & Invites)
      let guardiansCount = 0;
      let pendingInvites = 0;
      let revokedInvites = 0;
      let acceptedInvites = 0;

      try {
        const { data: gData } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'guardian');
        guardiansCount = gData?.length || 0;

        const { data: iData } = await (supabase as any)
          .from('platform_admin_invites')
          .select('status');
        if (iData) {
          iData.forEach((invite: any) => {
            if (invite.status === 'pending') pendingInvites++;
            else if (invite.status === 'revoked') revokedInvites++;
            else if (invite.status === 'accepted') acceptedInvites++;
          });
        }
      } catch (err) {
        console.warn('[useAdminAgentContext] Failed to fetch platform team stats:', err);
      }

      // 4. Fetch MicroDAOs Overview
      let totalMicroDAOs = 0;
      let activeMicroDAOs = 0;
      let withoutSpiritAgent = 0;
      let pendingAgentApprovals = 0;

      try {
        const { data: overviewData } = await getAdminOverview();
        if (overviewData) {
          totalMicroDAOs = overviewData.total_microdaos || 0;
          activeMicroDAOs = overviewData.active_microdaos || 0;
          withoutSpiritAgent = overviewData.microdaos_without_spirit_agent || 0;
          pendingAgentApprovals = overviewData.pending_agent_approvals || 0;
        }
      } catch (err) {
        console.warn('[useAdminAgentContext] Failed to fetch overview stats:', err);
      }

      // 5. Fetch Agent Ops Stats
      let activeAgents = 0;
      let failedActions = 0;

      try {
        const { data: agentOpsData } = await getAdminAgentOps();
        if (agentOpsData) {
          activeAgents = agentOpsData.total_agents || 0;
          failedActions = agentOpsData.recent_errors?.length || 0;
        }
      } catch (err) {
        console.warn('[useAdminAgentContext] Failed to fetch agent ops stats:', err);
      }

      setContext({
        billing: {
          activeSubscriptions,
          pendingPayments,
          manualReviewPayments,
          currentLeaderPlan: {
            priceUsd: billingConfig.priceUsd,
            priceDaar: billingConfig.priceDaar,
            paymentNetwork: billingConfig.paymentNetwork,
            acceptedAssets: billingConfig.acceptedAssets,
            treasuryAddress: billingConfig.treasuryAddress,
            daarPurchaseUrl: billingConfig.daarPurchaseUrl,
          },
        },
        access: {
          pendingRequests,
          founderRequests,
          partnerRequests,
          sovereignRequests,
          workerNodeRequests,
        },
        team: {
          guardiansCount,
          pendingInvites,
          revokedInvites,
          acceptedInvites,
        },
        microdaos: {
          total: totalMicroDAOs,
          active: activeMicroDAOs,
          withoutSpiritAgent,
        },
        agentOps: {
          activeAgents,
          pendingApprovals: pendingAgentApprovals,
          failedActions,
        },
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!billingConfigLoading) {
      fetchContext();
    }
  }, [billingConfigLoading, billingConfig]);

  return { context, loading: loading || billingConfigLoading, error, refetch: fetchContext };
};
