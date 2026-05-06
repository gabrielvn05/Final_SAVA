import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasCapability, requireAuth } from "@/lib/auth";
import { firmarSolicitud, revisarSolicitud } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

function labelTipo(tipo: string) {
  return tipo === "permiso" ? "Permiso" : "Justificacion";
}

export default async function SolicitudesPage() {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const puedeRevisar = await hasCapability(user.id, "revisar_solicitudes");
  const puedeAprobar = await hasCapability(user.id, "aprobar_solicitudes");

  const { data } = await supabase
    .from("solicitudes")
    .select("id, tipo, estado, fecha_inicio, fecha_fin, motivo, justificativo_nombre, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="stack">
      <PageHeader
        title="Solicitudes"
        subtitle="Registro central de permisos y justificaciones."
        actions={
          <Link href="/solicitudes/nueva" className="btn btn--primary">
            Nueva solicitud
          </Link>
        }
      />
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
            ) : (data || []).map((s) => (
              <tr key={s.id}>
                <td>{labelTipo(s.tipo)}</td>
                <td>
                  {s.fecha_inicio} - {s.fecha_fin}
                </td>
                <td><StatusBadge estado={s.estado} /></td>
                <td><span className="text-truncate">{s.motivo}</span></td>
                <td><span className="text-truncate">{s.justificativo_nombre}</span></td>
                <td>
                  <div className="cell-actions">
                  <Link href={`/solicitudes/${s.id}`} className="btn btn--link btn--sm">Ver</Link>
                  <Link href={`/solicitudes/${s.id}/editar`} className="btn btn--link btn--sm">Editar</Link>
                  {puedeRevisar && s.estado === "en_revision_secretaria" && (
                    <form
                      action={async () => {
                        "use server";
                        await revisarSolicitud(s.id, "Revisado por secretaría.");
                      }}
                    >
                      <button className="btn btn--secondary btn--sm" type="submit">Enviar a Decano</button>
                    </form>
                  )}
                  {puedeAprobar && s.estado === "pendiente_aprobacion_decano" && (
                    <>
                      <form
                        action={async () => {
                          "use server";
                          await firmarSolicitud(s.id, true, "Aprobado y firmado por Decano.");
                        }}
                      >
                        <button className="btn btn--success btn--sm" type="submit">Aprobar</button>
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
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </article>
    </section>
  );
}
