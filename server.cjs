// Serves only docs/; /adder-game/ emulates a GitHub Pages project path.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.join(__dirname,'docs'),port=Number(process.env.PORT||8133);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return;}
 if(pathname==='/'){res.writeHead(302,{Location:'/adder-game/'});res.end();return;}
 if(!pathname.startsWith('/adder-game/')){res.writeHead(404);res.end('Not found');return;}
 const relative=pathname.slice('/adder-game/'.length)||'index.html',file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
 });
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port '+port+' is already in use. Close the previous START_IPAD window and retry.':e.message);process.exitCode=1});
server.listen(port,'0.0.0.0',()=>{
 console.log('ADDER - Keep this window open. Ctrl+C to stop.');
 console.log('PC test (PWA supported): http://localhost:'+port+'/adder-game/');
 for(const list of Object.values(os.networkInterfaces()))for(const n of list||[])if(n.family==='IPv4'&&!n.internal)console.log('iPad same LAN (online preview only): http://'+n.address+':'+port+'/adder-game/');
 console.log('For iPad offline PWA, use your HTTPS GitHub Pages address.');
 console.log('If iPad times out: check same LAN, private-network firewall permission, guest Wi-Fi isolation and VPN.');
});
