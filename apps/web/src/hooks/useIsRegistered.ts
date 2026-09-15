import { useEffect, useState } from "react";
import { cloudAuth, isCloudConfigured } from "../services/container";

/**
 * "Registered" means the device's cloud identity has been upgraded past
 * anonymous (email link or Google) — see AccountCard. Installations with
 * no cloud configured have no account concept at all, so nothing is
 * gated there: null means "still checking", not "not registered", to
 * avoid flashing a locked state at an already-registered user on load.
 */
export function useIsRegistered(): boolean | null {
  const [registered, setRegistered] = useState<boolean | null>(isCloudConfigured ? null : true);

  useEffect(() => {
    if (!cloudAuth) {
      setRegistered(true);
      return;
    }
    let cancelled = false;
    cloudAuth
      .getIdentity()
      .then((identity) => {
        if (!cancelled) {
          setRegistered(!identity.isAnonymous);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRegistered(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return registered;
}
