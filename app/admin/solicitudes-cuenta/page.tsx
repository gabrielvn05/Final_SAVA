import { PageHeader } from "@/components/PageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasCapability, requireAuth } from "@/lib/auth";
import { aprobarSolicitudCuenta, rechazarSolicitudCuenta } from "@/app/actions";

export default async function SolicitudesCuentaPage() {
  const { user } = await requireAuth();
  const puedeGestionar = await hasCapability(user.id, "gestionar_usuarios");
  if (!puedeGestionar) {
    return (
      <section className="stack">
        <PageHeader title="Solicitudes de cuenta" subtitle="Modulo reservado para Decano." />
        <article className="card">
          <p>No tienes permiso para aprobar solicitudes.</p>
        </article>
      </section>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("account_requests")
    .select("id, email, nombres, apellidos, rol_solicitado, motivo, status, created_at")
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
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
                      <div className="cell-actions">
                        {r.status === "pendiente" ? (
                          <>
                            <form
                              action={async () => {
                                "use server";
                                await aprobarSolicitudCuenta(r.id);
                              }}
                            >
                              <button className="btn btn--success btn--sm" type="submit">
                                Aprobar
                              </button>
                            </form>
                            <form
                              action={async () => {
                                "use server";
                                await rechazarSolicitudCuenta(r.id);
                              }}
                            >
                              <button className="btn btn--danger btn--sm" type="submit">
                                Rechazar
                              </button>
                            </form>
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

