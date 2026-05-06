import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function fieldText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function login(formData: FormData) {
  "use server";

  const email = fieldText(formData, "email");
  const password = fieldText(formData, "password");
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=1");
  }

  redirect("/dashboard");
}

type LoginPageProps = Readonly<{
  searchParams: Record<string, string | string[] | undefined>;
}>;

export default function LoginPage({ searchParams }: LoginPageProps) {
  const hasError = searchParams.error === "1";

  return (
    <div className="login-page">
      <aside className="login-hero">
        <span className="login-hero__badge">Acceso institucional</span>
        <img
          src="/branding/uleam-horizontal.png"
          alt="ULEAM"
          style={{ maxWidth: 240, width: "100%", height: "auto" }}
        />
        <h1>Gestion de permisos y justificaciones</h1>
        <p>Plataforma para registrar solicitudes, adjuntar justificativos y completar el flujo de firma.</p>
      </aside>
      <div className="login-panel">
        <div className="card stack" style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ margin: 0 }}>Iniciar sesion</h2>
          {hasError ? (
            <div className="alert alert--error" role="alert">
              Credenciales incorrectas o usuario sin perfil.
            </div>
          ) : null}
          <form action={login} className="stack">
            <div>
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" placeholder="usuario@institucion.edu" required />
            </div>
            <div>
              <label htmlFor="password">Contrasena</label>
              <input id="password" name="password" type="password" placeholder="********" required />
            </div>
            <button className="btn btn--primary" type="submit" style={{ width: "100%" }}>
              Entrar al sistema
            </button>
          </form>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <a className="btn btn--link btn--sm" href="/solicitar-cuenta">
              Solicitar cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
