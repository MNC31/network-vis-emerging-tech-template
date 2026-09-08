import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.csv':'text/csv','.ipynb':'application/x-ipynb+json'};
const port=Number(process.env.PORT||8080);
createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}if((await stat(file)).isDirectory())file=path.join(file,'index.html');const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,()=>console.log(`Open http://localhost:${port}`));
