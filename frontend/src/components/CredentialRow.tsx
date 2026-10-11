import type { Credential } from "../types/Credential";

interface Props {
  credential: Credential;
  password: string;
  secret?: string;
  error: string;
  pending: boolean;
  onPasswordChange: (id: number, value: string) => void;
  onDecrypt: (id: number) => Promise<void>;
  onHide: (id: number) => void;
}

export default function CredentialRow({
  credential,
  password,
  secret,
  error,
  pending,
  onPasswordChange,
  onDecrypt,
  onHide,
}: Props) {
  const errorId = `decrypt-${credential.id}-error`;
  const isRevealed = secret !== undefined;
  return (
    <tr>
      <td data-label="Servicio">{credential.service}</td>
      <td data-label="Usuario">{credential.username}</td>
      <td data-label="Secreto">
        <span>{secret ?? "••••••••"}</span>
      </td>
      <td data-label="Contraseña maestra">
        <input
          type="password"
          autoComplete="new-password"
          name={`vault-master-password-${credential.id}`}
          id={`vault-master-password-${credential.id}`}
          placeholder="Contraseña maestra"
          aria-label={`Contraseña maestra para descifrar ${credential.service} (${credential.username})`}
          value={password}
          disabled={pending}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onPasswordChange(credential.id, e.target.value)}
        />
        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </td>
      <td data-label="Acción">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (isRevealed) onHide(credential.id);
            else void onDecrypt(credential.id);
          }}
        >
          {pending ? "Descifrando..." : isRevealed ? "Ocultar" : "Descifrar"}
        </button>
        {secret !== undefined && !error && (
          <p className="row-success" role="status">
            Contraseña descifrada correctamente.
          </p>
        )}
      </td>
    </tr>
  );
}
