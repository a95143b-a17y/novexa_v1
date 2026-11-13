"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type UserRecord = {
  id: string; name: string; email: string; role: string;
  emailVerified: boolean; status: string; createdAt?: string;
};
const roleOptions = [
  { value: "learner", label: "Apprenant" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Enseignant" },
  { value: "institution_admin", label: "Admin. établissement" }
];

export default function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (query = search) => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/users?q=" + encodeURIComponent(query), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement des comptes impossible.");
      setUsers(data.users || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur de chargement.");
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { void load(""); }, [load]);

  async function updateRole(user: UserRecord, role: string) {
    if (role === user.role) return;
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      setMessage("Rôle de " + user.email + " mis à jour. L'utilisateur devra se reconnecter pour actualiser sa session.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur de modification.");
    } finally { setBusy(false); }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(search);
  }

  return (
    <section className="admin-section" id="accounts">
      <div className="admin-section-heading">
        <div><p className="admin-kicker">IDENTITÉS ET ACCÈS</p><h2>Gestion des comptes</h2></div>
        <span className="admin-count">RÔLES CONTRÔLÉS</span>
      </div>
      <div className="user-management">
        <div className="user-management-toolbar">
          <div><b>Utilisateurs NOVEXA</b><span>Recherche et attribution contrôlée des rôles non-administrateur.</span></div>
          <form className="user-search" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="user-search">Rechercher un utilisateur</label>
            <input id="user-search" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou e-mail" />
            <button type="submit" disabled={loading}>Rechercher</button>
          </form>
        </div>
        {message && <p className="user-management-success" role="status">{message}</p>}
        {error && <p className="user-management-error" role="alert">{error}</p>}
        {loading ? <p className="user-management-empty">Chargement des comptes…</p> :
          users.length === 0 ? <p className="user-management-empty">Aucun compte trouvé. La base doit être configurée et contenir des profils.</p> :
          <div className="user-table-wrap">
            <table className="user-table">
              <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>État</th></tr></thead>
              <tbody>{users.map((user) => (
                <tr key={user.id}>
                  <td><b>{user.name || "Sans nom"}</b><small>{user.email}</small></td>
                  <td><span className={user.emailVerified ? "email-state verified" : "email-state"}>{user.emailVerified ? "Vérifiée" : "Non vérifiée"}</span></td>
                  <td>{user.role === "platform_admin"
                    ? <span className="admin-role-protected">Administrateur NOVEXA · protégé</span>
                    : <select aria-label={"Rôle de " + user.email} value={user.role} disabled={busy} onChange={(event) => updateRole(user, event.target.value)}>
                        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>}</td>
                  <td><span className="account-status">{user.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
        <p className="user-management-foot">Le rôle administrateur principal n'est pas modifiable ici. Toute attribution de rôle est tracée dans le journal d'audit.</p>
      </div>
    </section>
  );
}
