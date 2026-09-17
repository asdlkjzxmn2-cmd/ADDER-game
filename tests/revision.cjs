const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'..'),clone=x=>JSON.parse(JSON.stringify(x));
const L=vm.runInNewContext(fs.readFileSync(root+'/source/logic.js','utf8').replace(/export /g,'')+';({setup,applyAction,validateAction,viewFor,invEnsure,PRODUCTS,managementStats,recentCompletedBusinessDays,restoreSaveFileSnapshot})');
let s=L.setup(['revision']);const ids=L.PRODUCTS.slice(0,5).map(p=>p.id);s.day=10;
s.management.days=Object.fromEntries(Array.from({length:9},(_,n)=>[n+1,{closed:true}]));
assert.deepStrictEqual(clone(L.recentCompletedBusinessDays(s)),[9,8,7,6,5,4,3]);
s.history.sales=[{id:ids[0],day:10,qty:100,revenue:100},{id:ids[1],day:2,qty:100,revenue:100},{id:ids[2],day:3,qty:3,revenue:3},{id:ids[3],day:9,qty:4,revenue:4},{id:ids[4],day:8,qty:2,revenue:2}];
assert.deepStrictEqual(clone(L.managementStats(s).bestSellerIds),[ids[3],ids[2]]);
// No-sales completed days must consume window positions. Current-day closed flags cannot leak in.
s.management.days[10]={closed:true};assert.equal(L.managementStats(s).bestSellerIds.length,2);
s.management.days[8]={closed:false};assert.deepStrictEqual(clone(L.recentCompletedBusinessDays(s)),[9,7,6,5,4,3,2]);
s.day=3;s.management.days={1:{closed:true},2:{closed:true}};assert.deepStrictEqual(clone(L.recentCompletedBusinessDays(s)),[2,1]);
s.day=1;assert.equal(L.recentCompletedBusinessDays(s).length,0);
s.day=10;s.management.days={};assert.deepStrictEqual(clone(L.recentCompletedBusinessDays(s)),[9,8,7,6,5,4,3]);
s.history.sales=ids.map((id,n)=>({id,day:9,qty:7-n,revenue:7-n}));assert.deepStrictEqual(clone(L.managementStats(s).bestSellerIds),clone(ids.slice(0,3)));
// Actual actions: precise gender/method totals, validation and persistence.
s=L.setup(['revision']);s.cash=10000000;const id=ids[0],i=L.invEnsure(s,id);Object.assign(i,{stock:20,colorStock:{0:20},avgCost:20000});L.invEnsure(s,ids[1]);
for(const [model,counts] of [['female',[2,1,3]],['male',[4,2,1]]])for(const [n,method] of ['quick','horizon','editorial'].entries())for(let k=0;k<counts[n];k++){
 s.ap=5;const a={type:'shoot',id,model,method,color:0};assert(L.validateAction(s,'revision',a).ok);s=L.applyAction(s,'revision',a);
}
const expected={female:{quick:2,horizon:1,editorial:3},male:{quick:4,horizon:2,editorial:1}};
assert.deepStrictEqual(clone(s.inventory[id].shootCounts),expected);assert.equal(s.inventory[ids[1]].shootCounts.male.quick,0);
s=L.applyAction(s,'revision',{type:'saveGame',name:'counts'});s=L.applyAction(s,'revision',{type:'loadGame',saveId:s.manualSaves[0].id});assert.deepStrictEqual(clone(s.inventory[id].shootCounts),expected);
const restored=L.restoreSaveFileSnapshot(clone(s),s.players,[],0);assert.deepStrictEqual(clone(restored.inventory[id].shootCounts),expected);
const legacy=clone(s);delete legacy.inventory[id].shootCounts;delete legacy.inventory[id].shootCountsLegacyUnknown;
const migrated=L.restoreSaveFileSnapshot(legacy,s.players,[],0);assert(migrated.inventory[id].shootCountsLegacyUnknown);assert.equal(migrated.inventory[id].shootCounts.female.quick,0);
for(const key of Object.keys(legacy.inventory[id]))assert.deepStrictEqual(clone(migrated.inventory[id][key]),legacy.inventory[id][key],key);
assert.deepStrictEqual(clone(L.restoreSaveFileSnapshot(migrated,s.players,[],0).inventory),clone(migrated.inventory));
s.day=10;s.ap=5;s.history.sales=[{id,day:9,qty:4,revenue:200000,cogs:80000}];s.sampled[id]=true;
fs.writeFileSync(root+'/tests/revision-fixture.json',JSON.stringify({format:'ADDER_BOUTIQUE_SAVE',schema:1,snapshot:s}));
console.log('PASS completed-day boundaries / initial / legacy / no-sales / >=3 top3; 13 actual shoots; 6+7 totals; product isolation; manual SAVE/load, JSON restore, legacy unknown zero and idempotence');

