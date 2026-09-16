const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const L=vm.runInNewContext(fs.readFileSync(root+'/source/logic.js','utf8').replace(/export /g,'')+';({setup,applyAction,viewFor,restoreSaveFileSnapshot,weeklyTrendState,productSalesFactors,productStyleTags,PRODUCTS,invEnsure,dateFor})');
const clone=x=>JSON.parse(JSON.stringify(x));
const s=L.setup(['tester']);assert.equal(L.dateFor(s.day),'2027.01.15');
for(let day=1;day<=365;day++){
 const a=L.weeklyTrendState(s,day);assert.equal(new Set([...a.rising,a.declining]).size,3);
 if(day%7!==0)assert.deepStrictEqual(clone(a),clone(L.weeklyTrendState(s,day+1)));
 else assert.notEqual(a.rising[0],L.weeklyTrendState(s,day+1).rising[0]);
}
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'v17-save-fixture.json'),'utf8')).snapshot;
const migrated=L.restoreSaveFileSnapshot(old,old.players,[],0);
for(const key of ['day','cash','inventory','history','stats','productSalesProfiles'])assert.deepStrictEqual(clone(migrated[key]),old[key],key);
assert(Object.keys(migrated.productStyleTags).length>0);assert(!('week' in migrated));
assert.deepStrictEqual(clone(L.restoreSaveFileSnapshot(migrated,migrated.players,[],0).productStyleTags),clone(migrated.productStyleTags));
const p=L.PRODUCTS[0],w=L.weeklyTrendState(s),i={price:p.retail,shoot:1};
const factor=tags=>{s.productStyleTags[p.id]=tags;return L.productSalesFactors(s,p,i,w.rising[0]).trend};
assert(factor([w.rising[0]])>1);assert(factor([w.declining])<1);assert(factor([w.rising[0],w.rising[1]])===factor([w.rising[0]]));assert(factor([w.rising[0],w.declining])>1);
s.productStyleTags[p.id]=['invalid'];assert(L.productStyleTags(s,p).length>0);
const at7=clone(s);at7.day=7;const next=L.applyAction(at7,'tester',{type:'endDay'});assert.equal(next.day,8);assert.notEqual(L.viewFor(at7,'tester').weeklyTrends.rising[0],L.viewFor(next,'tester').weeklyTrends.rising[0]);
const totals={up:0,down:0};for(const key of ['up','down'])for(let seed=1;seed<=100;seed++){
 const t=clone(s);t.seed=seed*997;t.productStyleTags[p.id]=[key==='up'?w.rising[0]:w.declining];Object.assign(L.invEnsure(t,p.id),{stock:20,colorStock:{0:20},price:p.retail,shoot:1,saleActive:true});const n=L.applyAction(t,'tester',{type:'endDay'});totals[key]+=n.stats.lastDaySold;
}assert(totals.up>totals.down);
const saved=L.applyAction(migrated,migrated.players[0],{type:'saveGame',name:'V18 test'});const restored=L.applyAction(saved,saved.players[0],{type:'loadGame',saveId:saved.manualSaves.at(-1).id});assert.deepStrictEqual(clone(restored.productStyleTags),clone(saved.productStyleTags));
console.log('PASS 365 date boundaries, V17 save preservation, idempotent tags, no duplicate clock, directional and capped factors, day close refresh, 200 actual sales cases, slot save/load',totals);
fs.writeFileSync(path.join(__dirname,'trend-results.json'),JSON.stringify({passed:true,days:365,salesCases:200,totals},null,2));
