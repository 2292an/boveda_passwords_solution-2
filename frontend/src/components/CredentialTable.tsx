import type { Credential } from "../types/Credential";
import { useCredentialDecrypt } from "../hooks/useCredentialDecrypt";
import { usePagination } from "../hooks/usePagination";
import CredentialRow from "./CredentialRow";
import Pagination from "./Pagination";
import "../styles/credential-table.css";

interface Props { credentials: Credential[]; loading: boolean; error: string; }

export default function CredentialTable({ credentials, loading, error }: Props) {
  const decrypt = useCredentialDecrypt();
  const pagination = usePagination(credentials);
  return <section className="card">
    <h2>3. Credenciales guardadas</h2>
    <p>La contraseña no se muestra automáticamente. Escriba la contraseña maestra en la fila correspondiente y use “Descifrar”.</p>
    {loading && <p role="status">Cargando credenciales...</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {!loading && !error && credentials.length === 0 && <p>No hay credenciales registradas.</p>}
    {credentials.length > 0 && <>
      <div className="table-wrap" aria-busy={loading}>
        <table>
          <thead><tr><th scope="col">Servicio</th><th scope="col">Usuario</th><th scope="col">Secreto</th><th scope="col">Contraseña maestra</th><th scope="col">Acción</th></tr></thead>
          <tbody>{pagination.visibleItems.map(credential => <CredentialRow key={credential.id} credential={credential}
            password={decrypt.passwords[credential.id] ?? ""} secret={decrypt.revealed[credential.id]} error={decrypt.errors[credential.id] ?? ""} pending={decrypt.pending[credential.id] ?? false}
            onPasswordChange={decrypt.setPassword} onDecrypt={decrypt.decrypt} onHide={decrypt.hide} />)}</tbody>
        </table>
      </div>
      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onGoToPage={pagination.goToPage} onNext={pagination.next} onPrevious={pagination.previous} />
    </>}
  </section>;
}
