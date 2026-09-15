import type { CloudIdentity } from "@wishstar/cloud";
import { type FormEvent, useEffect, useState } from "react";
import { cloudAuth, isCloudConfigured } from "../services/container";

/**
 * Lets the device's anonymous cloud identity be "upgraded" to a
 * recoverable email account without losing anything already published
 * (same underlying id) — see @wishstar/cloud's CloudAuth.upgradeToEmail.
 */
export function AccountCard() {
  const [identity, setIdentity] = useState<CloudIdentity | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cloudAuth) {
      return;
    }
    cloudAuth
      .getIdentity()
      .then(setIdentity)
      .catch(() => {
        /* identity display is best-effort; the upgrade form still works without it */
      });
  }, []);

  async function handleUpgrade(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!cloudAuth) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await cloudAuth.upgradeToEmail(email, password);
      setMessage(`Controlla la posta di ${email}: apri il link di conferma per completare il collegamento.`);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    if (!cloudAuth) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await cloudAuth.signInWithGoogle(window.location.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setBusy(false);
    }
  }

  if (!isCloudConfigured) {
    return null;
  }

  return (
    <div className="card">
      <h2>Account cloud</h2>
      {identity && !identity.isAnonymous ? (
        <p>Account collegato: {identity.email}</p>
      ) : (
        <>
          <p>
            Il tuo dispositivo usa un'identità anonima per condivisione e amici. Collega un'email per
            recuperarla su un altro dispositivo.
          </p>
          <form onSubmit={(event) => void handleUpgrade(event)} className="form-stack">
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? "Collegamento…" : "Collega email"}
            </button>
          </form>
          <button type="button" onClick={() => void handleGoogleSignIn()} disabled={busy}>
            Accedi con Google
          </button>
        </>
      )}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
