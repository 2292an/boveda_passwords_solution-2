import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCredential } from "../api/vaultApi";
import type { CreateCredentialRequest } from "../types/Credential";
import { errorMessage } from "../utils/errorMessage";

interface Props { onCreated: () => Promise<void>; }
const fields = [
  { name: "service", label: "Servicio", type: "text" },
  { name: "username", label: "Usuario", type: "text" },
  { name: "password", label: "Contraseña ficticia", type: "password" },
  { name: "masterPassword", label: "Contraseña maestra", type: "password" },
] as const;

export default function CredentialForm({ onCreated }: Props) {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<CreateCredentialRequest>({ defaultValues: { service: "", username: "", password: "", masterPassword: "" } });

  async function submit(values: CreateCredentialRequest) {
    setMessage("");
    try {
      await createCredential(values);
      reset();
      setMessage("Credencial almacenada cifrada.");
      await onCreated();
    } catch (error) { setError("root", { message: errorMessage(error) }); }
  }

  return <section className="card">
    <h2>2. Registrar credencial</h2>
    <form name="vault-create-credential" autoComplete="off" onSubmit={handleSubmit(submit)} className="grid" noValidate>
      {fields.map(field => <div className="field" key={field.name}>
        <input id={`vault-create-${field.name}`} autoComplete={field.type === "password" ? "new-password" : "off"} type={field.type} placeholder={field.label} aria-label={field.label} disabled={isSubmitting} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `create-${field.name}-error` : undefined}
          {...register(field.name, { required: `${field.label} es obligatoria/o.`, validate: value => !!value.trim() || `Ingrese ${field.label.toLowerCase()}.` })} />
        {errors[field.name] && <span id={`create-${field.name}-error`} className="field-error" role="alert">{errors[field.name]?.message}</span>}
      </div>)}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar cifrada"}</button>
    </form>
    {errors.root && <p className="field-error" role="alert">{errors.root.message}</p>}
    {message && <div className="message" role="status">{message}</div>}
  </section>;
}
