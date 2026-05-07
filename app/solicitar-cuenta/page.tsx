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
    <div className="solicitar-cuenta-page">
      <div className="solicitar-cuenta-page__inner">
        <PageHeader
          title="Solicitar cuenta"
          subtitle="Si trabajas o colaboras con la facultad y aún no tienes acceso, envía una solicitud. El Decanato la revisará y, si corresponde, se creará tu usuario."
          actions={
            <Link href="/login" className="btn btn--secondary">
              Volver al login
            </Link>
          }
        />

        <p className="field-hint" style={{ margin: "-0.5rem 0 0" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
          .
        </p>

        {mensaje ? (
          <div className="alert alert--warning" role="alert">
            {mensaje}
          </div>
        ) : null}

        <article className="card stack solicitar-cuenta-form">
          <h2 className="solicitar-cuenta-form__title">Datos de la solicitud</h2>
          <p className="field-hint" style={{ marginTop: 0 }}>
            Usa un correo institucional válido. Recibirás acceso cuando un Decano apruebe la solicitud (puede asignarse una contraseña temporal).
          </p>
          <form action={solicitarCuenta} className="stack">
            <div className="form-grid form-grid--2">
              <div>
                <label htmlFor="nombres">Nombres</label>
                <input id="nombres" name="nombres" required autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="apellidos">Apellidos</label>
                <input id="apellidos" name="apellidos" required autoComplete="family-name" />
              </div>
            </div>
            <div className="form-grid form-grid--2">
              <div>
                <label htmlFor="email">Correo institucional</label>
                <input id="email" name="email" type="email" placeholder="correo@institucion.edu" required autoComplete="email" />
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
              <label htmlFor="motivo">Motivo / unidad / cargo</label>
              <textarea id="motivo" name="motivo" rows={4} placeholder="Ej: Departamento, cargo, motivo de acceso..." />
            </div>
            <button className="btn btn--primary" type="submit" style={{ width: "100%", maxWidth: 320 }}>
              Enviar solicitud
            </button>
            <p className="field-hint" style={{ marginBottom: 0 }}>
              Al enviar, aceptas que los datos se usen solo para gestionar el acceso al sistema académico.
            </p>
          </form>
        </article>
      </div>
    </div>
  );
}
