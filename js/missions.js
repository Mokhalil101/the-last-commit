"use strict";
/* ===== missions ===== */
const W=(r,f,m)=>{Object.assign(r.w,f);run(r,'git add .');run(r,`git commit -m "${m}"`)};
const MS=[
{id:'m1',w:'World 01 · The Broken Workspace',t:'The Missing Commit',par:6,ach:'Clean Repository',tests:[],
 story:'A developer edited two files but never committed them. A secrets file is also lying around the workspace.',
 goals:['Inspect the repository status','Stage only the files that belong in the commit','Commit with a meaningful message','Keep secrets.env out of history'],
 hints:['Run git status to see modified and untracked files.','secrets.env must never be committed. Avoid git add . and stage each file by name.','git add app.js README.md, then git commit -m "Add discount support"'],
 setup(r){W(r,{'app.js':'function total(a,b){ return a + b }','README.md':'# Shop'},'Initial commit');r.w['app.js']+='\nfunction discount(p){ return p*0.9 }';r.w['README.md']='# Shop\nNow with discounts';r.w['secrets.env']='API_KEY=12345'},
 check:r=>{const h=T(r,cur(r));return r.n>1&&/discount/.test(h['app.js']||'')&&/discounts/.test(h['README.md']||'')&&!has(h,'secrets.env')&&clean(r)&&r.c[cur(r)].m.length>7}},
{id:'m2',w:'World 03 · Branching Dimension',t:'The Feature Branch',par:7,ach:'Branch Master',tests:[],
 story:'Login must be built without touching main. Create an isolated branch and do the work there.',
 goals:['Create branch feature/login','Implement function login() in login.js on that branch and commit it','Return to main, leaving main untouched'],
 hints:['git switch -c feature/login creates and enters the branch.','Edit login.js in the editor, e.g. replace the TODO with function login(){ return true }.','git add login.js, git commit -m "Add login", then git switch main.'],
 setup(r){W(r,{'login.js':'// TODO: implement login'},'Initial commit')},
 check:r=>has(r.b,'feature/login')&&/function login/.test(T(r,r.b['feature/login'])['login.js']||'')&&!/function login/.test(T(r,r.b.main)['login.js']||'')&&r.h==='main'&&clean(r)},
{id:'m3',w:'World 04 · Merge Conflict Zone',t:'Two Developers, One File',par:9,ach:'Conflict Resolver',file:'price.js',
 story:'One developer added a 10% discount, another added a flat shipping fee. Both edited the same line. The final price needs both.',
 goals:['Merge feature/discount into main','Resolve the conflict so BOTH changes survive','Stage the file and complete the merge commit'],
 hints:['git merge feature/discount will stop with a conflict.','Open price.js. Remove the markers and write one total() that applies *0.9 and +5.','git add price.js then git commit -m "Merge discount and shipping".'],
 tests:[['discount applied',s=>/\*\s*0\.9/.test(s),'Expected 104 for p=100, Actual 115: the discount is missing'],['shipping fee kept',s=>/\+\s*5/.test(s),'Expected 104, Actual 99: the shipping fee is missing'],['no conflict markers',s=>!hasM(s)&&!/^>{7}/m.test(s)&&!/^={7}$/m.test(s),'Conflict markers still in file'],['one total() only',s=>(s.match(/function total/g)||[]).length===1,'Duplicate total() definitions']],
 setup(r){W(r,{'price.js':'const tax = 0.1;\nfunction total(p){ return p*(1+tax) }'},'Initial pricing');run(r,'git switch -c feature/discount');W(r,{'price.js':'const tax = 0.1;\nfunction total(p){ return p*(1+tax)*0.9 }'},'Apply 10% discount');run(r,'git switch main');W(r,{'price.js':'const tax = 0.1;\nfunction total(p){ return p*(1+tax)+5 }'},'Add flat shipping fee')},
 check(r){const h=T(r,cur(r));return this.tests.every(t=>P(t,h['price.js']||''))&&clean(r)&&r.c[cur(r)].p.length===2}},
{id:'m4',w:'World 02 · The Commit Vault',t:'The Bug in Production',par:8,ach:'Bug Hunter',file:'calc.js',
 story:'Customers see a total of 8 instead of 10. A recent commit broke production.',
 goals:['Inspect the history and find the guilty commit','Compare versions with git diff or git show','Fix it with a new commit (revert or edit), keeping tax.js','Run npm test'],
 hints:['git log shows the history; git show <id> shows what each commit changed.','"Optimize totals" changed return 10 into return 8.','git revert HEAD undoes it safely without rewriting history.'],
 tests:[['total() returns 10 for the sample cart',s=>/return 10\b/.test(s),'Expected: 10  Actual: 8. Inspect the latest change to calc.js']],
 setup(r){W(r,{'calc.js':'function total(){ return 10 }'},'Initial calculator');W(r,{'tax.js':'const tax = 0.1'},'Add tax constant');W(r,{'calc.js':'function total(){ return 8 }'},'Optimize totals');r.s=cur(r)},
 check(r){const h=T(r,cur(r));return this.tests.every(t=>P(t,h['calc.js']||''))&&has(h,'tax.js')&&clean(r)&&cur(r)!==r.s}},
{id:'m5',w:'World 05 · The Debugging Maze',t:'The Silent Sum',par:6,ach:'Debugging Detective',file:'sum.js',
 story:'sum([1,2,3]) should return 6. It returns garbage. There are two bugs.',
 goals:['Read the failing test output','Fix both bugs in the editor','Commit the fix'],
 hints:['Run npm test: each failure shows expected vs actual.','Loop bound: i <= arr.length reads one element too far.','The accumulator subtracts. Use total += arr[i].'],
 tests:[['loop stops at the last element',s=>/i\s*<\s*arr\.length/.test(s),'Expected 3 iterations, Actual 4: i <= arr.length reads arr[3] (undefined)'],['adds each element',s=>/total\s*\+=\s*arr\[i\]|total\s*=\s*total\s*\+\s*arr\[i\]/.test(s),'Expected: 6  Actual: -6. Check the operator']],
 setup(r){W(r,{'sum.js':'function sum(arr){\n  let total = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    total = total - arr[i];\n  }\n  return total;\n}'},'Add sum()');r.s=cur(r)},
 check(r){const h=T(r,cur(r));return this.tests.every(t=>P(t,h['sum.js']||''))&&clean(r)&&cur(r)!==r.s}},
{id:'m6',w:'World 07 · The Pull Request Arena',t:'The Broken Pull Request',par:3,ach:'Code Review Expert',tests:[],
 story:'Nour opened a pull request for a discount code. Review it carefully before anything reaches main.',
 goals:['Read the diff in the Pull Request panel','Spot the bug','Request changes with a clear comment (never approve a bug)'],
 hints:['Read every added line, not just the title.','Look at the if condition. What does a single = do?','Write a comment such as "Use == / === to compare; = assigns".'],
 pr:{t:'Add GDG discount code',a:'Nour (Backend)',d:[' function price(p, code) {','-  return p','+  if (code = \'GDG\') p = p * 0.5','+  return p',' }','+// (no tests added)'],msg:'',done:0,why:"code = 'GDG' assigns instead of comparing, so every cart gets 50% off."},
 setup(r){W(r,{'cart.js':'function price(p, code){ return p }'},'Initial cart');r.pr=JSON.parse(JSON.stringify(this.pr))},
 check:r=>!!r.pr&&r.pr.done===1},
{id:'m7',w:'World 10 · Project Zero',t:'The Last Commit',par:12,ach:'Last Commit Hero',file:'calc.js',
 story:'PROJECT ZERO will not deploy. The pipeline runs on what is PUSHED, so fix every failing stage, commit, and push to origin/main.',
 goals:['Run pipeline and read the failing stage','Fix calc.js and ci.yml','Commit your fixes','Push until every stage passes and production deploys'],
 hints:['npm test and pipeline show what fails. Fix one stage at a time.','Typos in ci.yml: "npm instal", "biuld", "stagging". add() should return a + b.','git add ., git commit -m "Fix pipeline", git push origin main'],
 tests:[['add(2,3) returns 5',s=>/return a \+ b/.test(s),'Expected: 5  Actual: -1']],
 setup(r){W(r,{'calc.js':'function add(a,b){ return a - b }','ci.yml':'steps:\n  - run: npm instal\n  - run: npm run lint\n  - run: npm test\n  - run: npm run biuld\ndeploy:\n  target: stagging'},'Initial commit');r.ro='origin';r.rm=cur(r);r.pipe=1},
 check:r=>pipe(r).ok&&clean(r)}];
const FREE={id:'free',t:'Free Developer Mode',w:'Sandbox',par:99,free:1,tests:[],story:'Experiment freely. Nothing here is real and nothing is scored.',goals:['Try branches, merges, reverts and conflicts','Use help to see commands'],hints:['git switch -c experiment','Edit a file on two branches, then merge to create your own conflict.'],
 setup(r){W(r,{'index.html':'<h1>Hello</h1>','app.js':'console.log("hi")'},'Initial commit');r.w['notes.txt']='scratch';r.ro='origin';r.rm=cur(r)},check:()=>false};
MS.push(
{id:'w6',w:'World 06 · Remote Connection',t:'Push the Feature',par:5,ach:'Remote Operator',tests:[],story:'Your teammate finished a feature locally, but origin/main is behind. Synchronize the remote.',goals:['Inspect the remote with git remote -v','Read git status: you are ahead of origin/main','Push main to origin'],hints:['git remote -v shows where origin points.','git status reports "ahead of origin/main".','git push origin main'],
 setup(r){W(r,{'app.js':'// v1'},'Initial commit');r.ro='origin';r.rm=cur(r);W(r,{'app.js':'// v2 with search'},'Add search feature')},
 check:r=>r.rm===cur(r)&&clean(r)&&r.n>1},
{id:'w9',w:'World 09 · CI/CD Control Room',t:'Green Pipeline',par:8,ach:'Pipeline Engineer',tests:[],story:'The pipeline is red. Read the failing stage, fix the workflow file, commit, and push so CI can deploy.',goals:['Run pipeline and find the failing stage','Fix ci.yml (lint step and deploy target)','Commit and push to origin/main'],hints:['pipeline shows each stage and the first failure.','Add "  - run: npm run lint" and set target: production.','git add ., git commit -m "Fix CI", git push origin main'],
 setup(r){W(r,{'calc.js':'function add(a,b){ return a + b }','ci.yml':'steps:\n  - run: npm ci\n  - run: npm test\n  - run: npm run build\ndeploy:\n  target: productoin'},'Initial commit');r.ro='origin';r.rm=cur(r);r.pipe=1},
 check:r=>pipe(r).ok&&clean(r)&&Object.keys(r.c).length>1});
const dbg=(id,t,file,src,tests,hints)=>({id,t,w:'Debugging Challenge',par:6,ach:'Bug Squasher',tests,file,hints,story:'Find the bug with npm test, fix it in the editor, then commit.',goals:['Run npm test','Fix the code','Commit the fix'],
 setup(r){W(r,{[file]:src},'Add '+file);r.s=cur(r)},check(r){const h=T(r,cur(r));return this.tests.every(x=>P(x,h[file]||''))&&clean(r)&&cur(r)!==r.s}});
const CH=[
{id:'g1',t:'Stash and Hotfix',w:'Git Challenge',par:9,ach:'Stash Master',tests:[],story:'You are mid-feature on main when an urgent hotfix arrives. Do not lose your work.',goals:['Stash your uncommitted work','Switch to hotfix and commit a fix to fix.js (write "fixed" in it)','Return to main and git stash pop'],hints:['git stash saves changes and cleans the tree.','git switch hotfix, edit fix.js, git add, git commit.','git switch main, then git stash pop.'],
 setup(r){W(r,{'a.js':'// stable','fix.js':'// broken'},'Initial commit');run(r,'git branch hotfix');r.w['a.js']='// WIP feature'},
 check:r=>r.h==='main'&&r.sh.length===0&&/WIP/.test(r.w['a.js']||'')&&/fixed/i.test(T(r,r.b.hotfix)['fix.js']||'')},
{id:'g2',t:'Cherry-Pick the Typo Fix',w:'Git Challenge',par:6,ach:'Cherry Picker',tests:[],story:'The feature branch holds an experimental commit and a typo fix. Only the typo fix may reach main.',goals:['Find the typo-fix commit with git log','Cherry-pick only that commit onto main'],hints:['git log lists every commit with its id.','git cherry-pick <id of "Fix typo">'],
 setup(r){W(r,{'doc.txt':'Helo world','x.js':'// base'},'Initial commit');run(r,'git switch -c feature');W(r,{'x.js':'// experimental'},'Experimental rewrite');W(r,{'doc.txt':'Hello world'},'Fix typo');run(r,'git switch main')},
 check:r=>r.h==='main'&&/Hello/.test(T(r,cur(r))['doc.txt']||'')&&!/experimental/.test(T(r,cur(r))['x.js']||'')&&clean(r)},
dbg('d1','The Undefined Variable','greet.js','function greet(name){ return "Hello " + nam }',[['uses the parameter name',s=>/\+\s*name\b/.test(s),'ReferenceError: nam is not defined']],['The parameter is called name.']),
dbg('d2','The Wrong Operator','adult.js','function isAdult(age){ return age > 18 }',[['18-year-olds are adults',s=>/>=\s*18/.test(s),'Expected: true for 18  Actual: false']],['Use >= so that 18 is included.']),
dbg('d3','Assignment vs Comparison','check.js','function isFive(x){ if (x = 5) { return true } return false }',[['compares with ===',s=>/x\s*===?\s*5/.test(s),'Expected: false for 3  Actual: true (= assigns)']],['A single = assigns a value instead of comparing.'])];
MS.push({...dbg('w8','The Failing Tests','cart.js','function total(items){ return items.reduce((a,i)=>a + i.cost) }',[['sums item prices',s=>/a\s*\+\s*i\.price/.test(s),'Expected: 30  Actual: NaN. Items have price, not cost'],['empty cart returns 0',s=>/,\s*0\s*\)/.test(s),'Expected: 0  Actual: TypeError. reduce needs an initial value (0)']],['Fix both failing tests, then commit.']),w:'World 08 · Testing Lab',ach:'Test Pilot',par:6,story:'Two unit tests fail. Read Expected vs Actual and repair the implementation without breaking anything else.'});
const wd=(w,...a)=>({...dbg(...a),w});
const prm=(id,t,pr,hints)=>({id,t,w:'World 07 · The Pull Request Arena',par:3,ach:'Code Review Expert',tests:[],story:'A teammate opened a pull request. Approve good work. Request changes, with a comment, on bad work.',goals:['Read the diff carefully','Decide whether it is safe and tested','Act on your decision'],hints,pr,setup(r){W(r,{'app.js':'// app'},'Initial commit');r.pr=JSON.parse(JSON.stringify(pr))},check:r=>!!r.pr&&r.pr.done===1});
MS.push(
{id:'h2',w:'World 02 · The Commit Vault',t:'Who Broke It?',par:8,ach:'Bug Hunter',file:'calc.js',tests:[['total() returns 10',s=>/return 10\b/.test(s),'Expected: 10  Actual: 8. An OLD commit broke calc.js']],story:'Two commits landed after the bad one. Find the culprit with git log and git show, then revert exactly that commit.',goals:['Find the commit that changed the total to 8','Revert that commit by id (not HEAD)','Keep the later commits'],hints:['git show <id> displays what each commit changed.','git revert <id of "Tweak totals">'],
 setup(r){W(r,{'calc.js':'function total(){ return 10 }'},'Initial calculator');W(r,{'calc.js':'function total(){ return 8 }'},'Tweak totals');W(r,{'ui.js':'// ui'},'Add UI');W(r,{'docs.md':'# Docs'},'Write docs');r.s=cur(r)},
 check(r){const h=T(r,cur(r));return P(this.tests[0],h['calc.js']||'')&&has(h,'ui.js')&&has(h,'docs.md')&&clean(r)&&cur(r)!==r.s}},
{id:'ff',w:'World 03 · Branching Dimension',t:'The Fast-Forward',par:4,ach:'Branch Master',tests:[],story:'feature/search is ahead of main, and main has no new commits. Bring main up to date.',goals:['Make sure you are on main','Merge feature/search','Notice: no merge commit is needed (fast-forward)'],hints:['git branch shows the active branch.','git merge feature/search'],
 setup(r){W(r,{'s.js':'// base'},'Initial commit');run(r,'git switch -c feature/search');W(r,{'s.js':'// search v1'},'Add search');W(r,{'s.js':'// search v2'},'Improve search');run(r,'git switch main')},
 check:r=>r.h==='main'&&cur(r)===r.b['feature/search']&&r.c[cur(r)].p.length===1},
{id:'c2',w:'World 04 · Merge Conflict Zone',t:'Imports Collide',par:9,ach:'Conflict Resolver',file:'app.js',tests:[['keeps router import',s=>/router/.test(s),'The router import is missing'],['keeps logger import',s=>/logger/.test(s),'The logger import is missing'],['no conflict markers',s=>!/^(<{7}|={7}$|>{7})/m.test(s),'Conflict markers are still in the file']],story:'Two developers added different imports on the same line.',goals:['Merge feature/logger into main','Keep BOTH imports','Finish the merge'],hints:['git merge feature/logger','Keep one import line for router and one for logger.','git add app.js, then git commit'],
 setup(r){W(r,{'app.js':'import base from "./base";\nbase()'},'Initial commit');run(r,'git switch -c feature/logger');W(r,{'app.js':'import logger from "./logger";\nbase()'},'Add logger');run(r,'git switch main');W(r,{'app.js':'import router from "./router";\nbase()'},'Add router')},
 check(r){const h=T(r,cur(r));return this.tests.every(t=>P(t,h['app.js']||''))&&clean(r)&&r.c[cur(r)].p.length===2}},
wd('World 05 · The Debugging Maze','d5','Wrong Return','total.js','function total(a,b){\n  const sum = a + b;\n  return a;\n}',[['returns the sum',s=>/return\s+sum\b/.test(s),'Expected: 5  Actual: 2. Return the computed value']],['Which variable holds the result?']),
wd('World 08 · Testing Lab','w8b','Catch the Regression','price.js','function price(p,d){ return p - d }  // discount: used to be percent',[['applies percent discount',s=>/p\s*\*\s*\(\s*1\s*-\s*d\s*\)/.test(s),'Expected: 90 for p=100, d=0.1  Actual: 99.9 (regression)'],['keeps the comment',s=>/discount/.test(s),'Do not delete the comment']],['A refactor turned a percent discount into a subtraction.']),
prm('w7b','Clean Frontend PR',{t:'Add dark-mode toggle',a:'Salma (Frontend)',d:[' const root = document.body;','+function toggleTheme(){','+  root.classList.toggle("dark");','+}','+// tests: toggleTheme.test.js added'],good:1,msg:'',done:0,why:''},['Look for anything unsafe or untested.','This one is clean and tested: approve it.']),
prm('w7c','The Unsafe Change',{t:'Run user formulas',a:'Omar (Backend)',d:['+function calc(input){','+  return eval(input)','+}'],good:0,msg:'',done:0,why:'eval(input) runs arbitrary user code, a serious security hole.'},['Search the diff for dangerous calls.','Evaluating user input is never safe.']),
prm('w7d','Missing Test',{t:'Fix rounding bug',a:'Dina (QA Engineer)',d:['-  return Math.round(x)','+  return Math.floor(x)','+// no test added'],good:0,msg:'',done:0,why:'there is no test covering the new rounding behavior.'},['What proves this change works?','Ask for a test.']));
MS.push({id:'rb',w:'World 03 · Branching Dimension',t:'Keep History Linear',par:6,ach:'Branch Master',tests:[],story:'main moved on while you worked on feature. The team wants a straight history with no merge commit.',goals:['Switch to feature','Rebase feature onto main','Fast-forward main to feature (no merge commit)'],hints:['git switch feature, then git rebase main replays your commits on top of main.','Now git switch main.','git merge feature fast-forwards.'],
 setup(r){W(r,{'base.js':'// base'},'Initial commit');run(r,'git switch -c feature');W(r,{'f.js':'// part 1'},'Add feature part 1');W(r,{'f.js':'// part 2'},'Add feature part 2');run(r,'git switch main');W(r,{'m.js':'// hotfix'},'Hotfix on main')},
 check:r=>{const h=T(r,cur(r));return r.h==='main'&&cur(r)===r.b.feature&&has(h,'f.js')&&has(h,'m.js')&&Object.values(r.c).every(c=>c.p.length<2)&&clean(r)}});
CH.push(dbg('d6','Python: The Missing Colon','check.py','def is_adult(age):\n    if age >= 18\n        return True\n    return False',[['if line ends with a colon',s=>/age\s*>=\s*18\s*:/.test(s),"SyntaxError: expected ':' after the if condition"]],['Python blocks start with a colon.']),
 dbg('d7','Python: Off by One','loop.py','def total(items):\n    s = 0\n    for i in range(1, len(items)):\n        s += items[i]\n    return s',[['loop starts at the first item',s=>/range\(\s*(0\s*,\s*)?len\(items\)\s*\)/.test(s),'Expected: 6 for [1,2,3]  Actual: 5. range(1, ...) skips index 0']],['Python lists start at index 0.']));
const CAMP=['m1','m4','h2','m2','ff','rb','m3','c2','m5','d5','w6','m6','w7b','w7c','w7d','w8','w8b','w9','m7'].map(id=>MS.find(m=>m.id===id));
const ALL=[...MS,...CH],ACH=['First Commit','Test Guardian',...new Set(MS.map(m=>m.ach)),'Stash Master','Cherry Picker','Bug Squasher'];
let SND=1;function beep(f,d=.12){if(!SND)return;try{const c=beep.c||(beep.c=new AudioContext()),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch(e){}}

/* Behavior specs: when regex tests fail, any valid fix is still accepted if it runs correctly in the Worker sandbox. */
const BEHS={m3:{fn:'total',cases:[[[100],104]]},m4:{fn:'total',cases:[[[],10]]},h2:{fn:'total',cases:[[[],10]]},m5:{fn:'sum',cases:[[[[1,2,3]],6],[[[]],0],[[[5]],5]]},
 w8:{fn:'total',cases:[[[[{price:10},{price:20}]],30],[[[]],0]]},w8b:{fn:'price',cases:[[[100,0.1],90],[[50,0.5],25]]},d1:{fn:'greet',cases:[[['Ann'],'Hello Ann'],[['Bo'],'Hello Bo']]},
 d2:{fn:'isAdult',cases:[[[18],true],[[17],false],[[30],true]]},d3:{fn:'isFive',cases:[[[3],false],[[5],true]]},d5:{fn:'total',cases:[[[2,3],5],[[10,1],11]]}};
[...MS,...CH].forEach(x=>{const b=BEHS[x.id];if(b){x.beh=b;x.tests.forEach(t=>t[3]=b)}});
