import Link from "next/link";
import { getUserProfile, hasCapability, requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const profile = await getUserProfile(user.id);

  const [puedeRevisar, puedeAprobar, puedeGestionar] = await Promise.all([
    hasCapability(user.id, "revisar_solicitudes"),
    hasCapability(user.id, "aprobar_solicitudes"),
    hasCapability(user.id, "gestionar_usuarios")
  ]);

  return (
    <section className="stack">
      <PageHeader
        title={`Hola, ${profile.nombres}`}
        subtitle="Resumen de tu rol en el flujo de permisos y justificaciones."
      />
      <div className="dashboard-grid">
        <article className="card dashboard-tile stack">
          <h2 style={{ margin: 0 }}>Solicitudes</h2>
          <p className="field-hint">Consulta, crea y edita solicitudes con justificativo.</p>
          <Link href="/solicitudes" className="btn btn--primary btn--sm" style={{ width: "fit-content" }}>
            Ir a solicitudes
          </Link>
        </article>
        {puedeRevisar ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-warning)" }}>
            <h2 style={{ margin: 0 }}>Revision (Secretaria)</h2>
            <p className="field-hint">Puedes validar datos y enviar expedientes al Decano.</p>
          </article>
        ) : null}
        {puedeAprobar ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-success)" }}>
            <h2 style={{ margin: 0 }}>Aprobacion y firma</h2>
            <p className="field-hint">Autoriza o rechaza solicitudes revisadas.</p>
          </article>
        ) : null}
        {puedeGestionar ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-accent)" }}>
            <h2 style={{ margin: 0 }}>Usuarios</h2>
            <p className="field-hint">Alta de cuentas y delegacion de funciones.</p>
            <Link href="/admin/usuarios" className="btn btn--secondary btn--sm" style={{ width: "fit-content" }}>
              Gestionar usuarios
            </Link>
          </article>
        ) : null}
      </div>
    </section>
  );
}
