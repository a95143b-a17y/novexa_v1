import Image from "next/image";
import Link from "next/link";
type Props={href?:string|null;width?:number;height?:number;className?:string;priority?:boolean};
export default function NovexaLogo({href="/",width=260,height=85,className="novexa-brand-img",priority=false}:Props){
 const image=<Image src="/novexa-logo.jpg" alt="NOVEXA — Apprendre sans limites. Évoluer à son rythme." width={width} height={height} priority={priority} sizes="(max-width: 700px) 180px, 260px" className={className}/>;
 return href===null?image:<Link href={href} aria-label="Accueil NOVEXA" className="novexa-brand-link">{image}</Link>;
}