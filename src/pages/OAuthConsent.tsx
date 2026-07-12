import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type OAuthClient = {
  name?: string;
  client_name?: string;
  client_uri?: string;
  redirect_uri?: string;
};

type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
  redirect_uri?: string;
};

// Minimal typed wrapper — supabase.auth.oauth is beta and TypeScript may not
// see it in the installed types. Do not read SDK internals; call the methods.
type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization(id: string): Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization(id: string): Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauthApi = (): OAuthApi | null => {
  const anyAuth = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth;
  return anyAuth ?? null;
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      const api = oauthApi();
      if (!api) {
        setError(
          "OAuth server support is not available in this backend build. Ask an admin to enable the managed OAuth server.",
        );
        return;
      }
      const { data, error } = await api.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    if (!api) {
      setBusy(false);
      setError("OAuth server is not available.");
      return;
    }
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName =
    details?.client?.name ?? details?.client?.client_name ?? "an external app";
  const redirectUri = details?.client?.redirect_uri ?? details?.redirect_uri ?? "";
  const scopes =
    details?.scopes && details.scopes.length > 0
      ? details.scopes
      : details?.scope
        ? details.scope.split(/\s+/).filter(Boolean)
        : [];

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authorization error</CardTitle>
            <CardDescription>Could not load this authorization request.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground break-words">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading authorization…" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect {clientName} to your account</CardTitle>
          <CardDescription>
            This lets {clientName} use this app as you. It does not bypass this app's permissions or backend policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redirectUri && (
            <div className="text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Redirects to</div>
              <div className="break-all">{redirectUri}</div>
            </div>
          )}
          <div className="space-y-1 text-sm">
            <div className="font-medium">Requested access</div>
            <ul className="list-disc pl-5 text-muted-foreground">
              {scopes.includes("profile") && <li>Share your basic profile</li>}
              {scopes.includes("email") && <li>Share your email address</li>}
              <li>Call this app's enabled tools while you are signed in</li>
              {scopes
                .filter((s) => !["openid", "profile", "email"].includes(s))
                .map((s) => (
                  <li key={s}>Additional permission requested: {s}</li>
                ))}
            </ul>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              Approve
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={busy}
              onClick={() => decide(false)}
            >
              Cancel connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}