import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const graph=read('dist/data/network.json'),scene=read('dist/data/scene.json');
const ids=new Set(graph.nodes.map(n=>n.id));assert.equal(ids.size,8);assert.equal(graph.edges.length,11);
const keys=new Set(),degrees=Object.fromEntries([...ids].map(id=>[id,0]));
for(const e of graph.edges){assert(ids.has(e.source)&&ids.has(e.target));assert.notEqual(e.source,e.target);const key=[e.source,e.target].sort().join(':');assert(!keys.has(key));keys.add(key);degrees[e.source]++;degrees[e.target]++;}
assert.equal(degrees.D,4);assert.equal(Object.values(degrees).reduce((a,b)=>a+b,0),22);
assert.equal(scene.scene_id,'421061');assert.equal(scene.points.length,18000);assert.equal(scene.parts.length,12);assert.equal(scene.parts.filter(p=>p.label==='exclude').length,5);assert.equal(scene.source_revision.length,40);
for(const p of scene.points){assert.equal(p.length,6);assert(p.every(Number.isFinite));assert(p.slice(3).every(x=>Number.isInteger(x)&&x>=0&&x<=255));}
assert.equal(new Set(scene.parts.map(p=>p.id)).size,12);
for(const p of scene.parts){assert(p.location.length===3&&p.location.every(Number.isFinite));assert(p.dimensions.length===3&&p.dimensions.every(x=>Number.isFinite(x)&&x>=0));assert(p.rotation.every(x=>x===0),'Viewer assumes axis-aligned source boxes');if(p.motion_dir)assert(p.motion_dir.length===3&&p.motion_dir.every(Number.isFinite));}
for(const html of ['dist/index.html','dist/deploy.html']){const body=fs.readFileSync(html,'utf8');for(const match of body.matchAll(/(?:href|src)="([^"#]+)"/g)){const url=match[1];if(/^(https?:|data:)/.test(url))continue;assert(fs.existsSync(path.resolve(path.dirname(html),url)),`Missing asset: ${url}`);}}
for(const name of fs.readdirSync('notebooks')){const nb=read('notebooks/'+name);assert.equal(nb.nbformat,4);assert(nb.cells.length>5);assert(nb.cells.some(c=>c.cell_type==='code'));assert(fs.existsSync('dist/notebooks/'+name));}
console.log('PASS: graph semantics/counts; point and annotation schema; axis-aligned boxes; local asset links; notebook structure.');
console.log('External deployment and R-kernel execution are separate instructor checks.');
