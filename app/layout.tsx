import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { ReactNode } from "react";

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = user ? await getUserProfile(user.id) : null;

  return (
    <html lang="es">
      <body>
        {user && profile ? (
          <AppShell profile={profile} userEmail={user.email}>
            {children}
          </AppShell>
        ) : (
          <div className="app-public">{children}</div>
        )}
      </body>
    </html>
  );
}
