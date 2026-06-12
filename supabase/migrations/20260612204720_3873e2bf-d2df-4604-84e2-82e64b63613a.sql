
-- refresh_tokens
CREATE POLICY "Users view own refresh tokens"
ON public.refresh_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users revoke own refresh tokens"
ON public.refresh_tokens FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own refresh tokens"
ON public.refresh_tokens FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- push_subscriptions
CREATE POLICY "Users manage own push subscriptions select"
ON public.push_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own push subscriptions"
ON public.push_subscriptions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own push subscriptions"
ON public.push_subscriptions FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own push subscriptions"
ON public.push_subscriptions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- user_integrations
CREATE POLICY "Users select own integrations"
ON public.user_integrations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own integrations"
ON public.user_integrations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own integrations"
ON public.user_integrations FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own integrations"
ON public.user_integrations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- security_audit_log: admin read-only; no client writes
CREATE POLICY "Admins read security audit log"
ON public.security_audit_log FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- app_settings: admin only
CREATE POLICY "Admins read app settings"
ON public.app_settings FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins modify app settings"
ON public.app_settings FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
