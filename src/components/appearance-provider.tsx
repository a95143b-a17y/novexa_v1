"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type NovexaAppearance = {
  theme: "light" | "dark";
  accent: "violet" | "blue" | "mint" | "rose";
  background: "aurora" | "paper" | "midnight" | "forest" | "custom";
  backgroundColor?: string;
  customImage?: string;
  writer: boolean;
  motion: boolean;
};
const defaults: NovexaAppearance = {theme:"dark",accent:"violet",background:"aurora",backgroundColor:"#101a36",writer:true,motion:true};
type AppearanceContextValue = {appearance:NovexaAppearance;saveAppearance:(value:NovexaAppearance)=>Promise<boolean>;ready:boolean};
const AppearanceContext=createContext<AppearanceContextValue|null>(null);
const storageKey="novexa-appearance";
const validHex=(value:unknown):value is string=>typeof value==="string"&&/^#[0-9a-fA-F]{6}$/.test(value);

function applyAppearance(value:NovexaAppearance) {
  const root=document.documentElement;
  root.dataset.novexaTheme=value.theme;
  root.dataset.novexaPalette=value.accent;
  root.dataset.novexaBackground=value.background;
  root.dataset.novexaWriter=value.writer?"on":"off";
  root.dataset.novexaMotion=value.motion?"on":"off";
  root.style.colorScheme=value.theme;
  if(validHex(value.backgroundColor)) root.style.setProperty("--novexa-user-background",value.backgroundColor);
  else root.style.removeProperty("--novexa-user-background");
  if(value.customImage?.startsWith("data:image/")&&value.customImage.length<1_700_000) root.style.setProperty("--novexa-wallpaper",`url("${value.customImage}")`);
  else root.style.removeProperty("--novexa-wallpaper");
}

export function AppearanceProvider({children}:{children:ReactNode}) {
  const [appearance,setAppearance]=useState<NovexaAppearance>(defaults);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let local=defaults;
    try {
      const parsed=JSON.parse(localStorage.getItem(storageKey)||"{}");
      const customImage=typeof parsed.customImage==="string"&&parsed.customImage.startsWith("data:image/")&&parsed.customImage.length<1_700_000?parsed.customImage:undefined;
      local={
        theme:parsed.theme==="light"?"light":"dark",
        accent:["violet","blue","mint","rose"].includes(parsed.accent)?parsed.accent:"violet",
        background:customImage&&parsed.background==="custom"?"custom":(["aurora","paper","midnight","forest"].includes(parsed.background)?parsed.background:"aurora"),
        backgroundColor:validHex(parsed.backgroundColor)?parsed.backgroundColor:defaults.backgroundColor,
        customImage,
        writer:typeof parsed.writer==="boolean"?parsed.writer:true,
        motion:typeof parsed.motion==="boolean"?parsed.motion:true
      };
    } catch {}
    setAppearance(local); applyAppearance(local);
    fetch("/api/profile/appearance",{cache:"no-store"}).then(async response=>{
      if(!response.ok)return;
      const payload=await response.json();
      const saved=payload.appearance;
      if(!saved||!Object.keys(saved).length)return;
      const merged={...local,...saved,backgroundColor:validHex(saved.backgroundColor)?saved.backgroundColor:local.backgroundColor,background:local.customImage&&local.background==="custom"?"custom":saved.background,customImage:local.customImage} as NovexaAppearance;
      setAppearance(merged);applyAppearance(merged);
      try{localStorage.setItem(storageKey,JSON.stringify({...JSON.parse(localStorage.getItem(storageKey)||"{}"),...merged}));}catch{}
    }).catch(()=>{}).finally(()=>setReady(true));
    if(!localStorage.getItem(storageKey))setReady(true);
  },[]);
  const saveAppearance=useCallback(async(value:NovexaAppearance)=>{
    setAppearance(value);applyAppearance(value);
    try{const current=JSON.parse(localStorage.getItem(storageKey)||"{}");localStorage.setItem(storageKey,JSON.stringify({...current,...value}));}catch{}
    try{
      const response=await fetch("/api/profile/appearance",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({appearance:{...value,background:value.background==="custom"?"aurora":value.background,customImage:undefined}})});
      return response.ok;
    }catch{return false;}
  },[]);
  const value=useMemo(()=>({appearance,saveAppearance,ready}),[appearance,saveAppearance,ready]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export function useNovexaAppearance(){
  const context=useContext(AppearanceContext);
  if(!context)throw new Error("useNovexaAppearance doit être utilisé dans AppearanceProvider.");
  return context;
}
