"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

type DocumentItem = {
  id: string;
  file_name: string;
  content_type: string;
  file_size_bytes: number;
  image_width: number | null;
  image_height: number | null;
  created_at: string;
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
async function imageDimensions(file: File): Promise<{width:number;height:number}> {
  if (!file.type.startsWith("image/")) return {width:0,height:0};
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve,reject)=>{
      const element = new Image();
      element.onload=()=>resolve(element);
      element.onerror=()=>reject(new Error("Impossible de lire les dimensions de cette image."));
      element.src=url;
    });
    return {width:image.naturalWidth,height:image.naturalHeight};
  } finally { URL.revokeObjectURL(url); }
}

export default function DocumentLibrary({compact=false}:{compact?:boolean}) {
  const [documents,setDocuments]=useState<DocumentItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const input=useRef<HTMLInputElement>(null);

  async function refresh() {
    const response=await fetch("/api/documents",{cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||"Impossible de charger les documents.");
    setDocuments(Array.isArray(data.documents)?data.documents:[]);
  }
  useEffect(()=>{
    let active=true;
    fetch("/api/documents",{cache:"no-store"})
      .then(async response=>{
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||"Bibliothèque indisponible.");
        if(active)setDocuments(Array.isArray(data.documents)?data.documents:[]);
      })
      .catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Bibliothèque indisponible.");})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);

  async function upload(event:ChangeEvent<HTMLInputElement>) {
    const files=Array.from(event.target.files||[]);
    event.target.value="";
    if(!files.length)return;
    setBusy(true);setError("");setMessage("");
    try {
      for(const file of files) {
        if(file.size>4*1024*1024)throw new Error(`${file.name} dépasse la limite de 4 Mo.`);
        const dimensions=await imageDimensions(file);
        const form=new FormData();
        form.append("file",file);
        if(dimensions.width)form.append("imageWidth",String(dimensions.width));
        if(dimensions.height)form.append("imageHeight",String(dimensions.height));
        const response=await fetch("/api/documents",{method:"POST",body:form});
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||`L’import de ${file.name} a échoué.`);
      }
      await refresh();
      setMessage(files.length===1?"Document importé dans votre espace privé.":`${files.length} documents importés dans votre espace privé.`);
    }catch(cause){setError(cause instanceof Error?cause.message:"Une importation a échoué.");}
    finally{setBusy(false);}
  }

  async function remove(id:string) {
    setBusy(true);setError("");setMessage("");
    try {
      const response=await fetch(`/api/documents/${encodeURIComponent(id)}`,{method:"DELETE"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"La suppression a échoué.");
      setDocuments(current=>current.filter(document=>document.id!==id));
      setMessage("Document supprimé.");
    }catch(cause){setError(cause instanceof Error?cause.message:"La suppression a échoué.");}
    finally{setBusy(false);}
  }

  return <section className={compact?"document-library compact":"document-library"}>
    <div className="document-upload-row">
      <div><strong>Bibliothèque personnelle</strong><p>PDF, DOCX, PPTX, PNG, JPG, WebP, GIF, AVIF ou TXT · 4 Mo maximum par fichier</p></div>
      <button type="button" className="auth-submit" onClick={()=>input.current?.click()} disabled={busy}>{busy?"Import en cours…":"Importer des fichiers"} <span>↥</span></button>
      <input ref={input} type="file" multiple accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.gif,.avif,.txt,application/pdf,image/*" onChange={upload} hidden aria-label="Sélectionner les documents à importer"/>
    </div>
    <p className="document-privacy-note">🔒 Stockage privé : vos fichiers ne sont pas publiquement accessibles. Les images sont conservées dans leur format original, sans redimensionnement ni recadrage à l’import.</p>
    {loading&&<p className="document-state">Chargement des documents…</p>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
    {message&&<p className="auth-success" role="status">{message}</p>}
    {!loading&&documents.length===0&&!error&&<div className="document-empty"><strong>Aucun document importé</strong><p>Ajoutez vos cours, fiches et programmes pour les retrouver depuis votre espace.</p></div>}
    {documents.length>0&&<div className="document-grid">{documents.map(document=><article className="document-card" key={document.id}>
      {document.content_type.startsWith("image/")&&<a href={`/api/documents/${document.id}/download?inline=1`} target="_blank" rel="noreferrer" className="document-image-frame"><img src={`/api/documents/${document.id}/download?inline=1`} alt={document.file_name} style={{width:"100%",height:"auto",objectFit:"contain"}}/></a>}
      <div className="document-card-body"><strong>{document.file_name}</strong><small>{document.content_type} · {formatSize(Number(document.file_size_bytes))}</small>
        {document.image_width&&document.image_height&&<small>{document.image_width} × {document.image_height} px · proportions conservées</small>}
        <div><a href={`/api/documents/${document.id}/download`}>Télécharger</a><button type="button" onClick={()=>remove(document.id)} disabled={busy}>Supprimer</button></div>
      </div>
    </article>)}</div>}
  </section>;
}