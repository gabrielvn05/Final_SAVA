import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=1");
  }

  redirect("/dashboard");
}

export default function LoginPage() {
  return (
    <section className="card stack" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>Ingreso al sistema</h1>
      <form action={login} className="stack">
        <input name="email" type="email" placeholder="Correo institucional" required />
        <input name="password" type="password" placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
      <p style={{ margin: 0, fontSize: 14 }}>
        Los usuarios se crean desde el módulo de administración por el rol Decano.
      </p>
    </section>
  );
}
