"use client";

import { useEffect, useState } from "react";
import { useNovexaAppearance, type NovexaAppearance } from "@/components/appearance-provider";
import AppearanceStudio from "@/components/appearance-studio";

const accentChoices:[NovexaAppearance["accent"],string,string][]=[
  ["violet","Violet","#8975dc"],["blue","Bleu","#4b91d1"],["mint","Menthe","#48a994"],["rose","Rose","#d77eaa"]
];
const backgrounds:[NovexaAppearance["background"],string,string][]=[
  ["aurora","Aurore","Dégradé violet et bleu"],["paper","Papier","Clair et éditorial"],["midnight","Minuit","Bleu profond"],["forest","Forêt","Vert naturel"]
];
export default function AppearanceSettings(){
  const {appearance,saveAppearance,ready}=useNovexaAppearance();
  const [draft,setDraft]=useState(appearance);
  const [status,setStatus]=useState("");
  useEffect(()=>setDraft(appearance),[appearance]);
  if(!ready)return <main className="appearance-settings"><p>Chargement de vos préférences…</p></main>;
  function update<K extends keyof NovexaAppearance>(key:K,value:NovexaAppearance[K]){setDraft(current=>({...current,[key]:value,...(key==="background"&&value!=="custom"?{customImage:undefined}:{})}));}
  async function save(){setStatus("Enregistrement…");const ok=await saveAppearance(draft);setStatus(ok?"Préférences enregistrées dans votre compte.":"Préférences enregistrées sur cet appareil. La synchronisation du compte nécessite la base de données.");}
  return <main className="appearance-settings">
    <header><p className="auth-eyebrow">VOTRE ESPACE · PARAMÈTRES</p><h1>Votre apparence.</h1><p>Personnalisez NOVEXA et retrouvez vos réglages sur vos appareils lorsque votre compte est synchronisé.</p><p><a href="/personnalisation">Accéder aux 60 réglages initiaux →</a></p><p><a href="/personnalisation/avancee">Accéder aux 50 réglages avancés →</a></p></header>
    <section><h2>Thème</h2><div className="appearance-choice-row">
      <button className={draft.theme==="light"?"active":""} onClick={()=>update("theme","light")}><span className="appearance-theme-preview light"/>Clair</button>
      <button className={draft.theme==="dark"?"active":""} onClick={()=>update("theme","dark")}><span className="appearance-theme-preview dark"/>Sombre</button>
    </div></section>
    <section><h2>Ambiance de fond</h2><div className="appearance-bg-grid">{backgrounds.map(([id,label,description])=><button key={id} className={"appearance-bg "+(draft.background===id?"active":"")} onClick={()=>update("background",id)}><span className={"appearance-bg-swatch bg-"+id}/><b>{label}</b><small>{description}</small></button>)}</div></section>
    <section><h2>Couleur d’accent</h2><div className="appearance-accent-row">{accentChoices.map(([id,label,color])=><button key={id} title={label} aria-label={label} aria-pressed={draft.accent===id} className={draft.accent===id?"active":""} style={{backgroundColor:color}} onClick={()=>update("accent",id)}/>)}</div></section>
    <AppearanceStudio value={draft} onChange={setDraft} sections="all" />
    <section className="appearance-toggles"><label><span><b>Style écrivain</b><small>Typographie et présentation éditoriales</small></span><input type="checkbox" checked={draft.writer} onChange={e=>update("writer",e.target.checked)}/></label><label><span><b>Animations et transitions</b><small>Effets visuels subtils dans l’interface</small></span><input type="checkbox" checked={draft.motion} onChange={e=>update("motion",e.target.checked)}/></label></section>
    <button className="auth-submit appearance-save" onClick={save}>Enregistrer mes préférences ↗</button>{status&&<p role="status" className="auth-hint">{status}</p>}
  </main>;
}
