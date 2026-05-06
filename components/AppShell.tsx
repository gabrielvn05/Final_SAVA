import Link from "next/link";
import { ReactNode } from "react";
import { getUserProfile } from "@/lib/auth";

type AppShellProps = Readonly<{
  userId: string;
  userEmail: string | undefined;
  children: ReactNode;
}>;

const NAV = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/solicitudes", label: "Solicitudes" },
  { href: "/admin/usuarios", label: "Usuarios" }
] as const;

function etiquetaRol(rol: string) {
  if (rol === "superusuario") return "Superusuario";
  if (rol === "decano") return "Decano";
  if (rol === "secretaria") return "Secretaria";
  return "Administrativo";
}

export async function AppShell({ userId, userEmail, children }: AppShellProps) {
  const profile = await getUserProfile(userId);
  const rolLabel = etiquetaRol(profile.rol);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__logo" aria-hidden>
            <span>S</span>
          </div>
          <div className="topbar__titles">
            <span className="topbar__name">SAVA</span>
            <span className="topbar__tagline">Permisos y justificaciones</span>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Principal">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="topbar__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topbar__user">
          <div className="topbar__user-meta">
            <span className="topbar__user-name">
              {profile.nombres} {profile.apellidos}
            </span>
            <span className="topbar__user-email">{userEmail ?? profile.rol}</span>
            <span className="topbar__pill">{rolLabel}</span>
          </div>
          <form action="/logout" method="post">
            <button className="btn btn--ghost" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <div className="app-shell__body">
        <main className="app-main">{children}</main>
        <footer className="app-footer">
          <span>Sistema academico - Modulo de tramites</span>
        </footer>
      </div>
    </div>
  );
}
