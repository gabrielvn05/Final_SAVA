import Link from "next/link";
import { solicitarCuenta } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";

type PageProps = Readonly<{
  searchParams: Record<string, string | string[] | undefined>;
}>;

function avisoText(aviso: string | undefined, detalle?: string | undefined) {
  if (aviso === "usuario_existe") {
    return "Este correo ya está registrado en el sistema. Inicia sesión o usa otro correo institucional.";
  }
  if (aviso === "solicitud_pendiente") {
    return "Ya existe una solicitud de cuenta pendiente de aprobación para este correo. Espera la respuesta del Decano o contacta a Secretaría.";
  }
  if (aviso === "correo_invalido") {
    return "Indica un correo electrónico válido.";
  }
  if (aviso === "error") {
    return detalle ? `No se pudo enviar la solicitud: ${detalle}` : "No se pudo enviar la solicitud. Intenta de nuevo más tarde.";
  }
  return null;
}

export default function SolicitarCuentaPage({ searchParams }: PageProps) {
  const avisoParam = typeof searchParams.aviso === "string" ? searchParams.aviso : undefined;
  const detalleParam = typeof searchParams.detalle === "string" ? searchParams.detalle : undefined;
  const mensaje = avisoText(avisoParam, detalleParam ? decodeURIComponent(detalleParam) : undefined);

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

      {mensaje ? (
        <div className="alert alert--warning" role="alert">
          {mensaje}
        </div>
      ) : null}

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
