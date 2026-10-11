import { useState } from "react";
import { useForm } from "react-hook-form";
import { setupVault } from "../api/vaultApi";
import type { VaultSetupRequest } from "../types/vault";
import { errorMessage } from "../utils/errorMessage";

interface Props {
  onConfigured: () => Promise<void>;
}

export default function VaultSetupForm({ onConfigured }: Props) {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VaultSetupRequest>({ defaultValues: { masterPassword: "" } });

  async function submit(values: VaultSetupRequest) {
    setMessage("");
    try {
      const result = await setupVault(values);
      reset();
      setMessage(result.message);
      await onConfigured();
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  }

  return (
    <section className="card">
      <h2>1. Configurar contraseña maestra</h2>
      <form
        name="vault-setup"
        autoComplete="off"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <div className="field">
          <input
            type="password"
            autoComplete="new-password"
            id="vault-master-password-setup"
            placeholder="Contraseña maestra (10+ caracteres)"
            aria-label="Contraseña maestra para configurar"
            aria-invalid={!!errors.masterPassword}
            aria-describedby={errors.masterPassword ? "setup-error" : undefined}
            disabled={isSubmitting}
            {...register("masterPassword", {
              required: "Ingrese la contraseña maestra.",
              minLength: { value: 10, message: "Use al menos 10 caracteres." },
              validate: (value) =>
                !!value.trim() || "Ingrese la contraseña maestra.",
            })}
          />
          {errors.masterPassword && (
            <span id="setup-error" className="field-error" role="alert">
              {errors.masterPassword.message}
            </span>
          )}
        </div>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Configurando..." : "Configurar bóveda"}
        </button>
      </form>
      {errors.root && (
        <p className="field-error" role="alert">
          {errors.root.message}
        </p>
      )}
      {message && (
        <div className="message" role="status">
          {message}
        </div>
      )}
    </section>
  );
}
