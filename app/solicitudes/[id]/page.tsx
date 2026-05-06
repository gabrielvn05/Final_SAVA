import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

type Params = { id: string };

export default async function SolicitudDetallePage({ params }: Readonly<{ params: Params }>) {
  const { id } = params;
  await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("solicitudes")
    .select(
      "id, tipo, estado, fecha_inicio, fecha_fin, motivo, observaciones_secretaria, observaciones_decano, justificativo_path, justificativo_nombre, created_at, fecha_firma"
    )
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <section className="card">
        <p>Solicitud no encontrada.</p>
      </section>
    );
  }

  const justificativoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/justificativos/${data.justificativo_path}`;
  const tipoLabel = data.tipo === "permiso" ? "Permiso" : "Justificacion";

  return (
    <section className="stack">
      <PageHeader
        title="Detalle de solicitud"
        subtitle={`Referencia ${data.id.slice(0, 8)}...`}
        actions={
          <div className="row">
            <Link href={`/solicitudes/${id}/editar`} className="btn btn--primary">
              Editar
            </Link>
            <Link href="/solicitudes" className="btn btn--secondary">
              Volver
            </Link>
          </div>
        }
      />
      <article className="card stack">
        <div className="row">
          <span className="field-hint">Estado</span>
          <StatusBadge estado={data.estado} />
        </div>
        <div className="detail-grid">
          <div>
            <label>Tipo</label>
            <div>{tipoLabel}</div>
          </div>
          <div>
            <label>Periodo</label>
            <div>
              {data.fecha_inicio} - {data.fecha_fin}
            </div>
          </div>
          <div>
            <label>Justificativo</label>
            <div>
              <a href={justificativoUrl} target="_blank" rel="noopener noreferrer">
                {data.justificativo_nombre}
              </a>
            </div>
          </div>
          <div>
            <label>Fecha firma</label>
            <div>{data.fecha_firma || "-"}</div>
          </div>
          <div className="motivo-box">
            <label>Motivo</label>
            <div>{data.motivo}</div>
          </div>
          <div>
            <label>Observacion Secretaria</label>
            <div>{data.observaciones_secretaria || "-"}</div>
          </div>
          <div>
            <label>Observacion Decano</label>
            <div>{data.observaciones_decano || "-"}</div>
          </div>
        </div>
      </article>
    </section>
  );
}
