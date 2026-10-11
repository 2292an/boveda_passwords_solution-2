import { FormEvent, useEffect, useState } from "react";
import { createCredential, getCredentials, getStatus, revealCredential, setupVault } from "./api/vaultApi";
import type { Credential } from "./types/Credential";
import "./styles.css";

export default function App() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [masterSetup, setMasterSetup] = useState("");
  const [service, setService] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [decryptPasswords, setDecryptPasswords] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");

  async function refresh() {
    const status = await getStatus();
    setConfigured(status.configured);
    if (status.configured) setCredentials(await getCredentials());
  }

  useEffect(() => { refresh().catch(e => setMessage(e.message)); }, []);

  async function handleSetup(e: FormEvent) {
    e.preventDefault();
    try {
      await setupVault(masterSetup);
      setMasterSetup("");
      setMessage("Bóveda configurada correctamente.");
      await refresh();
    } catch (e) { setMessage((e as Error).message); }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createCredential({ service, username, password, masterPassword });
      setService(""); setUsername(""); setPassword("");
      setMasterPassword("");
      setMessage("Credencial almacenada cifrada.");
      await refresh();
    } catch (e) { setMessage((e as Error).message); }
  }

  async function handleDecrypt(id: number) {
    const decryptPassword = decryptPasswords[id];
    if (!decryptPassword) {
      setMessage("Ingrese la contraseña maestra en la fila que desea descifrar.");
      return;
    }

    try {
      const value = await revealCredential(id, decryptPassword);
      setRevealed(prev => ({ ...prev, [id]: value }));
      setDecryptPasswords(prev => ({ ...prev, [id]: "" }));
      setMessage("Contraseña descifrada correctamente.");
    } catch (e) { setMessage((e as Error).message); }
  }

  if (configured === null) return <main className="shell"><p>Conectando...</p></main>;

  return (
    <main className="shell">
      <h1>Bóveda Segura de Contraseñas</h1>
      <p className="subtitle">Demostración académica: AES-256-GCM + PBKDF2 + bcrypt + SQL Server</p>
      {message && <div className="message">{message}</div>}

      {!configured ? (
        <section className="card">
          <h2>1. Configurar contraseña maestra</h2>
          <form onSubmit={handleSetup}>
            <input type="password" minLength={10} value={masterSetup} onChange={e => setMasterSetup(e.target.value)} placeholder="Contraseña maestra (10+ caracteres)" required />
            <button type="submit">Configurar bóveda</button>
          </form>
        </section>
      ) : (
        <>
          <section className="card">
            <h2>2. Registrar credencial</h2>
            <form onSubmit={handleCreate} className="grid">
              <input value={service} onChange={e => setService(e.target.value)} placeholder="Servicio" required />
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña ficticia" required />
              <input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} placeholder="Contraseña maestra" required />
              <button type="submit">Guardar cifrada</button>
            </form>
          </section>

          <section className="card">
            <h2>3. Credenciales guardadas</h2>
            <p>La contraseña no se muestra automáticamente. Escriba la contraseña maestra en la fila correspondiente y use “Descifrar”.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Servicio</th><th>Usuario</th><th>Secreto</th><th>Contraseña maestra</th><th>Acción</th></tr></thead>
                <tbody>
                  {credentials.map(c => (
                    <tr key={c.id}>
                      <td>{c.service}</td><td>{c.username}</td>
                      <td>{revealed[c.id] ?? "••••••••"}</td>
                      <td>
                        <input
                          type="password"
                          placeholder="Contraseña maestra"
                          aria-label={`Contraseña maestra para descifrar ${c.service} (${c.username})`}
                          value={decryptPasswords[c.id] ?? ""}
                          onChange={e => {
                            const value = e.target.value;
                            setDecryptPasswords(prev => ({ ...prev, [c.id]: value }));
                          }}
                        />
                      </td>
                      <td><button onClick={() => handleDecrypt(c.id)}>Descifrar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
