"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./billing-comparison.module.css";

type Props={
  signedIn:boolean;
  paymentsConfigured:boolean;
  currentPlan:string|null;
  currentStatus:string|null;
  hasCustomer:boolean;
};

const comparisonRows = [
  ["Compte personnel et tableau de bord","Inclus","Inclus","Inclus"],
  ["Personnalisation de l’apparence","Incluse","Incluse","Incluse"],
  ["Import et bibliothèque de documents","Fonctions initiales","Fonctions initiales","Fonctions initiales"],
  ["Catalogue pédagogique France","Version pilote","Version pilote","Version pilote"],
  ["Quiz et suivi des leçons","Version initiale","Version initiale","Version initiale"],
  ["50 réglages avancés supplémentaires","Inclus","Inclus","Inclus"],
  ["Organisation du planning","Fonctions de base prévues","Outils avancés prévus","Mode adaptatif prévu"],
  ["Assistant IA","Usage de base prévu","Usage étendu prévu","Usage renforcé prévu"],
  ["Assistants spécialisés par matière","—","—","Prévu"],
  ["Vidéos pédagogiques personnalisées","—","Prévu","Prévu"],
  ["Examens blancs","—","Entraînement prévu","Simulations prévues"],
  ["Catalogue international complet","À venir","À venir","À venir"]
];

export default function BillingPlans({signedIn,paymentsConfigured,currentPlan,currentStatus,hasCustomer}:Props){
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  async function checkout(planCode:"level_2"|"level_3"){
    setBusy(planCode);setError("");
    try{
      const response=await fetch("/api/billing/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planCode})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Paiement indisponible.");
      if(typeof data.url!=="string")throw new Error("Lien de paiement manquant.");
      window.location.assign(data.url);
    }catch(cause){setError(cause instanceof Error?cause.message:"Une erreur est survenue.");setBusy("");}
  }
  async function portal(){
    setBusy("portal");setError("");
    try{
      const response=await fetch("/api/billing/portal",{method:"POST"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Gestion de l’abonnement indisponible.");
      window.location.assign(data.url);
    }catch(cause){setError(cause instanceof Error?cause.message:"Une erreur est survenue.");setBusy("");}
  }
  const active=Boolean(currentStatus&&["active","trialing","past_due","unpaid"].includes(currentStatus));
  return <>
    <div className="billing-plan-grid">
      <article className="billing-plan-card">
        <span className="billing-plan-kicker">NIVEAU 1 · GRATUIT</span>
        <h2>Découverte</h2>
        <p className="billing-plan-price">0 € <small>/ toujours</small></p>
        <p>Pour découvrir NOVEXA et organiser ses premiers apprentissages.</p>
        <ul><li>Compte et tableau de bord</li><li>Personnalisation de l’espace</li><li>Documents et bibliothèque</li><li>Quiz et suivi initial</li></ul>
        <Link className="billing-plan-button secondary" href={signedIn?"/app":"/inscription"}>{signedIn?"Accéder à mon espace":"Créer un compte gratuit"}</Link>
      </article>
      <article className="billing-plan-card highlighted">
        <span className="billing-plan-kicker">NIVEAU 2 · PLUS</span>
        <h2>Plus</h2>
        <p className="billing-plan-price">7 € <small>/ mois</small></p>
        <p>Pour approfondir les révisions et gagner en organisation.</p>
        <ul><li>Tout le niveau Découverte</li><li>Outils pédagogiques avancés prévus</li><li>Suivi de progression étendu prévu</li><li>Assistant IA enrichi prévu</li></ul>
        {active&&currentPlan==="level_2"
          ?<button className="billing-plan-button" onClick={portal} disabled={!hasCustomer||Boolean(busy)}>{busy==="portal"?"Ouverture…":"Gérer mon abonnement"}</button>
          :<button className="billing-plan-button" onClick={()=>checkout("level_2")} disabled={!signedIn||!paymentsConfigured||Boolean(busy)||active}>{busy==="level_2"?"Préparation…":!signedIn?"Connectez-vous pour choisir":!paymentsConfigured?"Paiement test non configuré":"Choisir Plus"}</button>}
      </article>
      <article className="billing-plan-card">
        <span className="billing-plan-kicker">NIVEAU 3 · PREMIUM</span>
        <h2>Premium</h2>
        <p className="billing-plan-price">10 € <small>/ mois</small></p>
        <p>Pour viser un environnement d’apprentissage plus complet.</p>
        <ul><li>Tout le niveau Plus</li><li>Assistants spécialisés prévus</li><li>Vidéos pédagogiques prévues</li><li>Examens blancs et simulations prévus</li></ul>
        {active&&currentPlan==="level_3"
          ?<button className="billing-plan-button" onClick={portal} disabled={!hasCustomer||Boolean(busy)}>{busy==="portal"?"Ouverture…":"Gérer mon abonnement"}</button>
          :<button className="billing-plan-button" onClick={()=>checkout("level_3")} disabled={!signedIn||!paymentsConfigured||Boolean(busy)||active}>{busy==="level_3"?"Préparation…":!signedIn?"Connectez-vous pour choisir":!paymentsConfigured?"Paiement test non configuré":"Choisir Premium"}</button>}
      </article>
    </div>

    <section className={styles.comparison}>
      <div className={styles.heading}><p>COMPARATIF DES FORMULES</p><h2>Les différences, <em>ligne par ligne.</em></h2><span>Tarifs mensuels affichés : niveau 1 gratuit, niveau 2 à 7 €, niveau 3 à 10 €.</span></div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Fonctionnalités</th><th>Découverte<br/><small>0 €</small></th><th>Plus<br/><small>7 € / mois</small></th><th>Premium<br/><small>10 € / mois</small></th></tr></thead>
          <tbody>{comparisonRows.map(row=><tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody>
        </table>
      </div>
      <p className={styles.note}>Transparence : « Prévu » ou « À venir » désigne une fonctionnalité qui n’est pas encore disponible. Le tableau présente la répartition cible des formules, pas une promesse de disponibilité immédiate.</p>
    </section>

    {active&&<p className="billing-current-status">Abonnement associé à votre compte : {currentPlan==="level_3"?"Niveau 3":"Niveau 2"} · état Stripe : {currentStatus}.</p>}
    {!paymentsConfigured&&<p className="billing-config-note">Les prix sont définis pour le modèle NOVEXA, mais le paiement en ligne reste désactivé : les identifiants de prix Stripe en mode test ne sont pas configurés. Aucun prélèvement réel n’est possible depuis cette version.</p>}
    {!signedIn&&<p className="billing-config-note">Un compte NOVEXA est nécessaire pour souscrire à une formule payante.</p>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
  </>;
}
