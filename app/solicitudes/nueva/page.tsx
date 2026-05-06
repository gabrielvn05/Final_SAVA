import { crearSolicitud } from "@/app/actions";
import { requireAuth } from "@/lib/auth";

export default async function NuevaSolicitudPage() {
  await requireAuth();

  return (
    <section className="card stack" style={{ maxWidth: 720 }}>
      <h1>Nueva solicitud</h1>
      <form action={crearSolicitud} className="stack">
        <select name="tipo" required defaultValue="justificacion">
          <option value="justificacion">Justificación</option>
          <option value="permiso">Permiso</option>
        </select>
        <div className="row">
          <input name="fecha_inicio" type="date" required />
          <input name="fecha_fin" type="date" required />
        </div>
        <textarea name="motivo" placeholder="Detalle de la solicitud..." rows={5} required />
        <input name="justificativo" type="file" required />
        <button type="submit">Enviar para revisión</button>
      </form>
    </section>
  );
}
