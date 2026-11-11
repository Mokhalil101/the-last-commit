"use strict";
/* ===== helpers & save ===== */
const $=s=>document.querySelector(s),A=$('#app'),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S=load(),G=null;
function load(){try{const d=JSON.parse(localStorage.getItem('tlc')||'{}');return{done:Array.isArray(d.done)?d.done:[],ach:Array.isArray(d.ach)?d.ach:[],sc:d.sc&&typeof d.sc==='object'&&!Array.isArray(d.sc)?d.sc:{}}}catch(e){return{done:[],ach:[],sc:{}}}}
function save(){try{localStorage.setItem('tlc',JSON.stringify(S))}catch(e){}}
const dp=()=>Object.values(S.sc).reduce((a,b)=>a+(+b||0),0);
const RK=[[0,'Coding Rookie'],[100,'Junior Developer'],[200,'Git Explorer'],[300,'Version Control Specialist'],[400,'Software Engineer'],[500,'Senior Developer'],[650,'Repository Guardian']];
const rank=()=>RK.filter(r=>dp()>=r[0]).pop()[1];
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2600)}
function unlock(n){if(!S.ach.includes(n)){S.ach.push(n);save();toast('🏆 '+n)}}
function modal(h){closeM();const m=document.createElement('div');m.className='mo';m.id='mo';m.innerHTML=`<div class="box" role="dialog" aria-modal="true">${h}</div>`;document.body.append(m)}
function closeM(){const m=$('#mo');if(m)m.remove()}
addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
