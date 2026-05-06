import Link from "next/link";
import { getUserProfile, hasCapability, requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const profile = await getUserProfile(user.id);

  const [puedeRevisar, puedeAprobar, puedeGestionar] = await Promise.all([
    hasCapability(user.id, "revisar_solicitudes"),
    hasCapability(user.id, "aprobar_solicitudes"),
    hasCapability(user.id, "gestionar_usuarios")
  ]);

  return (
    <section className="stack">
      <article className="card stack">
        <h1 style={{ margin: 0 }}>Bienvenido/a, {profile.nombres}</h1>
        <p style={{ margin: 0 }}>
          Rol principal: <strong>{profile.rol}</strong>
        </p>
      </article>

      <article className="card stack">
        <h2 style={{ margin: 0 }}>Accesos habilitados</h2>
        <div className="row">
          <Link href="/solicitudes">Ver, crear y editar solicitudes</Link>
          {puedeRevisar && <span>Revisión de secretaría habilitada</span>}
          {puedeAprobar && <span>Aprobación/firma habilitada</span>}
          {puedeGestionar && <Link href="/admin/usuarios">Crear usuarios y delegar</Link>}
        </div>
      </article>
    </section>
  );
}
