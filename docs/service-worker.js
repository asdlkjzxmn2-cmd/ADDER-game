const BUILD="V20-a137992f2aa2f7bf";
const ASSETS=[{"path":"index.html","sha256":"e59bd36a1ef83025b5ffc045ae136fe0ececc34e44fdea3e21457779be6d96c7"},{"path":"manifest.webmanifest","sha256":"3f01c3c7e63283bbb8a1c9b9d4f232df6af427f63dabdae71a0e5b12904041e3"},{"path":"icons/icon-192.png","sha256":"54986ccd0fc04e3143f8c2295c20c3f43d204cef54197a8119327892672db85f"},{"path":"icons/icon-512.png","sha256":"f4587a6a8aa4eef88b78dab9ba74baa4213203723240996ee1e5a7c544ba8148"},{"path":"icons/apple-touch-icon.png","sha256":"b9fb6498bcefda55f0523e5e5440b3dfc6fd3911bcfbccbce5eb8b9e6da92b7f"}];
const BASE=new URL('./',self.location.href);
const PREFIX='adder-pwa:'+BASE.pathname+':';
const CACHE=PREFIX+BUILD;
const url=relative=>new URL(relative,BASE).href;
// Stage and verify the complete release before accepting the installation.
// Failed staging never touches the active release or IndexedDB.
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  for(const asset of ASSETS){
   const response=await fetch(new Request(url(asset.path),{cache:'no-store'}));
   if(!response.ok)throw Error('Incomplete release: '+asset.path);
   const bytes=await response.clone().arrayBuffer();
   const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
   if(digest!==asset.sha256)throw Error('Release mismatch: '+asset.path);
   await cache.put(url(asset.path),response);
  }
 }catch(error){await caches.delete(CACHE);throw error;}
})()));
// Default lifecycle waits until no old controlled clients remain.
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 for(const asset of ASSETS)if(!await cache.match(url(asset.path)))throw Error('Missing staged asset');
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,u=new URL(request.url);
 if(request.method!=='GET'||u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 const relative=u.pathname.slice(BASE.pathname.length);
 const asset=request.mode==='navigate'&&(relative===''||relative==='index.html')?'index.html':ASSETS.some(a=>a.path===relative)?relative:null;
 if(!asset)return;
 event.respondWith((async()=>{
  const cached=await(await caches.open(CACHE)).match(url(asset));
  // Never mix unverified network files with this running release.
  return cached||new Response('Offline release missing. Please reconnect and reopen ADDER.',{status:503});
 })());
});
