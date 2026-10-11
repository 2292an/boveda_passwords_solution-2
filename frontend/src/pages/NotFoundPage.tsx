import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <section className="card"><h2>Página no encontrada</h2><p>La dirección solicitada no existe.</p><Link to="/">Volver a la bóveda</Link></section>;
}
