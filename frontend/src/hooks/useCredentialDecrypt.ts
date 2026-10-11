import { useRef, useState } from "react";
import { revealCredential } from "../api/vaultApi";
import { errorMessage } from "../utils/errorMessage";

export function useCredentialDecrypt() {
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const active = useRef(new Set<number>());

  function setPassword(id: number, value: string) {
    setPasswords(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: "" }));
  }

  function hide(id: number) {
    setRevealed(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setPasswords(prev => ({ ...prev, [id]: "" }));
    setErrors(prev => ({ ...prev, [id]: "" }));
  }

  async function decrypt(id: number) {
    if (active.current.has(id)) return;
    const masterPassword = passwords[id];
    if (!masterPassword) {
      setErrors(prev => ({ ...prev, [id]: "Ingrese la contraseña maestra de esta fila." }));
      return;
    }
    active.current.add(id);
    setPending(prev => ({ ...prev, [id]: true }));
    setErrors(prev => ({ ...prev, [id]: "" }));
    try {
      const result = await revealCredential(id, { masterPassword });
      setRevealed(prev => ({ ...prev, [id]: result.password }));
      setPasswords(prev => ({ ...prev, [id]: "" }));
    } catch (error) {
      setRevealed(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setErrors(prev => ({ ...prev, [id]: errorMessage(error) }));
    } finally {
      active.current.delete(id);
      setPending(prev => ({ ...prev, [id]: false }));
    }
  }

  return { passwords, revealed, errors, pending, setPassword, decrypt, hide };
}
