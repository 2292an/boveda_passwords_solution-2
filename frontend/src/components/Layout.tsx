import type { ReactNode } from "react";
import "../styles/layout.css";
import "../styles/forms.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="shell">
      <h1>Bóveda Segura de Contraseñas</h1>
      <p className="subtitle">
        Demostración académica: AES-256-GCM + PBKDF2 + bcrypt + SQL Server
      </p>
      {children}
    </main>
  );
}
