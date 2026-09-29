import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Auth from "./Auth";

function AuthGate({ children }) {
  const [session, setSession] =
    useState(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(
      ({ data }) => {
        if (mounted) {
          setSession(data.session);
        }
      }
    );

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div className="auth-loading">
        Ładowanie...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return children;
}

export default AuthGate;