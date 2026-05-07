import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserProfile, hasCapability, requireAuth } from "@/lib/auth";
import { firmarSolicitud, revisarSolicitud } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

function labelTipo(tipo: string) {
  if (tipo === "permiso") return "Permiso";
  if (tipo === "justificacion") return "Justificacion";
  if (tipo === "viaje") return "Por viaje";
  if (tipo === "enfermedad") return "Por enfermedad";
  if (tipo === "calamidad_domestica") return "Calamidad domestica";
  if (tipo === "falta_marcado") return "Falta de marcado";
  return tipo;
}

function puedeAccederProceso(rol: string) {
  return rol === "secretaria" || rol === "decano" || rol === "superusuario";
}

export default async function ProcesoAprobacionPage() {
  const { user } = await requireAuth();
  const profile = await getUserProfile(user.id);
  if (!puedeAccederProceso(profile.rol)) {
    redirect("/solicitudes");
  }

  const puedeRevisar = await hasCapability(user.id, "revisar_solicitudes");
  const puedeAprobar = await hasCapability(user.id, "aprobar_solicitudes");

  // Lista global: el cliente con anon key puede quedar sin filas si la policy RLS en Supabase no coincide
  // con el rol real (p. ej. schema viejo). Service role solo tras verificar rol en servidor.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("solicitudes")
    .select("id, tipo, estado, fecha_inicio, fecha_fin, motivo, justificativo_nombre, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="stack">
      <PageHeader
        title="Proceso de aprobación"
        subtitle="Bandeja institucional: aquí ves solicitudes de todos los usuarios y avanzas el flujo (Secretaría → Decanato). Tus propias solicitudes también aparecen en “Mis solicitudes”."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <Link href="/solicitudes" className="btn btn--secondary btn--sm">
              Mis solicitudes
            </Link>
            <Link href="/solicitudes/nueva" className="btn btn--primary btn--sm">
              Nueva solicitud
            </Link>
          </div>
        }
      />

      {error ? (
        <article className="card">
          <div className="alert alert--error" role="alert">
            No se pudieron cargar las solicitudes. {error.message}
          </div>
        </article>
      ) : null}

      <article className="card card--flat">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Periodo</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Justificativo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No hay solicitudes registradas.
                  </td>
                </tr>
              ) : (
                (data || []).map((s) => (
                  <tr key={s.id}>
                    <td>{labelTipo(s.tipo)}</td>
                    <td>
                      {s.fecha_inicio} - {s.fecha_fin}
                    </td>
                    <td>
                      <StatusBadge estado={s.estado} />
                    </td>
                    <td>
                      <span className="text-truncate">{s.motivo}</span>
                    </td>
                    <td>
                      <span className="text-truncate">{s.justificativo_nombre || "-"}</span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Link href={`/solicitudes/${s.id}`} className="btn btn--link btn--sm">
                          Ver
                        </Link>
                        {puedeRevisar && s.estado === "en_revision_secretaria" ? (
                          <form
                            action={async () => {
                              "use server";
                              await revisarSolicitud(s.id, "Revisado por secretaría.");
                            }}
                          >
                            <button className="btn btn--secondary btn--sm" type="submit">
                              Enviar a Decano
                            </button>
                          </form>
                        ) : null}
                        {puedeAprobar && s.estado === "pendiente_aprobacion_decano" ? (
                          <>
                            <form
                              action={async () => {
                                "use server";
                                await firmarSolicitud(s.id, true, "Aprobado y firmado por Decano.");
                              }}
                            >
                              <button className="btn btn--success btn--sm" type="submit">
                                Aprobar
                              </button>
                            </form>
                            <form
                              action={async () => {
                                "use server";
                                await firmarSolicitud(s.id, false, "Rechazado por Decano.");
                              }}
                            >
                              <button className="btn btn--danger btn--sm" type="submit">
                                Rechazar
                              </button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
