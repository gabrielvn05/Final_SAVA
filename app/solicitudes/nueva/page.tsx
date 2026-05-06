import { crearSolicitud } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default async function NuevaSolicitudPage() {
  await requireAuth();

  return (
    <section className="stack">
      <PageHeader
        title="Nueva solicitud"
        subtitle="Completa los datos y adjunta el archivo justificativo."
        actions={
          <Link href="/solicitudes" className="btn btn--secondary">
            Volver
          </Link>
        }
      />

      <article className="card stack" style={{ maxWidth: 720 }}>
        <form action={crearSolicitud} className="stack" encType="multipart/form-data">
          <div>
            <label htmlFor="tipo">Tipo de tramite</label>
            <select id="tipo" name="tipo" required defaultValue="justificacion">
              <option value="justificacion">Justificacion</option>
              <option value="viaje">Por viaje</option>
              <option value="enfermedad">Por enfermedad</option>
              <option value="calamidad_domestica">Calamidad domestica</option>
              <option value="falta_marcado">Falta de marcado</option>
              <option value="permiso">Permiso</option>
            </select>
          </div>
          <div className="form-grid form-grid--2">
            <div>
              <label htmlFor="fecha_inicio">Fecha inicio</label>
              <input id="fecha_inicio" name="fecha_inicio" type="date" required />
            </div>
            <div>
              <label htmlFor="fecha_fin">Fecha fin</label>
              <input id="fecha_fin" name="fecha_fin" type="date" required />
            </div>
          </div>
          <div>
            <label htmlFor="motivo">Motivo y detalle</label>
            <textarea id="motivo" name="motivo" placeholder="Describe el motivo..." rows={5} required />
          </div>
          <div>
            <label htmlFor="justificativo">Documento justificativo</label>
            <input id="justificativo" className="file-input" name="justificativo" type="file" />
            <p className="field-hint">Opcional. Formatos habituales: PDF, JPG o PNG.</p>
          </div>
          <button className="btn btn--primary" type="submit">
            Enviar a revision
          </button>
        </form>
      </article>
    </section>
  );
}
