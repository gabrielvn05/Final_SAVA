import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";

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

  return (
    <section className="card stack">
      <h1>Detalle de solicitud</h1>
      <p>
        <strong>Tipo:</strong> {data.tipo}
      </p>
      <p>
        <strong>Estado:</strong> {data.estado}
      </p>
      <p>
        <strong>Fecha:</strong> {data.fecha_inicio} al {data.fecha_fin}
      </p>
      <p>
        <strong>Motivo:</strong> {data.motivo}
      </p>
      <p>
        <strong>Justificativo:</strong>{" "}
        <Link href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/justificativos/${data.justificativo_path}`}>
          {data.justificativo_nombre}
        </Link>
      </p>
      <p>
        <strong>Observación Secretaría:</strong> {data.observaciones_secretaria || "-"}
      </p>
      <p>
        <strong>Observación Decano:</strong> {data.observaciones_decano || "-"}
      </p>
      <p>
        <strong>Fecha firma:</strong> {data.fecha_firma || "-"}
      </p>
    </section>
  );
}
