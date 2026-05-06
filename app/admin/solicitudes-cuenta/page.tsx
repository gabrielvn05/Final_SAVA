import { PageHeader } from "@/components/PageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile, requireAuth } from "@/lib/auth";
import { aprobarSolicitudCuenta, rechazarSolicitudCuenta } from "@/app/actions";

export default async function SolicitudesCuentaPage() {
  const { user } = await requireAuth();
  const profile = await getUserProfile(user.id);
  const esDecano = profile.rol === "decano";
  const esSecretaria = profile.rol === "secretaria";

  if (!esDecano && !esSecretaria) {
    return (
      <section className="stack">
        <PageHeader title="Solicitudes de cuenta" subtitle="Modulo reservado para Decano y Secretaria." />
        <article className="card">
          <p>No tienes permiso para aprobar solicitudes.</p>
        </article>
      </section>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("account_requests")
    .select("id, email, nombres, apellidos, rol_solicitado, motivo, status, rechazo_comentario, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="stack">
      <PageHeader
        title="Solicitudes de cuenta"
        subtitle="Aprueba o rechaza solicitudes para crear usuarios. Al aprobar se genera una contraseña temporal."
      />

      <article className="card card--flat">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Comentario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                    No hay solicitudes.
                  </td>
                </tr>
              ) : (
                (data || []).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>
                        {r.nombres} {r.apellidos}
                      </strong>
                    </td>
                    <td>{r.email}</td>
                    <td>{r.rol_solicitado}</td>
                    <td>
                      <span className="text-truncate">{r.motivo || "-"}</span>
                    </td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === "rechazada" ? <span className="text-truncate">{r.rechazo_comentario || "-"}</span> : null}
                    </td>
                    <td>
                      <div className="cell-actions">
                        {r.status === "pendiente" ? (
                          <>
                            {esDecano ? (
                              <form action={aprobarSolicitudCuenta}>
                                <input type="hidden" name="request_id" value={r.id} />
                                <button className="btn btn--success btn--sm" type="submit">
                                  Aprobar
                                </button>
                              </form>
                            ) : null}

                            {(esDecano || esSecretaria) ? (
                              <form action={rechazarSolicitudCuenta} className="stack" style={{ width: 220 }}>
                                <input type="hidden" name="request_id" value={r.id} />
                                <textarea
                                  name="comentario"
                                  placeholder="Comentario de rechazo"
                                  rows={2}
                                  required={esSecretaria}
                                  style={{ width: "100%", resize: "vertical" }}
                                />
                                <button className="btn btn--danger btn--sm" type="submit">
                                  Rechazar
                                </button>
                              </form>
                            ) : null}
                          </>
                        ) : (
                          <span className="field-hint">Sin acciones</span>
                        )}
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

