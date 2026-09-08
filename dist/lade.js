const Lade = (() => {
  const $ = s => document.querySelector(s);
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cityMap = { sh:['Shanghai','delivery_sh'], hz:['Hangzhou','delivery_hz'], cq:['Chongqing','delivery_cq'], jl:['Jilin','delivery_jl'], yt:['Yantai','delivery_yt'] };
  const typeNames = {0:'Residential',1:'Commercial',2:'Industrial',3:'Other'};
  const typeClass = t => ({0:'residential',1:'commercial',2:'industrial'}[t] || 'other');
  const state = { rows:[], nodes:[], edges:[], filtered:[], selected:null, view:'node', city:'sh', sample:100 };
  const apiUrl = split => `https://datasets-server.huggingface.co/rows?dataset=Cainiao-AI%2FLaDe-D&config=default&split=${split}&offset=0&length=${state.sample}`;

  const fallback = () => [
    {package_id:10001,courier_id:41,lng:121.474,lat:31.230,aoi_id:101,aoi_type:0,accept_time:'2023-05-01 08:10:00',delivery_time:'2023-05-01 08:34:00',accept_gps_lng:121.462,accept_gps_lat:31.224,delivery_gps_lng:121.474,delivery_gps_lat:31.230,ds:20230501},
    {package_id:10002,courier_id:42,lng:121.482,lat:31.238,aoi_id:102,aoi_type:1,accept_time:'2023-05-01 09:05:00',delivery_time:'2023-05-01 09:29:00',accept_gps_lng:121.474,accept_gps_lat:31.230,delivery_gps_lng:121.482,delivery_gps_lat:31.238,ds:20230501},
    {package_id:10003,courier_id:41,lng:121.491,lat:31.226,aoi_id:103,aoi_type:2,accept_time:'2023-05-01 10:10:00',delivery_time:'2023-05-01 10:48:00',accept_gps_lng:121.482,accept_gps_lat:31.238,delivery_gps_lng:121.491,delivery_gps_lat:31.226,ds:20230501},
    {package_id:10004,courier_id:43,lng:121.468,lat:31.217,aoi_id:104,aoi_type:0,accept_time:'2023-05-01 14:05:00',delivery_time:'2023-05-01 14:21:00',accept_gps_lng:121.491,accept_gps_lat:31.226,delivery_gps_lng:121.468,delivery_gps_lat:31.217,ds:20230501},
    {package_id:10005,courier_id:44,lng:121.480,lat:31.212,aoi_id:105,aoi_type:1,accept_time:'2023-05-01 15:12:00',delivery_time:'2023-05-01 15:35:00',accept_gps_lng:121.468,accept_gps_lat:31.217,delivery_gps_lng:121.480,delivery_gps_lat:31.212,ds:20230501},
    {package_id:10006,courier_id:42,lng:121.494,lat:31.239,aoi_id:106,aoi_type:0,accept_time:'2023-05-01 16:18:00',delivery_time:'2023-05-01 16:40:00',accept_gps_lng:121.480,accept_gps_lat:31.212,delivery_gps_lng:121.494,delivery_gps_lat:31.239,ds:20230501},
    {package_id:10007,courier_id:45,lng:121.457,lat:31.236,aoi_id:107,aoi_type:3,accept_time:'2023-05-01 17:05:00',delivery_time:'2023-05-01 17:37:00',accept_gps_lng:121.494,accept_gps_lat:31.239,delivery_gps_lng:121.457,delivery_gps_lat:31.236,ds:20230501},
    {package_id:10008,courier_id:45,lng:121.470,lat:31.244,aoi_id:108,aoi_type:1,accept_time:'2023-05-01 18:10:00',delivery_time:'2023-05-01 18:28:00',accept_gps_lng:121.457,accept_gps_lat:31.236,delivery_gps_lng:121.470,delivery_gps_lat:31.244,ds:20230501}
  ];

  function normalizeRow(r){
    const p = r.row || r;
    return {...p, package_id:p.package_id ?? p.order_id, courier_id:p.courier_id, aoi_type:Number(p.aoi_type ?? 3), ds:p.ds ?? p.date};
  }
  function dateString(v){ const s=String(v ?? ''); return s.length===8 ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : s.slice(0,10); }
  function coord(r,prefix){ return [Number(r[`${prefix}_gps_lng`]),Number(r[`${prefix}_gps_lat`])]; }
  function cellKey(pt){ return `${pt[0].toFixed(3)},${pt[1].toFixed(3)}`; }
  function build(rows){
    const map = new Map(); const edgeMap = new Map();
    for(const r of rows){
      const a = coord(r,'accept_gps'), d = coord(r,'delivery_gps');
      if(!Number.isFinite(a[0]) || !Number.isFinite(a[1]) || !Number.isFinite(d[0]) || !Number.isFinite(d[1])) continue;
      const ak=cellKey(a), dk=cellKey(d);
      const add=(k,pt,role)=>{ if(!map.has(k)) map.set(k,{id:`C${map.size+1}`,key:k,lng:pt[0],lat:pt[1],count:0,couriers:new Set(),typeCounts:{},role}); const n=map.get(k); n.count++; n.couriers.add(String(r.courier_id)); n.typeCounts[r.aoi_type]=(n.typeCounts[r.aoi_type]||0)+1; };
      add(dk,d,'delivery');
      if(ak!==dk){
        if(!map.has(ak)) map.set(ak,{id:`C${map.size+1}`,key:ak,lng:a[0],lat:a[1],count:0,couriers:new Set(),typeCounts:{},role:'origin'});
        const n=map.get(ak); n.couriers.add(String(r.courier_id));
        const ek=`${ak}|${dk}`; if(!edgeMap.has(ek)) edgeMap.set(ek,{source:ak,target:dk,count:0,packages:new Set(),couriers:new Set()});
        const e=edgeMap.get(ek); e.count++; e.packages.add(String(r.package_id)); e.couriers.add(String(r.courier_id));
      }
    }
    const nodes=[...map.values()].map(n=>({...n,size:Math.max(5,Math.min(25,5+Math.sqrt(n.count)*2)),type:Number(Object.entries(n.typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 3)}));
    const edges=[...edgeMap.values()];
    return {nodes,edges};
  }
  function normalizePositions(nodes){
    const xs=nodes.map(n=>n.lng), ys=nodes.map(n=>n.lat); const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys); return nodes.map(n=>({...n,x:55+(n.lng-minX)/((maxX-minX)||1)*450,y:45+(maxY-n.lat)/((maxY-minY)||1)*450}));
  }
  function render(){
    const host=$('#network-viz'); if(!host)return;
    const rows=state.filtered; const {nodes,edges}=build(rows); state.nodes=normalizePositions(nodes); state.edges=edges;
    if(state.view==='matrix') return renderMatrix();
    const byKey=new Map(state.nodes.map(n=>[n.key,n]));
    let svg='<svg viewBox="0 0 560 540" role="img" aria-label="LaDe delivery movement network">';
    svg+='<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#6fa7d2"/></marker></defs>';
    for(const e of edges){const a=byKey.get(e.source),b=byKey.get(e.target);if(!a||!b)continue;const active=state.selected&&([e.source,e.target].includes(state.selected.key));svg+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${active?'#4af4c5':'#5f89a8'}" stroke-opacity="${active?.9:.55}" stroke-width="${Math.min(8,1+Math.sqrt(e.count))}" marker-end="url(#arrow)"/>`;}
    for(const n of state.nodes){const active=state.selected?.key===n.key;const c=typeClass(n.type);const fill={residential:'#38bdf8',commercial:'#fb923c',industrial:'#4ade80',other:'#a78bfa'}[c];svg+=`<g role="button" tabindex="0" data-lade-node="${esc(n.key)}" aria-label="Inspect delivery cell ${esc(n.id)}"><circle cx="${n.x}" cy="${n.y}" r="${n.size}" fill="${fill}" fill-opacity=".92" stroke="${active?'#fff':'#09243a'}" stroke-width="${active?3:1.5}"/><text x="${n.x}" y="${n.y+n.size+14}" text-anchor="middle" fill="#c9e5f7" font-size="9">${esc(n.id)}</text></g>`;}
    svg+='</svg>'; host.innerHTML=svg; bindNodes(); updateInspector();
  }
  function renderMatrix(){
    const host=$('#network-viz'), ns=state.nodes.slice(0,18), byKey=new Map(ns.map(n=>[n.key,n])); let out='<svg viewBox="0 0 560 540" aria-label="Adjacency matrix of the sampled delivery network"><text x="20" y="25" font-size="13" font-weight="700">Movement matrix</text>';
    const x0=115,y0=55,s=22; ns.forEach((n,i)=>{out+=`<text x="${x0+i*s+8}" y="45" text-anchor="middle" font-size="7" transform="rotate(-45 ${x0+i*s+8} 45)">${esc(n.id)}</text><text x="98" y="${y0+i*s+15}" text-anchor="end" font-size="8">${esc(n.id)}</text>`;});
    ns.forEach((a,i)=>ns.forEach((b,j)=>{const e=state.edges.find(e=>e.source===a.key&&e.target===b.key);out+=`<rect x="${x0+j*s}" y="${y0+i*s}" width="20" height="20" rx="2" fill="${e?'#2563eb':'#edf2f7'}" opacity="${e?Math.min(1,.45+e.count/5):1}"/>`; })); out+='</svg>'; host.innerHTML=out; updateInspector();
  }
  function renderTree(){
    const host=$('#network-viz'); const ns=state.nodes; if(!ns.length){host.innerHTML='<p>No network rows match the filters.</p>';return;}
    const seen=new Set([ns[0].key]), queue=[ns[0].key], chosen=[]; while(queue.length){const k=queue.shift();for(const e of state.edges.filter(e=>e.source===k||e.target===k)){const next=e.source===k?e.target:e.source;if(!seen.has(next)){seen.add(next);queue.push(next);chosen.push(e);}}}
    let svg='<svg viewBox="0 0 560 540" aria-label="Breadth first spanning tree of delivery cells"><text x="20" y="25" font-size="13" font-weight="700">Derived BFS tree · root = '+esc(ns[0].id)+'</text>'; const levels={};ns.forEach(n=>levels[n.key]=0);chosen.forEach(e=>{levels[e.target]=(levels[e.source]??0)+1;levels[e.source]=levels[e.source]??0;});
    const groups={};ns.forEach(n=>{const l=Math.min(4,levels[n.key]||0);(groups[l]??=[]).push(n);}); Object.values(groups).forEach((arr,l)=>arr.forEach((n,i)=>{n.tx=70+i*(430/Math.max(1,arr.length-1)),n.ty=70+l*105;}));
    chosen.forEach(e=>{const a=ns.find(n=>n.key===e.source),b=ns.find(n=>n.key===e.target);if(a&&b)svg+=`<line x1="${a.tx}" y1="${a.ty}" x2="${b.tx}" y2="${b.ty}" stroke="#8aa8bf" stroke-width="2"/>`;}); ns.forEach(n=>{const c={residential:'#38bdf8',commercial:'#fb923c',industrial:'#4ade80',other:'#a78bfa'}[typeClass(n.type)];svg+=`<circle cx="${n.tx}" cy="${n.ty}" r="${n.size}" fill="${c}"/><text x="${n.tx}" y="${n.ty+32}" text-anchor="middle" fill="#102a43" font-size="9">${n.id}</text>`;});svg+='</svg>';host.innerHTML=svg;updateInspector();
  }
  function updateInspector(){
    const d=$('#network-detail'); if(!d)return; if(!state.selected){d.innerHTML='<h3>Select a node</h3><p>Click a spatial cell to inspect activity and destinations.</p>';}
    else {const n=state.selected, out=state.edges.filter(e=>e.source===n.key), incoming=state.edges.filter(e=>e.target===n.key), totalOut=out.reduce((s,e)=>s+e.count,0), totalIn=incoming.reduce((s,e)=>s+e.count,0); d.innerHTML=`<div class="selected-node"><span class="legend-dot ${typeClass(n.type)}"></span><strong>${esc(n.id)}</strong></div><p><strong>${n.count}</strong> delivery observations<br><strong>${n.couriers.size}</strong> couriers observed<br>AOI type: <strong>${esc(typeNames[n.type])}</strong></p><div class="detail-label">Movement</div><p class="detail-value">${totalIn} incoming · ${totalOut} outgoing trips</p><div class="detail-label">Top destinations</div><p class="detail-value">${out.sort((a,b)=>b.count-a.count).slice(0,4).map(e=>`${esc(state.nodes.find(x=>x.key===e.target)?.id||'cell')} · ${e.count} trips`).join('<br>')||'No outgoing connection in sample'}</p>`;}
    $('#metric-deliveries').textContent=state.filtered.length.toLocaleString(); $('#metric-couriers').textContent=new Set(state.filtered.map(r=>r.courier_id)).size.toLocaleString(); $('#metric-cells').textContent=state.nodes.length.toLocaleString();
    const hours=Array(24).fill(0);state.filtered.forEach(r=>{const h=Number(String(r.delivery_time||'').slice(11,13));if(Number.isFinite(h))hours[h]++;});const max=Math.max(1,...hours);$('#hour-bars').innerHTML=hours.map((v,h)=>`<div class="hour-bar" style="height:${Math.max(3,v/max*78)}px" title="${h}:00 · ${v} deliveries"><span>${h%3===0?h:''}</span></div>`).join('');
    $('#edge-table').innerHTML='<table><thead><tr><th>Origin cell</th><th>Destination cell</th><th>Trips</th><th>Couriers</th></tr></thead><tbody>'+state.edges.sort((a,b)=>b.count-a.count).slice(0,40).map(e=>`<tr><td>${esc(state.nodes.find(n=>n.key===e.source)?.id||'—')}</td><td>${esc(state.nodes.find(n=>n.key===e.target)?.id||'—')}</td><td>${e.count}</td><td>${e.couriers.size}</td></tr>`).join('')+'</tbody></table>';
  }
  function bindNodes(){document.querySelectorAll('[data-lade-node]').forEach(el=>{const activate=()=>{state.selected=state.nodes.find(n=>n.key===el.dataset.ladeNode)||null;render();};el.onclick=activate;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}};});}
  function filteredRows(){let rows=state.rows.slice();const date=$('#lade-date').value,aoi=$('#aoi-filter').value,pkg=$('#package-filter').value.trim();if(date)rows=rows.filter(r=>dateString(r.ds)===date);if(aoi!=='all')rows=rows.filter(r=>String(r.aoi_type)===aoi);if(pkg)rows=rows.filter(r=>String(r.package_id).includes(pkg));return rows;}
  async function load(){const city=cityMap[state.city];$('#lade-status').textContent='Loading a public LaDe sample…';try{const res=await fetch(apiUrl(city[1]));if(!res.ok)throw new Error(`Dataset Viewer returned ${res.status}`);const json=await res.json();state.rows=(json.rows||[]).map(normalizeRow);}catch(e){state.rows=fallback();$('#lade-status').textContent='Live sample unavailable · showing bundled fallback';}state.filtered=filteredRows();const dates=[...new Set(state.rows.map(r=>dateString(r.ds)).filter(Boolean))].sort();if(!$('#lade-date').value&&dates[0])$('#lade-date').value=dates[0];state.filtered=filteredRows();populateAoi();render();if($('#lade-status').textContent.startsWith('Loading'))$('#lade-status').textContent=`Loaded ${state.rows.length} rows from LaDe-D · ${city[0]}`;}
  function populateAoi(){const select=$('#aoi-filter');const current=select.value;select.innerHTML='<option value="all">All types</option>'+[...new Set(state.rows.map(r=>r.aoi_type))].sort().map(t=>`<option value="${esc(t)}">${esc(typeNames[t]||`Type ${t}`)}</option>`).join('');select.value=[...select.options].some(o=>o.value===current)?current:'all';}
  function refresh(){state.filtered=filteredRows();state.selected=null;render();}
  function init(){if(!$('#network-viz'))return;$('#lade-refresh').onclick=load;$('#lade-city').onchange=e=>{state.city=e.target.value;$('#lade-date').value='';load();};$('#lade-limit').onchange=e=>{state.sample=Math.max(20,Math.min(100,Number(e.target.value)||100));load();};$('#lade-date').onchange=refresh;$('#aoi-filter').onchange=refresh;$('#package-filter').oninput=refresh;$('#lade-reset').onclick=()=>{$('#lade-date').value='';$('#aoi-filter').value='all';$('#package-filter').value='';refresh();};[['node-view','node'],['matrix-view','matrix'],['tree-view','tree']].forEach(([id,v])=>$('#'+id).onclick=()=>{state.view=v;document.querySelectorAll('.segmented button').forEach(b=>b.setAttribute('aria-pressed',String(b.id===id)));render();});load();}
  return {init};
})();
window.addEventListener('DOMContentLoaded',()=>Lade.init());
