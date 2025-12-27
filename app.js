let DB=null;let brandMap={};let refsForBrand=[];
function norm(str){return (str??"").toString().toUpperCase().trim().replace(/[\s\-_/]+/g,'');}
function uniq(arr){return [...new Set(arr)];}
function $(id){return document.getElementById(id);}
function setOptions(sel, vals, placeholder){
  sel.innerHTML='';
  const o0=document.createElement('option');o0.value='';o0.textContent=placeholder;o0.disabled=true;o0.selected=true;sel.appendChild(o0);
  vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);});
}
function kv(k,v){const d=document.createElement('div');d.className='kv';d.innerHTML=`<div class="k">${k}</div><div class="v">${v??'-'}</div>`;return d;}
function renderResult(it){
  $('sourcePill').textContent=`${brandMap[it.brand]||it.brand} ${it.ref}`;
  $('freebattPill').textContent=`Freebatt First ${it.freebatt}`;
  const s=$('specs');s.innerHTML='';
  s.appendChild(kv('Technologie', it.tech ?? '-'));
  s.appendChild(kv('Capacité', it.ah ? `${it.ah} Ah` : '-'));
  s.appendChild(kv('Puissance', it.cca_en ? `${it.cca_en} A (EN)` : '-'));
  const d=it.dims_mm||{};const dims=(d.L&&d.W&&d.H)?`${d.L} × ${d.W} × ${d.H} mm`:'-';
  s.appendChild(kv('Dimensions', dims));
  s.appendChild(kv('Polarité', it.polarity ?? '-'));
  s.appendChild(kv('Rebords', it.hold_down ?? '-'));
  $('footnote').textContent=it.ean?`EAN: ${it.ean}`:'';
  $('resultCard').hidden=false;$('copyBtn').disabled=false;
  $('copyBtn').onclick=async()=>{
    const text=`${brandMap[it.brand]||it.brand} ${it.ref} -> Freebatt First ${it.freebatt}
${it.tech??''} | ${it.ah?it.ah+'Ah':''} | ${it.cca_en?it.cca_en+'A(EN)':''}
Dims: ${dims} | Polarité: ${it.polarity??''} | Rebords: ${it.hold_down??''}${it.ean?'\nEAN: '+it.ean:''}`.trim();
    try{await navigator.clipboard.writeText(text);$('copyBtn').textContent='Copié ✔';setTimeout(()=>$('copyBtn').textContent='Copier le résultat',1200);}
    catch(e){alert("Impossible de copier automatiquement. (iOS parfois capricieux)\nTu peux sélectionner manuellement.");}
  };
}
function rebuildRefList(b){
  refsForBrand=DB.items.filter(x=>x.brand===b).map(x=>x.ref).sort((a,b)=>a.localeCompare(b));
  setOptions($('refSelect'), refsForBrand, 'Choisir…');$('refSelect').disabled=false;
}
function filterRefs(){
  const q=norm($('refSearch').value);
  const f=q?refsForBrand.filter(r=>norm(r).includes(q)):refsForBrand;
  setOptions($('refSelect'), f, f.length?'Choisir…':'Aucun résultat…');
  $('resultCard').hidden=true;$('copyBtn').disabled=true;
}
function init(){
  const bs=$('brandSelect');const rs=$('refSelect');
  const brands=uniq(DB.items.map(x=>x.brand)).sort((a,b)=>(brandMap[a]||a).localeCompare(brandMap[b]||b));
  bs.innerHTML='';const o0=document.createElement('option');o0.value='';o0.textContent='Choisir…';o0.disabled=true;o0.selected=true;bs.appendChild(o0);
  brands.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=brandMap[code]||code;bs.appendChild(o);});
  setOptions(rs, [], 'Choisir la marque d’abord…');rs.disabled=true;
  bs.onchange=()=>{$('refSearch').value='';rebuildRefList(bs.value);filterRefs();};
  $('refSearch').oninput=filterRefs;
  rs.onchange=()=>{const it=DB.items.find(x=>x.brand===bs.value && x.ref===rs.value); if(it) renderResult(it);};
}
function resetUI(){ $('resultCard').hidden=true;$('copyBtn').disabled=true;$('copyBtn').textContent='Copier le résultat';$('refSearch').value='';init(); }
async function main(){
  DB=await fetch('data.json',{cache:'no-store'}).then(r=>r.json());
  brandMap=DB.brand_labels||{};init();
  $('resetBtn').onclick=resetUI;
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
}
main();
