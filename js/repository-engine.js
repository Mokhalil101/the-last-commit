"use strict";
/* ===== simulated git engine (pure data, never touches real files or shell) ===== */
const T=(r,id)=>id&&r.c[id]?r.c[id].t:{},cur=r=>r.b[r.h],hasM=s=>/^<{7} /m.test(s||'');
const vb=n=>/^[A-Za-z0-9][\w./-]*$/.test(n||'')&&!/^(__proto__|constructor|prototype)$/.test(n);
const newRepo=()=>({w:{},st:{},c:{},b:{main:null},h:'main',n:0,mg:null,ro:null,rm:null,pipe:0,m:null,sh:[]});
function anc(r,id){const s=new Set,q=[id];while(q.length){const x=q.pop();if(x&&!s.has(x)){s.add(x);q.push(...r.c[x].p)}}return s}
function mbase(r,a,b){const B=anc(r,b),q=[a],seen=new Set;while(q.length){const x=q.shift();if(!x||seen.has(x))continue;seen.add(x);if(B.has(x))return x;q.push(...r.c[x].p)}return null}
function mkc(r,msg,p){const id=((++r.n*2654435761+97)>>>0).toString(16).padStart(8,'0').slice(0,7);r.c[id]={id,m:msg,p,t:{...T(r,cur(r)),...r.st},ts:r.n};r.b[r.h]=id;r.st={};return id}
function stat(r){const h=T(r,cur(r)),o={staged:[],mod:[],unt:[],unm:[]};
 for(const f in r.st)if(r.st[f]!==h[f])o.staged.push(f);
 for(const f in r.w){const b=f in r.st?r.st[f]:h[f];if(b===undefined){if(!(f in r.st))o.unt.push(f)}else if(r.w[f]!==b)(r.mg&&hasM(r.w[f])?o.unm:o.mod).push(f)}
 return o}
const clean=r=>{const s=stat(r);return!s.staged.length&&!s.mod.length&&!s.unm.length&&!r.mg};
function co(r,id){const u={};stat(r).unt.forEach(f=>u[f]=r.w[f]);r.w={...T(r,id),...u};r.st={}}
function rid(r,s){if(!s)return null;if(s==='HEAD')return cur(r);const m=s.match(/^HEAD~(\d)$/);if(m){let x=cur(r);for(let i=0;i<+m[1]&&x;i++)x=r.c[x].p[0];return x}
 if(has(r.b,s))return r.b[s];return Object.keys(r.c).find(k=>k.startsWith(s))||null}
const dt=(a,b)=>{let o='';for(const f of new Set([...Object.keys(a),...Object.keys(b)])){if(a[f]===b[f])continue;const x=(a[f]??'').split('\n'),y=(b[f]??'').split('\n');o+=`--- a/${f}\n+++ b/${f}\n`+[...x.filter(l=>!y.includes(l)).map(l=>'-'+l),...y.filter(l=>!x.includes(l)).map(l=>'+'+l)].join('\n')+'\n'}return o};
const HELP=`Supported: git rebase <branch> | stash [pop] | cherry-pick | status | add | commit -m | log | show | diff | branch | switch/checkout [-b] | merge | restore [--staged] | revert | reset [--hard] | push | fetch | pull | remote -v
Also: npm test, pipeline, ls, cat <file>, touch <file>, clear`;
function cmerge(o,t,b,n){const x=o.split('\n'),y=t.split('\n'),z=b.split('\n');
 if(x.length!==y.length||x.length!==z.length)return`<<<<<<< HEAD\n${o}\n=======\n${t}\n>>>>>>> ${n}`;
 const out=[];let a=[],c=[];const fl=()=>{if(a.length){out.push('<<<<<<< HEAD',...a,'=======',...c,'>>>>>>> '+n);a=[];c=[]}};
 x.forEach((l,i)=>{if(l===y[i]||y[i]===z[i]){fl();out.push(l)}else if(l===z[i]){fl();out.push(y[i])}else{a.push(l);c.push(y[i])}});fl();return out.join('\n')}
function git(r,a){const c=a[0],A=a.slice(1),hd=cur(r),h=T(r,hd);
 switch(c){
 case'status':{const s=stat(r);let o=`On branch ${r.h}`;if(r.ro&&r.h==='main')o+=r.rm===hd?"\nYour branch is up to date with 'origin/main'.":"\nYour branch is ahead of 'origin/main'.";
  if(r.mg)o+=`\nYou have unmerged paths (merging '${r.mg.n}').`;
  const L=(t,x)=>x.length?`\n\n${t}\n`+x.join('\n'):'';
  o+=L('Changes to be committed:',s.staged.map(f=>`\t${f in h?'modified:   ':'new file:   '}${f}`))+L('Unmerged paths (conflict markers present):',s.unm.map(f=>`\tboth modified:   ${f}`))+L('Changes not staged for commit:',s.mod.map(f=>`\tmodified:   ${f}`))+L('Untracked files:',s.unt.map(f=>`\t${f}`));
  return o+(s.staged.length+s.mod.length+s.unt.length+s.unm.length?'':'\n\nnothing to commit, working tree clean')}
 case'add':{if(!A.length)return'Nothing specified, nothing added.';const fs=A.includes('.')?Object.keys(r.w):A;
  for(const f of fs){if(!has(r.w,f))return`fatal: pathspec '${f}' did not match any files`;if(hasM(r.w[f]))return`error: ${f} still contains conflict markers. Edit the file and remove <<<<<<<, =======, >>>>>>> first.`}
  fs.forEach(f=>r.st[f]=r.w[f]);return''}
 case'commit':{const i=A.findIndex(x=>x==='-m'||x==='-am');const msg=i>=0?A[i+1]:null;if(!msg)return'error: commit message required: git commit -m "message"';
  if(A.includes('-am'))for(const f in r.w)if(f in h&&r.w[f]!==h[f]&&!hasM(r.w[f]))r.st[f]=r.w[f];
  if(r.mg){const bad=r.mg.cf.filter(f=>!(f in r.st));if(bad.length)return`error: Committing is not possible because you have unmerged files: ${bad.join(', ')}\nResolve them, then git add.`}
  else if(!stat(r).staged.length)return'nothing to commit (use git add to stage files)';
  const n=Object.keys(r.st).length,id=mkc(r,msg,r.mg?[hd,r.mg.id]:hd?[hd]:[]);r.mg=null;return`[${r.h} ${id}] ${msg}\n ${n} file(s) changed`}
 case'log':{const ids=[...new Set(Object.values(r.b).filter(Boolean).flatMap(x=>[...anc(r,x)]))].sort((x,y)=>r.c[y].ts-r.c[x].ts);if(!ids.length)return'fatal: no commits yet';
  return ids.map(id=>{const l=Object.keys(r.b).filter(b=>r.b[b]===id).map(b=>(b===r.h?'HEAD -> ':'')+b);return`${id}${l.length?' ('+l.join(', ')+')':''} ${r.c[id].m}`}).join('\n')}
 case'show':{const id=rid(r,A[0]||'HEAD');if(!id)return'fatal: bad revision';const c=r.c[id];return`commit ${id}\n\n    ${c.m}\n\n`+dt(T(r,c.p[0]),c.t)}
 case'diff':{if(A.length>=2){const x=rid(r,A[0]),y=rid(r,A[1]);return x&&y?dt(T(r,x),T(r,y))||'(no differences)':'fatal: bad revision'}
  const bs={...h,...r.st},w={};for(const f in bs)if(has(r.w,f))w[f]=r.w[f];return dt(bs,w)||'(no unstaged differences)'}
 case'branch':{if(!A.length)return Object.keys(r.b).map(b=>(b===r.h?'* ':'  ')+b).join('\n');
  if(A[0]==='-d'){const n=A[1];if(!has(r.b,n))return`error: branch '${n}' not found`;if(n===r.h)return'error: cannot delete the branch you are on';delete r.b[n];return`Deleted branch ${n}`}
  const n=A[0];if(!vb(n))return'fatal: invalid branch name';if(has(r.b,n))return`fatal: a branch named '${n}' already exists`;if(!hd)return'fatal: no commits yet';r.b[n]=hd;return''}
 case'switch':case'checkout':{const mk=A.includes('-b')||A.includes('-c'),n=A.find(x=>x[0]!=='-');
  if(mk){if(!vb(n))return'fatal: invalid branch name';if(has(r.b,n))return`fatal: a branch named '${n}' already exists`;if(!hd)return'fatal: no commits yet';r.b[n]=hd;r.h=n;return`Switched to a new branch '${n}'`}
  if(!n||!has(r.b,n))return`error: pathspec '${n||''}' did not match any branch. Create it with -b.`;
  const s=stat(r);if(s.staged.length||s.mod.length||s.unm.length)return'error: Your local changes would be overwritten by checkout.\nCommit or restore them first.';
  co(r,r.b[n]);r.h=n;return`Switched to branch '${n}'`}
 case'merge':{const n=A[0],bid=n&&has(r.b,n)?r.b[n]:null;if(!bid)return`merge: ${n||''} - not something we can merge`;
  const s=stat(r);if(s.staged.length||s.mod.length||r.mg)return'error: commit or restore your changes before merging';
  if(bid===hd||anc(r,hd).has(bid))return'Already up to date.';
  if(anc(r,bid).has(hd)){co(r,bid);r.b[r.h]=bid;return`Updating ${hd}..${bid}\nFast-forward`}
  const bs=T(r,mbase(r,hd,bid)),th=T(r,bid),cf=[];
  for(const f of new Set([...Object.keys(h),...Object.keys(th)])){const o=h[f],t=th[f],b0=bs[f];if(o===t||t===b0)continue;
   if(o===b0){r.w[f]=r.st[f]=t}else{r.w[f]=cmerge(o??'',t??'',b0??'',n);cf.push(f)}}
  if(cf.length){r.mg={n,id:bid,cf};return cf.map(f=>`CONFLICT (content): Merge conflict in ${f}`).join('\n')+'\nAutomatic merge failed; fix conflicts, git add the files, then git commit.'}
  return`Merge made by the 'ort' strategy. [${mkc(r,`Merge branch '${n}'`,[hd,bid])}]`}
 case'restore':{const stg=A.includes('--staged'),f=A.find(x=>x[0]!=='-');if(!f||!has(r.w,f))return`error: pathspec '${f||''}' did not match any file`;
  if(stg){delete r.st[f];return''}if(!(f in h))return'error: file is untracked; nothing to restore';r.w[f]=f in r.st?r.st[f]:h[f];return''}
 case'revert':{const id=rid(r,A[0]);if(!id)return'fatal: bad revision. Try: git revert HEAD';const s=stat(r);if(s.staged.length||s.mod.length)return'error: your local changes would be overwritten by revert.';
  const c=r.c[id],pt=T(r,c.p[0]);let n=0;for(const f in c.t)if(c.t[f]!==pt[f]){if(h[f]!==c.t[f])return`error: could not revert ${id}: conflict in ${f}`;if(pt[f]===undefined)continue;r.w[f]=r.st[f]=pt[f];n++}
  if(!n)return'nothing to revert';return`[${r.h} ${mkc(r,`Revert "${c.m}"`,[hd])}] Revert "${c.m}"`}
 case'reset':{const id=rid(r,A.find(x=>x[0]!=='-'))||hd;if(!id)return'fatal: no commits';
  if(A.includes('--hard')){r.b[r.h]=id;co(r,id);r.mg=null;return`HEAD is now at ${id} ${r.c[id].m}\nwarning: --hard discarded uncommitted changes and moved the branch pointer. Later commits are no longer reachable.`}
  r.b[r.h]=id;r.st={};return'Unstaged changes after reset (files untouched).'}
 case'push':{if(!r.ro)return"fatal: no remote configured";if(r.h!=='main')return'error: only main is tracked in this simulation';
  if(r.rm&&!anc(r,hd).has(r.rm))return'! [rejected] main -> main (fetch first)';if(r.rm===hd)return'Everything up-to-date';r.rm=hd;
  return`To github.com/gdg-assiut/project-zero.git\n   ${hd} main -> main`+(r.pipe?'\n\n'+pipe(r).o:'')}
 case'fetch':case'pull':return r.ro?'Already up to date.':'fatal: no remote configured';
 case'remote':return r.ro?'origin\thttps://github.com/gdg-assiut/project-zero.git (fetch/push)':'(no remotes)';
 case'stash':{if(A[0]==='pop'){const v=r.sh.pop();if(!v)return'error: no stash entries found';Object.assign(r.w,v);return'Applied stash and dropped it.'}
  const s=stat(r),fs=[...s.mod,...s.staged];if(!fs.length)return'No local changes to save';const sv={};fs.forEach(f=>sv[f]=r.w[f]);r.sh.push(sv);fs.forEach(f=>{if(f in h)r.w[f]=h[f]});r.st={};return'Saved working directory state WIP on '+r.h}
 case'cherry-pick':{const id=rid(r,A[0]);if(!id)return'fatal: bad revision';const s=stat(r);if(s.staged.length||s.mod.length)return'error: commit or stash your changes first';const c=r.c[id],pt=T(r,c.p[0]),ch=[];
  for(const f in c.t)if(c.t[f]!==pt[f]){if(h[f]!==pt[f])return`CONFLICT: ${f} differs; cherry-pick aborted`;ch.push(f)}
  if(!ch.length)return'nothing to cherry-pick';ch.forEach(f=>r.w[f]=r.st[f]=c.t[f]);return`[${r.h} ${mkc(r,c.m,[hd])}] ${c.m}`}
 case'rebase':{const n=A[0];if(!n||!has(r.b,n))return'fatal: invalid upstream';const tg=r.b[n],s=stat(r);if(s.staged.length||s.mod.length||r.mg)return'error: commit or stash your changes first';
  if(anc(r,hd).has(tg))return'Current branch is up to date.';if(anc(r,tg).has(hd)){co(r,tg);r.b[r.h]=tg;return'Fast-forwarded (nothing to replay).'}
  const bs=mbase(r,hd,tg),L=[];for(let x=hd;x&&x!==bs;x=r.c[x].p[0])L.unshift(r.c[x]);let t={...T(r,tg)};const P2=[];
  for(const c of L){const pt=T(r,c.p[0]),d={};for(const f in c.t)if(c.t[f]!==pt[f]){if(t[f]!==pt[f]&&t[f]!==c.t[f])return`CONFLICT in ${f} while replaying "${c.m}". Rebase aborted (this simulation only replays non-conflicting commits; use merge to practice conflicts).`;t[f]=d[f]=c.t[f]}P2.push([c.m,d])}
  r.b[r.h]=tg;for(const[m,d]of P2){r.st=d;mkc(r,m,[cur(r)])}co(r,cur(r));return`Successfully rebased and updated refs/heads/${r.h} (${P2.length} commit(s) replayed).`}
 case'init':return'Reinitialized existing Git repository';
 case'help':case undefined:return HELP;
 default:return`git: '${c}' is not supported here. Type help.`}}
function pipe(r){const t=T(r,r.rm),y=t['ci.yml']||'',c=t['calc.js']||'';let bad=0,st=[],o=`CI run on origin/main @ ${r.rm||'—'}\n`;
 const P=[['Checkout',1,''],['Install dependencies',/npm (ci|install)\b/.test(y),"error: unknown command 'npm instal' in ci.yml"],['Lint',/npm run lint\b/.test(y),'error: lint step missing in ci.yml'],['Run tests',/return a \+ b/.test(c),'✗ add(2,3): Expected 5, Actual -1 — fix calc.js'],['Build',/npm run build\b/.test(y),"error: missing script 'biuld' — check the build command"],['Deploy',/target: production\b/.test(y),"error: invalid deploy target in ci.yml (must be production)"]];
 for(const[n,ok,e]of P){const s=bad?'skipped':ok?'passed':'failed';if(s==='failed'){bad=1;o+=`✗ ${n}\n    ${e}\n`}else o+=(s==='passed'?'✓ ':'· ')+n+(s==='skipped'?' (skipped)':'')+'\n';st.push([n,s])}
 return{o:o+(bad?'Pipeline FAILED':'✓ Pipeline PASSED — deployed to production'),ok:!bad,st}}
const hs=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return h},BEH={};
/* Real execution: user code runs ONLY inside a terminable Web Worker (no DOM, storage or network), never in the page. */
function sandbox(src,fn,cases){return new Promise(res=>{let w,done=0;const end=v=>{if(done)return;done=1;try{w.terminate()}catch(e){}res(v)};
 try{const code="self.fetch=self.XMLHttpRequest=self.WebSocket=self.importScripts=undefined;onmessage=e=>{try{const[s,f,c]=e.data;const g=new Function(s+'\\n;return '+f)();postMessage(c.every(([a,x])=>{const v=g(...a);return typeof x==='number'?Math.abs(v-x)<1e-6:v===x}))}catch(err){postMessage(false)}}";
  w=new Worker(URL.createObjectURL(new Blob([code])));w.onmessage=x=>end(x.data===true);w.onerror=()=>end(false);w.postMessage([src,fn,cases]);setTimeout(()=>end(false),1500)}catch(x){end(false)}})}
const P=(t,src)=>t[1](src)||(!!t[3]&&BEH[t[3].fn+hs(src)]===true);
async function warm(r){const m=r.m;if(!m||!m.beh||!m.file)return;for(const s of new Set([r.w[m.file],T(r,cur(r))[m.file]]))if(typeof s==='string'){const k=m.beh.fn+hs(s);if(!(k in BEH))BEH[k]=await sandbox(s,m.beh.fn,m.beh.cases)}}
function tests(r){const m=r.m;if(!m||!m.tests.length)return'No tests configured for this project.';const s=r.w[m.file]||'';let p=0,o=`Running tests for ${m.file}\n`;
 m.tests.forEach(t=>{const[n,f,h]=t;if(P(t,s)){p++;o+=`✓ ${n}\n`}else o+=`✗ ${n}\n    ${h}\n`});r.tr={t:m.tests.length,p};return o+`Tests: ${p} passed, ${m.tests.length-p} failed`+(p===m.tests.length?'\nAll green — now commit your work!':'')}
function run(r,line){const t=(line.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(x=>x.replace(/^["']|["']$/g,''));if(!t.length)return'';
 switch(t[0]){case'git':return git(r,t.slice(1));case'npm':return t[1]==='test'?tests(r):'npm: only "npm test" is simulated';
  case'pipeline':return r.pipe?pipe(r).o:'No pipeline in this project.';case'ls':return Object.keys(r.w).join('\n');
  case'cat':return t[1]&&has(r.w,t[1])?r.w[t[1]]:'cat: no such file';
  case'touch':if(!/^[\w.-]+$/.test(t[1]||''))return'touch: invalid file name';if(!has(r.w,t[1]))r.w[t[1]]='';return'';
  case'help':return HELP;default:return`${t[0]}: command not found (this is a safe simulated terminal). Type help.`}}
