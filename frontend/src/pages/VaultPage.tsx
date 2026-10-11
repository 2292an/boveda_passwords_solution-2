import { useCredentials } from "../hooks/useCredentials";
import VaultSetupForm from "../components/VaultSetupForm";
import CredentialForm from "../components/CredentialForm";
import CredentialTable from "../components/CredentialTable";

export default function VaultPage() {
  const { configured, credentials, loading, error, refresh } = useCredentials();
  if (configured === null)
    return (
      <>
        {loading && <p role="status">Conectando...</p>}
        {error && (
          <>
            <p className="field-error" role="alert">
              {error}
            </p>
            <button type="button" onClick={() => void refresh()}>
              Reintentar
            </button>
          </>
        )}
      </>
    );

  if (!configured)
    return (
      <>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <VaultSetupForm onConfigured={refresh} />
      </>
    );

  return (
    <>
      <CredentialForm onCreated={refresh} />
      <CredentialTable
        credentials={credentials}
        loading={loading}
        error={error}
      />
      {error && (
        <button type="button" disabled={loading} onClick={() => void refresh()}>
          Reintentar carga
        </button>
      )}
    </>
  );
}
