import Link from "next/link";
import { getUserProfile, hasCapability, requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const profile = await getUserProfile(user.id);
  const supabase = createSupabaseServerClient();

  const [puedeRevisar, puedeAprobar] = await Promise.all([
    hasCapability(user.id, "revisar_solicitudes"),
    hasCapability(user.id, "aprobar_solicitudes"),
  ]);

  const [
    { count: solicitudesPendientesFirma = 0 },
    { count: solicitudesPendientesSecretaria = 0 },
    { count: solicitudesCuentaPendientes = 0 }
  ] = await Promise.all([
    supabase
      .from("solicitudes")
      .select("*", { head: true, count: "exact" })
      .eq("estado", "pendiente_aprobacion_decano"),
    supabase
      .from("solicitudes")
      .select("*", { head: true, count: "exact" })
      .eq("estado", "en_revision_secretaria"),
    supabase
      .from("account_requests")
      .select("*", { head: true, count: "exact" })
      .eq("status", "pendiente")
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
        {!Number.isNaN(solicitudesPendientesSecretaria) && profile.rol !== "superusuario" && puedeRevisar ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-warning)" }}>
            <h2 style={{ margin: 0 }}>Revision (Secretaria)</h2>
            <p className="field-hint">Pendientes por revisar: {solicitudesPendientesSecretaria}</p>
            <Link href="/solicitudes" className="btn btn--secondary btn--sm" style={{ width: "fit-content" }}>
              Revisar ahora
            </Link>
          </article>
        ) : null}
        {puedeAprobar && profile.rol !== "superusuario" ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-success)" }}>
            <h2 style={{ margin: 0 }}>Aprobacion y firma</h2>
            <p className="field-hint">Pendientes de firma: {solicitudesPendientesFirma}</p>
            <Link href="/solicitudes" className="btn btn--secondary btn--sm" style={{ width: "fit-content" }}>
              Atender pendientes
            </Link>
          </article>
        ) : null}
        {profile.rol === "decano" ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-accent)" }}>
            <h2 style={{ margin: 0 }}>Usuarios y solicitudes de cuenta</h2>
            <p className="field-hint">Solicitudes de cuenta pendientes: {solicitudesCuentaPendientes}</p>
            <div className="row">
              <Link href="/admin/usuarios" className="btn btn--secondary btn--sm" style={{ width: "fit-content" }}>
                Gestionar usuarios
              </Link>
              <Link href="/admin/solicitudes-cuenta" className="btn btn--primary btn--sm" style={{ width: "fit-content" }}>
                Revisar solicitudes
              </Link>
            </div>
          </article>
        ) : null}
        {profile.rol === "secretaria" ? (
          <article className="card dashboard-tile stack" style={{ borderLeftColor: "var(--color-warning)" }}>
            <h2 style={{ margin: 0 }}>Solicitudes de cuenta (rechazo)</h2>
            <p className="field-hint">Pendientes por resolver: {solicitudesCuentaPendientes}</p>
            <Link href="/admin/solicitudes-cuenta" className="btn btn--secondary btn--sm" style={{ width: "fit-content" }}>
              Abrir bandeja
            </Link>
          </article>
        ) : null}
      </div>
    </section>
  );
}
