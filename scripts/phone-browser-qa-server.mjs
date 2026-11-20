#!/usr/bin/env node
// Developer-only. Read-only, loopback-only static UI test lab served to a
// directly connected phone through an explicit temporary ADB reverse tunnel.
// No authentication, private data, network proxy or dynamic request execution.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml',
  '.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try {
    if(req.method!=='GET'){res.writeHead(405);res.end();return;}
    const raw=new URL(req.url,'http://localhost').pathname;
    const name=raw==='/lab/'?'lab/index.html':decodeURIComponent(raw.slice(1));
    if(!/^(src|lab|assets|tests)\//.test(name)){res.writeHead(404);res.end();return;}
    const path=resolve(root,name);
    if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(path);
    res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream',
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(data);
  }catch {res.writeHead(404);res.end('Not found');}
});
server.listen(18745,'127.0.0.1',()=>console.log('QA_SERVER_READY:127.0.0.1:18745'));
