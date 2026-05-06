import Link from "next/link";
import { solicitarCuenta } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";

export default function SolicitarCuentaPage() {
  return (
    <section className="stack" style={{ maxWidth: 840, margin: "0 auto", padding: "1.5rem" }}>
      <PageHeader
        title="Solicitar cuenta"
        subtitle="Completa el formulario. El Decano revisara y aprobara la creacion de tu usuario."
        actions={
          <Link href="/login" className="btn btn--secondary">
            Volver al login
          </Link>
        }
      />

      <article className="card stack">
        <form action={solicitarCuenta} className="stack">
          <div className="form-grid form-grid--2">
            <div>
              <label htmlFor="nombres">Nombres</label>
              <input id="nombres" name="nombres" required />
            </div>
            <div>
              <label htmlFor="apellidos">Apellidos</label>
              <input id="apellidos" name="apellidos" required />
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <div>
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" placeholder="correo@institucion.edu" required />
            </div>
            <div>
              <label htmlFor="rol_solicitado">Rol solicitado</label>
              <select id="rol_solicitado" name="rol_solicitado" defaultValue="administrativo">
                <option value="administrativo">Administrativo</option>
                <option value="secretaria">Secretaria</option>
                <option value="decano">Decano</option>
                <option value="superusuario">Superusuario</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="motivo">Motivo / unidad</label>
            <textarea id="motivo" name="motivo" rows={4} placeholder="Ej: Departamento, cargo, motivo de acceso..." />
          </div>
          <button className="btn btn--primary" type="submit">
            Enviar solicitud
          </button>
          <p className="field-hint">
            Nota: cuando el Decano apruebe, se creara tu cuenta y se asignara una contraseña temporal.
          </p>
        </form>
      </article>
    </section>
  );
}

