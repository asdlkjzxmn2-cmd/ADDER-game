/* Single-player transport. Every accepted action is committed to IndexedDB
   before acknowledgement; transactions also serialize actions across tabs. */
globalThis.AdderLocal=(()=>{
  const KEY='current-game';
  const database=new Promise((resolve,reject)=>{
    const req=indexedDB.open('adder-local-v1',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('games');
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(new Error('브라우저 저장소를 열 수 없습니다. 일반 브라우저 모드로 열어주세요.'));
  });
  database.catch(()=>{});
  async function transact(playerId,action){
    const db=await database;
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('games','readwrite'), store=tx.objectStore('games');
      let result, failure;
      const req=store.get(KEY);
      req.onsuccess=()=>{
        try{
          let state=req.result||AdderLogic.setup([playerId]);
          const owner=state.players[0];
          if(action){
            const check=AdderLogic.validateAction(state,owner,action);
            if(!check.ok)throw new Error(check.error);
            state=AdderLogic.applyAction(state,owner,action);
          }
          result={ok:true,view:AdderLogic.viewFor(state,owner)};
          store.put(state,KEY);
        }catch(e){failure=e;tx.abort();}
      };
      tx.oncomplete=()=>resolve(result);
      tx.onabort=()=>reject(failure||new Error('자동 저장에 실패했습니다. 저장 공간과 브라우저 설정을 확인해주세요.'));
      tx.onerror=()=>{};
    });
  }
  class Connection extends EventTarget{
    readyState=0;
    queue=Promise.resolve();
    constructor(playerId){
      super();this.playerId=playerId;
      setTimeout(()=>{this.readyState=1;this.dispatchEvent(new Event('open'));},0);
    }
    emit(value){this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(value)}));}
    send(raw){
      if(raw==='__ping')return;
      this.queue=this.queue.then(async()=>{
        const m=JSON.parse(raw);
        if(m.type!=='join'&&m.type!=='action')throw Error('지원하지 않는 로컬 요청입니다.');
        const data=await transact(this.playerId,m.type==='action'?m.action:null);
        this.emit({type:'state',view:data.view});
      }).catch(e=>this.emit({type:'error',error:e.message}));
    }
    importBundle(bundle){
      const job=this.queue.then(()=>transact(this.playerId,{type:'importSaveFile',bundle}));
      this.queue=job.catch(()=>{});return job;
    }
  }
  return {Connection};
})();
