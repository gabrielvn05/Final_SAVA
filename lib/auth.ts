import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "superusuario" | "decano" | "secretaria" | "administrativo";
export type Capability =
  | "gestionar_usuarios"
  | "revisar_solicitudes"
  | "aprobar_solicitudes"
  | "generar_solicitudes";

export type UserProfile = {
  id: string;
  nombres: string;
  apellidos: string;
  rol: AppRole;
  activo: boolean;
};

export async function requireAuth() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombres, apellidos, rol, activo")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  return data as UserProfile;
}

export async function hasCapability(userId: string, capability: Capability): Promise<boolean> {
  const profile = await getUserProfile(userId);

  if (profile.rol === "superusuario") return true;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_capabilities")
    .select("capability")
    .eq("user_id", userId)
    .eq("capability", capability)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
