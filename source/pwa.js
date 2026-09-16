// No reload, skipWaiting or claim. Existing clients keep their current release.
(()=>{
 const state=globalThis.AdderPWA={status:'오프라인 실행 준비 중…',registration:null};
 function show(){document.querySelectorAll('.pwa-status').forEach(el=>{if(el.textContent!==state.status)el.textContent=state.status})}
 new MutationObserver(show).observe(document.getElementById('saveLayer'),{childList:true,subtree:true});
 if(!('serviceWorker' in navigator)||!isSecureContext){state.status='PWA 오프라인 기능은 GitHub Pages의 HTTPS 주소에서 사용할 수 있습니다.';show();return;}
 function updateStatus(reg){state.status=reg.waiting?'새 버전 준비 완료 · ADDER 창을 모두 종료하면 다음 실행에 적용됩니다.':reg.active?'오프라인 실행 준비 완료 · 진행은 이 기기에 자동 저장됩니다.':'오프라인 실행 준비 중…';show();}
 navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  state.registration=reg;updateStatus(reg);
  const watch=()=>{const worker=reg.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='redundant'){state.status='업데이트 준비 실패 · 현재 버전은 계속 사용할 수 있습니다.';show()}else updateStatus(reg)})};
  reg.addEventListener('updatefound',watch);watch();
  navigator.serviceWorker.ready.then(()=>updateStatus(reg));
  const check=()=>{if(navigator.onLine)reg.update().catch(()=>{})};
  window.addEventListener('online',check);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});setInterval(check,600000);
 }).catch(()=>{state.status='오프라인 준비에 실패했습니다. 인터넷 연결 후 다시 실행해주세요.';show()});
})();
