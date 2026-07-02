import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const authUnavailableMessage = "Auth is not configured for this deployment.";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const markUnavailable = () => {
      if (!mounted) return;
      setSession(null);
      setUser(null);
      setAuthError(authUnavailableMessage);
      setLoading(false);
    };

    try {
      // Set up listener FIRST so we don't miss the INITIAL_SESSION event
      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();

      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!mounted) return;
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        })
        .catch(markUnavailable);
    } catch {
      markUnavailable();
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    try {
      return await supabase.auth.signOut();
    } catch {
      setSession(null);
      setUser(null);
      setAuthError(authUnavailableMessage);
      return { error: null };
    }
  };

  return { session, user, loading, authError, signOut };
}
