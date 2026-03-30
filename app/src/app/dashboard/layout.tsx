import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { OrganizationProvider } from "@/contexts/organization-context";
import { DashboardLocaleProvider } from "./locale-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const profileSettings = (profile?.settings as Record<string, unknown> | undefined) ?? {};
  const initialLocale =
    typeof profileSettings.locale === "string" ? profileSettings.locale : null;

  return (
    <OrganizationProvider userId={user.id}>
      <DashboardLocaleProvider initialLocale={initialLocale}>
        <DashboardShell user={user} profile={profile}>
          {children}
        </DashboardShell>
      </DashboardLocaleProvider>
    </OrganizationProvider>
  );
}
