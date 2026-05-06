import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasCapability, requireAuth } from "@/lib/auth";
import { firmarSolicitud, revisarSolicitud } from "@/app/actions";

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
      <article className="card row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Solicitudes</h1>
        <Link href="/solicitudes/nueva">Nueva solicitud</Link>
      </article>

      <article className="card">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Rango</th>
              <th>Estado</th>
              <th>Motivo</th>
              <th>Justificativo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((s) => (
              <tr key={s.id}>
                <td>{s.tipo}</td>
                <td>
                  {s.fecha_inicio} - {s.fecha_fin}
                </td>
                <td>{s.estado}</td>
                <td>{s.motivo}</td>
                <td>{s.justificativo_nombre}</td>
                <td className="row">
                  <Link href={`/solicitudes/${s.id}`}>Ver</Link>
                  <Link href={`/solicitudes/${s.id}/editar`}>Editar</Link>
                  {puedeRevisar && s.estado === "en_revision_secretaria" && (
                    <form
                      action={async () => {
                        "use server";
                        await revisarSolicitud(s.id, "Revisado por secretaría.");
                      }}
                    >
                      <button type="submit">Enviar a Decano</button>
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
                        <button type="submit">Aprobar</button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await firmarSolicitud(s.id, false, "Rechazado por Decano.");
                        }}
                      >
                        <button className="secondary" type="submit">
                          Rechazar
                        </button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
