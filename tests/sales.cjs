const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
function load(file){return vm.runInNewContext(fs.readFileSync(file,'utf8').replace(/export /g,'')+'\n({setup,applyAction,validateAction,viewFor,PRODUCTS,ORIGINALS,invEnsure,productSalesFactors,productSalesProfile,ensureProductSalesProfiles,restoreSaveFileSnapshot,closeDay,dateFor})');}
const L=load(path.join(root,'source/logic.js')),clone=x=>JSON.parse(JSON.stringify(x));
const s=L.setup(['tester']),p=L.PRODUCTS[0],profile=L.productSalesProfile(s,p.id);
assert.equal(L.dateFor(s.day),'2027.01.15');
const old=clone(s);delete old.productSalesProfiles;
old.cash=987654;old.inventory[p.id]={stock:8,price:p.retail+1000,shoot:2,sold:7,colorStock:{0:8},colorSold:{0:7},avgCost:p.wholesale,saleActive:true};
const migrated=L.restoreSaveFileSnapshot(old,old.players,[],0);
for(const k of ['cash','day','inventory','history','stats'])assert.deepStrictEqual(clone(migrated[k]),old[k],k);
assert.deepStrictEqual(clone(L.productSalesProfile(migrated,p.id)),clone(profile));
L.ensureProductSalesProfiles(migrated);const once=JSON.stringify(migrated.productSalesProfiles);L.ensureProductSalesProfiles(migrated);assert.equal(JSON.stringify(migrated.productSalesProfiles),once);
const i={price:p.retail,shoot:1};
for(const product of [...L.PRODUCTS,...s.generatedProducts,...L.ORIGINALS,...s.generatedOriginals]){
 const at=price=>{const f=L.productSalesFactors(s,product,{price:product.retail*price,shoot:1},'none');return f.base*f.price};
 assert(at(.8)>=at(1)&&at(1)>=at(1.2),'price monotonic '+product.id);
}
const prices=[.8,1,1.2];const totals={weak:[],popular:[]};
for(const type of ['weak','popular'])for(const ratio of prices){let total=0;
 for(let seed=1;seed<=150;seed++){
  const t=clone(s);t.seed=seed*997;t.productSalesProfiles[p.id]={version:1,popularity:type==='popular'?85:35,demand:1,sellSpeed:1,trendAffinity:1,priceSensitivity:type==='popular'?.9:1.4};
  const inv=L.invEnsure(t,p.id);Object.assign(inv,{stock:100,colorStock:{0:100},price:Math.round(p.retail*ratio),shoot:1,saleActive:true});
  const next=L.applyAction(t,'tester',{type:'endDay'});assert.equal(next.day,2);assert(next.inventory[p.id].stock>=0);total+=next.stats.lastDaySold;
 }totals[type].push(total/150);
}
assert(totals.weak[0]>totals.weak[1]&&totals.weak[1]>totals.weak[2]);
assert(totals.popular[2]>totals.weak[2]);
const unshot=clone(s);Object.assign(L.invEnsure(unshot,p.id),{stock:5,colorStock:{0:5},shoot:0});L.closeDay(unshot);assert.equal(unshot.stats.sold,0);
const stopped=clone(s);Object.assign(L.invEnsure(stopped,p.id),{stock:5,colorStock:{0:5},shoot:3,saleActive:false});L.closeDay(stopped);assert.equal(stopped.stats.sold,0);
const priceState=clone(migrated),a={type:'setPrice',id:p.id,price:p.retail};assert(L.validateAction(priceState,'tester',a).ok);assert.equal(L.applyAction(priceState,'tester',a).inventory[p.id].price,p.retail);
const saved=L.applyAction(migrated,'tester',{type:'saveGame',name:'V17 check'});const restored=L.applyAction(saved,'tester',{type:'loadGame',saveId:saved.manualSaves[0].id});assert.deepStrictEqual(clone(restored.productSalesProfiles),clone(saved.productSalesProfiles));
// Malformed new fields repaired without changing existing gameplay fields.
migrated.productSalesProfiles[p.id].popularity=null;L.ensureProductSalesProfiles(migrated);assert.equal(migrated.productSalesProfiles[p.id].popularity,profile.popularity);

console.log('PASS',totals);
