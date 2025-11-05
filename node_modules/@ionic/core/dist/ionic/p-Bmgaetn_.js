/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import{a as o,w as s}from"./p-C8IsBmNU.js";import{f as t,s as r}from"./p-CwgG81ZD.js";import{c as a}from"./p-CTfR9YZG.js";const n=()=>{const n=window;n.addEventListener("statusTap",(()=>{o((()=>{const o=document.elementFromPoint(n.innerWidth/2,n.innerHeight/2);if(!o)return;const m=t(o);m&&new Promise((o=>a(m,o))).then((()=>{s((async()=>{m.style.setProperty("--overflow","hidden"),await r(m,300),m.style.removeProperty("--overflow")}))}))}))}))};export{n as startStatusTap}