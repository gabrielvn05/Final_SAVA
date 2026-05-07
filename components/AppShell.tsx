import Link from "next/link";
import { ReactNode } from "react";
import type { UserProfile } from "@/lib/auth";

type AppShellProps = Readonly<{
  profile: UserProfile;
  userEmail: string | undefined;
  children: ReactNode;
}>;

function etiquetaRol(rol: string) {
  if (rol === "superusuario") return "Superusuario";
  if (rol === "decano") return "Decano";
  if (rol === "secretaria") return "Secretaria";
  return "Administrativo";
}

export function AppShell({ profile, userEmail, children }: AppShellProps) {
  const rolLabel = etiquetaRol(profile.rol);
  const esDecano = profile.rol === "decano";
  const esSecretaria = profile.rol === "secretaria";
  const esSuper = profile.rol === "superusuario";
  const mostrarPill = !esSuper;
  const puedeProceso = profile.rol === "secretaria" || profile.rol === "decano" || profile.rol === "superusuario";
  const nav = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/solicitudes", label: "Mis solicitudes" },
    { href: "/solicitudes/nueva", label: "Nueva solicitud" },
    ...(puedeProceso ? [{ href: "/solicitudes/proceso-aprobacion", label: "Proceso de aprobacion" }] : []),
    ...((esDecano || esSuper) ? [{ href: "/admin/usuarios", label: "Usuarios" }] : []),
    ...((esDecano || esSecretaria || esSuper) ? [{ href: "/admin/solicitudes-cuenta", label: "Solicitudes de cuenta" }] : [])
  ] as const;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <img src="/branding/LOGO-ULEAM.png" alt="ULEAM" style={{ height: 90, width: 120, borderRadius: 8 }} />
          <div className="topbar__titles">
            <span className="topbar__name">SAVA</span>
            <span className="topbar__tagline">Permisos y justificaciones</span>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Principal">
          {nav.map((item) => (
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
            {mostrarPill ? <span className="topbar__pill">{rolLabel}</span> : null}
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
