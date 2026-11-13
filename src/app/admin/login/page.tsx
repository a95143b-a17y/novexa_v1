import { redirect } from "next/navigation";

export default function AdminLoginRedirect() {
  redirect("/connexion?next=%2Fadmin");
}
