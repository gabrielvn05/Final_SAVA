import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
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

export default async function SolicitudesPage() {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("solicitudes")
    .select("id, tipo, estado, fecha_inicio, fecha_fin, motivo, justificativo_nombre, created_at")
    .eq("creado_por", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="stack">
      <PageHeader
        title="Mis solicitudes"
        subtitle="Aquí aparecen únicamente las solicitudes que tú registraste. Si eres Secretaría o Decano, usa “Proceso de aprobación” para ver el resto."
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
                <td><span className="text-truncate">{s.justificativo_nombre || "-"}</span></td>
                <td>
                  <div className="cell-actions">
                  <Link href={`/solicitudes/${s.id}`} className="btn btn--secondary btn--sm">
                    Ver
                  </Link>
                  <Link href={`/solicitudes/${s.id}/editar`} className="btn btn--secondary btn--sm">
                    Editar
                  </Link>
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
