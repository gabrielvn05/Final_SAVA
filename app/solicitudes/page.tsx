import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { MisSolicitudesFilterTable } from "@/components/solicitudes/MisSolicitudesFilterTable";
import type { SolicitudListRow } from "@/lib/solicitudes-filters";

function normalizeRow(raw: Record<string, unknown>): SolicitudListRow {
  let profiles = raw.profiles as SolicitudListRow["profiles"] | SolicitudListRow["profiles"][] | null | undefined;
  if (Array.isArray(profiles)) {
    profiles = profiles[0] ?? null;
  }
  const detalle = raw.detalle;
  return {
    id: String(raw.id),
    creado_por: String(raw.creado_por ?? ""),
    tipo: String(raw.tipo),
    estado: String(raw.estado),
    fecha_inicio: String(raw.fecha_inicio),
    fecha_fin: String(raw.fecha_fin),
    motivo: String(raw.motivo),
    justificativo_nombre: raw.justificativo_nombre != null ? String(raw.justificativo_nombre) : null,
    created_at: String(raw.created_at),
    detalle: detalle && typeof detalle === "object" && !Array.isArray(detalle) ? (detalle as Record<string, unknown>) : null,
    profiles: profiles ?? null
  };
}

export default async function SolicitudesPage() {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("solicitudes")
    .select(
      "id, creado_por, tipo, estado, fecha_inicio, fecha_fin, motivo, justificativo_nombre, created_at, detalle, profiles(nombres, apellidos, email)"
    )
    .eq("creado_por", user.id)
    .order("created_at", { ascending: false });

  const rows: SolicitudListRow[] = (data || [])
    .map((r) => normalizeRow(r as unknown as Record<string, unknown>))
    .filter((r) => r.creado_por === user.id);

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
      <MisSolicitudesFilterTable rows={rows} currentUserId={user.id} />
    </section>
  );
}
