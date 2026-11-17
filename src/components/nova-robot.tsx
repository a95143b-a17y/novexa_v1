"use client";
import {useId} from "react";
import styles from "./nova-robot.module.css";
type Props={name?:string;size?:"compact"|"large";className?:string};
export default function NovaRobot({name="NOVA",size="compact",className=""}:Props){
 const id=useId().replace(/:/g,""),screen="robot-screen-"+id,glow="robot-glow-"+id;
 return <div className={[styles.robotStage,size==="large"?styles.robotStageLarge:styles.robotStageCompact,className].filter(Boolean).join(" ")} role="img" aria-label={name+", robot assistant NOVEXA"}>
 <span className={styles.aura}/><span className={styles.orbit}><i/></span><svg className={styles.robotSvg} viewBox="0 0 260 260" aria-hidden="true">
 <defs><linearGradient id={screen} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#152D53"/><stop offset=".55" stopColor="#101B3A"/><stop offset="1" stopColor="#39285D"/></linearGradient><radialGradient id={glow}><stop offset="0" stopColor="#83F1FF" stopOpacity=".85"/><stop offset="1" stopColor="#83F1FF" stopOpacity="0"/></radialGradient></defs>
 <ellipse cx="130" cy="234" rx="69" ry="12" className={styles.shadow}/><g className={styles.robotBody}>
 <path d="M91 151Q70 159 60 180L50 203Q47 213 57 217Q67 220 72 211L91 185" className={[styles.armShape,styles.leftArm].join(" ")}/><path d="M169 151Q190 159 200 180L210 203Q213 213 203 217Q193 220 188 211L169 185" className={[styles.armShape,styles.rightArm].join(" ")}/>
 <circle cx="55" cy="215" r="9" className={styles.hand}/><circle cx="205" cy="215" r="9" className={styles.hand}/><rect x="91" y="145" width="78" height="70" rx="24" className={styles.torso}/><rect x="103" y="159" width="54" height="40" rx="13" className={styles.chestScreen}/><path d="M113 178Q130 166 147 178" className={styles.chestWave}/><circle cx="130" cy="207" r="4" className={styles.core}/>
 <path d="M130 47V30" className={styles.antenna}/><circle cx="130" cy="25" r="10" className={styles.antennaOrb}/><path d="M117 20L130 2L143 20L130 15Z" className={styles.star}/><rect x="63" y="54" width="134" height="105" rx="39" className={styles.head}/><rect x="76" y="67" width="108" height="79" rx="29" fill={"url(#"+screen+")"} className={styles.faceScreen}/><ellipse cx="130" cy="107" rx="68" ry="48" fill={"url(#"+glow+")"} className={styles.faceGlow}/>
 <g className={styles.eyes}><ellipse cx="105" cy="101" rx="8" ry="12" className={styles.eye}/><ellipse cx="155" cy="101" rx="8" ry="12" className={styles.eye}/></g><path d="M113 123Q130 136 147 123" className={styles.smile}/><circle cx="79" cy="106" r="7" className={styles.cheek}/><circle cx="181" cy="106" r="7" className={styles.cheek}/><rect x="52" y="91" width="11" height="37" rx="5" className={styles.ear}/><rect x="197" y="91" width="11" height="37" rx="5" className={styles.ear}/><path d="M94 152Q130 167 166 152" className={styles.neckRing}/>
 </g></svg><span className={styles.namePlate}>{name.toUpperCase()}</span><span className={styles.sparkleOne}>✦</span><span className={styles.sparkleTwo}>✧</span></div>;
}