import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import AdminDashboard from "./admin-dashboard";

export const metadata: Metadata = { title: "Console administrateur" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/admin/login");
  if (session.user.role !== "platform_admin") redirect("/app");
  return <AdminDashboard />;
}
