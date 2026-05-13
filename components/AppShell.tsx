import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import type { SidebarNavItem } from "@/components/sidebar-nav-types";
import type { AppRole, UserProfile } from "@/lib/auth";

type AppShellProps = Readonly<{
  profile: UserProfile;
  userEmail: string | undefined;
  children: ReactNode;
}>;

function buildSidebarItems(rol: AppRole): SidebarNavItem[] {
  const esDecano = rol === "decano";
  const esSecretaria = rol === "secretaria";
  const esSuper = rol === "superusuario";
  const puedeProceso = rol === "secretaria" || rol === "decano";

  if (esSuper) {
    return [{ type: "link", href: "/dashboard", label: "Inicio" }];
  }

  const items: SidebarNavItem[] = [
    { type: "link", href: "/dashboard", label: "Inicio" },
    {
      type: "group",
      label: "Solicitudes",
      items: [
        { href: "/solicitudes/nueva", label: "Nuevas solicitudes" },
        { href: "/solicitudes", label: "Mis solicitudes" }
      ]
    }
  ];

  if (puedeProceso) {
    items.push({ type: "link", href: "/solicitudes/proceso-aprobacion", label: "Proceso de aprobación" });
  }
  if (esDecano) {
    items.push({ type: "link", href: "/admin/usuarios", label: "Usuarios" });
  }
  if (esDecano || esSecretaria) {
    items.push({ type: "link", href: "/admin/solicitudes-cuenta", label: "Solicitudes de cuenta" });
  }

  return items;
}

function etiquetaRol(rol: string) {
  if (rol === "superusuario") return "Superusuario";
  if (rol === "decano") return "Decano";
  if (rol === "secretaria") return "Secretaria";
  return "Administrativo";
}

export function AppShell({ profile, userEmail, children }: AppShellProps) {
  const rolLabel = etiquetaRol(profile.rol);
  const mostrarPill = profile.rol !== "superusuario";
  const sidebarItems = buildSidebarItems(profile.rol);

  return (
    <div className="app-shell">
      <AppSidebar
        items={sidebarItems}
        userDisplayName={`${profile.nombres} ${profile.apellidos}`}
        userEmail={userEmail ?? undefined}
        rolLabel={rolLabel}
        mostrarPill={mostrarPill}
      />

      <header className="topbar topbar--light">
        <div className="topbar__brand">
          <img
            className="topbar__logo-img"
            src="/branding/LOGO-ULEAM.png"
            alt="Universidad Laica Eloy Alfaro de Manabí"
          />
          <div className="topbar__titles">
            <span className="topbar__name">SAVA</span>
            <span className="topbar__tagline">Permisos y justificaciones</span>
          </div>
        </div>

        <div className="topbar__user">
          <div className="topbar__user-meta">
            <span className="topbar__user-name">
              {profile.nombres} {profile.apellidos}
            </span>
            <span className="topbar__user-email">{userEmail ?? profile.rol}</span>
            {mostrarPill ? <span className="topbar__pill">{rolLabel}</span> : null}
          </div>
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
