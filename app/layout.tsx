import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main className="stack">
          <header className="card row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <strong>SAVA - Permisos y Justificaciones</strong>
            <nav className="row">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/solicitudes">Solicitudes</Link>
              <Link href="/admin/usuarios">Usuarios</Link>
              <form action="/logout" method="post">
                <button className="secondary" type="submit">
                  Cerrar sesión
                </button>
              </form>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
