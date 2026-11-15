"use client";
import { useState } from "react";
import Link from "next/link";

type Props={
  signedIn:boolean;
  paymentsConfigured:boolean;
  currentPlan:string|null;
  currentStatus:string|null;
  hasCustomer:boolean;
};

export default function BillingPlans({signedIn,paymentsConfigured,currentPlan,currentStatus,hasCustomer}:Props){
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  async function checkout(planCode:"level_2"|"level_3"){
    setBusy(planCode);setError("");setNotice("");
    try{
      const response=await fetch("/api/billing/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planCode})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Paiement indisponible.");
      if(typeof data.url!=="string")throw new Error("Lien de paiement manquant.");
      window.location.assign(data.url);
    }catch(cause){setError(cause instanceof Error?cause.message:"Une erreur est survenue.");setBusy("");}
  }
  async function portal(){
    setBusy("portal");setError("");setNotice("");
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
      <article className="billing-plan-card"><span className="billing-plan-kicker">NIVEAU 1 · GRATUIT</span><h2>Essentiel</h2><p className="billing-plan-price">0 € <small>/ toujours</small></p><p>Pour découvrir NOVEXA et organiser ses apprentissages.</p><ul><li>Profil et tableau de bord</li><li>Personnalisation de l’interface</li><li>Import de ressources personnelles</li><li>Fonctions de base</li></ul><Link className="billing-plan-button secondary" href={signedIn?"/app":"/inscription"}>{signedIn?"Accéder à mon espace":"Créer un compte gratuit"}</Link></article>
      <article className="billing-plan-card highlighted"><span className="billing-plan-kicker">NIVEAU 2 · PLUS</span><h2>Avancé</h2><p className="billing-plan-price">Tarif Stripe <small>/ abonnement</small></p><p>Pour approfondir les révisions et personnaliser les parcours.</p><ul><li>Outils pédagogiques avancés</li><li>Suivi de progression étendu</li><li>Assistants IA enrichis</li><li>Organisation avancée</li></ul>{active&&currentPlan==="level_2"?<button className="billing-plan-button" onClick={portal} disabled={!hasCustomer||Boolean(busy)}>{busy==="portal"?"Ouverture…":"Gérer mon abonnement"}</button>:<button className="billing-plan-button" onClick={()=>checkout("level_2")} disabled={!signedIn||!paymentsConfigured||Boolean(busy)||active}>{busy==="level_2"?"Préparation…":!signedIn?"Connectez-vous pour choisir":!paymentsConfigured?"Paiement test à configurer":"Choisir le niveau 2"}</button>}</article>
      <article className="billing-plan-card"><span className="billing-plan-kicker">NIVEAU 3 · EXPERT</span><h2>Expert</h2><p className="billing-plan-price">Tarif Stripe <small>/ abonnement</small></p><p>Pour un environnement d’apprentissage complet et des outils premium.</p><ul><li>Fonctionnalités premium prévues</li><li>Personnalisation approfondie</li><li>Assistants et contenus avancés</li><li>Outils supplémentaires selon le profil</li></ul>{active&&currentPlan==="level_3"?<button className="billing-plan-button" onClick={portal} disabled={!hasCustomer||Boolean(busy)}>{busy==="portal"?"Ouverture…":"Gérer mon abonnement"}</button>:<button className="billing-plan-button" onClick={()=>checkout("level_3")} disabled={!signedIn||!paymentsConfigured||Boolean(busy)||active}>{busy==="level_3"?"Préparation…":!signedIn?"Connectez-vous pour choisir":!paymentsConfigured?"Paiement test à configurer":"Choisir le niveau 3"}</button>}</article>
    </div>
    {active&&<p className="billing-current-status">Abonnement associé à votre compte : {currentPlan==="level_3"?"Niveau 3":"Niveau 2"} · état Stripe : {currentStatus}.</p>}
    {!paymentsConfigured&&<p className="billing-config-note">Les paiements ne sont pas encore configurés : les clés de test Stripe et les deux identifiants de prix doivent être ajoutés dans l’environnement Vercel. Les clés de paiement réelles restent désactivées.</p>}
    {!signedIn&&<p className="billing-config-note">Un compte NOVEXA est nécessaire pour souscrire à une formule payante.</p>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
    {notice&&<p className="auth-success" role="status">{notice}</p>}
  </>;
}