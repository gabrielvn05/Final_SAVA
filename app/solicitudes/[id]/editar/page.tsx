import { actualizarSolicitud } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

type Params = { id: string };

export default async function EditarSolicitudPage({ params }: Readonly<{ params: Params }>) {
  await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("solicitudes")
    .select("id, tipo, fecha_inicio, fecha_fin, motivo, justificativo_nombre")
    .eq("id", params.id)
    .single();

  if (!data) {
    return (
      <section className="card">
        <p>Solicitud no encontrada.</p>
      </section>
    );
  }

  const updateAction = actualizarSolicitud.bind(null, params.id);

  return (
    <section className="card stack" style={{ maxWidth: 720 }}>
      <h1>Editar solicitud</h1>
      <form action={updateAction} className="stack">
        <select name="tipo" required defaultValue={data.tipo}>
          <option value="justificacion">Justificación</option>
          <option value="permiso">Permiso</option>
        </select>
        <div className="row">
          <input name="fecha_inicio" type="date" required defaultValue={data.fecha_inicio} />
          <input name="fecha_fin" type="date" required defaultValue={data.fecha_fin} />
        </div>
        <textarea name="motivo" rows={5} required defaultValue={data.motivo} />
        <p style={{ margin: 0 }}>Archivo actual: {data.justificativo_nombre}</p>
        <input name="justificativo" type="file" />
        <button type="submit">Guardar cambios</button>
      </form>
    </section>
  );
}
