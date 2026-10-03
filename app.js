document.body.classList.add('login-mode');const cfg=window.APP_CONFIG;const db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const $=id=>document.getElementById(id);let user=null,allRecords=[],filteredRecords=[],records=[],dirty=new Map(),opening=false,currentPage=1,pageSize=500,totalRecords=0,filters={};const money=n=>'Rs. '+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});function speech(t){$('speech').textContent=t;$('speech').style.animation='none';requestAnimationFrame(()=>$('speech').style.animation='speechIn .5s both')}$('email').onfocus=()=>speech('Enter the authorized email address created in Supabase.');$('password').onfocus=()=>speech('Now enter the secure password. The password stays hidden.');$('showPass').onclick=()=>{let p=$('password');p.type=p.type==='password'?'text':'password';$('showPass').textContent=p.type==='password'?'Show':'Hide'};function showLogin(m=''){$('app').hidden=true;$('login').hidden=false;$('login').classList.remove('login-exit');$('loginMsg').textContent=m;document.body.classList.add('login-mode');$('signInBtn').disabled=false;signInBtn.textContent='Open Secure Workspace'}async function showDashboard(s){if(opening||!s?.user)return;opening=true;user=s.user;speech('Access confirmed. Opening the audit workspace.');$('login').classList.add('login-exit');setTimeout(async()=>{$('login').hidden=true;$('app').hidden=false;document.body.classList.remove('login-mode');$('welcome').textContent='Signed in: '+user.email;await load();opening=false},700)}$('loginForm').onsubmit=async e=>{e.preventDefault();$('signInBtn').disabled=true;signInBtn.textContent='Verifying access...';const{data,error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('loginMsg').textContent=error.message;speech('The sign-in details were not accepted. Check both fields and try again.');$('signInBtn').disabled=false;signInBtn.textContent='Open Secure Workspace';return}if(data.session)showDashboard(data.session)};db.auth.onAuthStateChange((e,s)=>{if(e==='SIGNED_OUT')showLogin('Signed out successfully.');else if(s&&['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED'].includes(e))showDashboard(s)});async function fetchAllRecords(){
 let all=[],from=0,batch=1000;
 $('dataMsg').textContent='Loading complete database...';
 while(true){
  const {data,error}=await db.from('audit_records').select('*').order('updated_at',{ascending:false}).range(from,from+batch-1);
  if(error){toast('Data loading error: '+error.message,true);return []}
  all=all.concat(data||[]);
  if(!data||data.length<batch)break;
  from+=batch;
 }
 return all;
}
async function load(){
 allRecords=await fetchAllRecords();
 buildCompleteFilterOptions();
 applyFilters();
}
function buildCompleteFilterOptions(){
 const setOptions=(id,key,label)=>{const el=$(id),current=el.value,values=[...new Set(allRecords.map(r=>r[key]).filter(v=>v&&String(v).trim()))].sort((a,b)=>String(a).localeCompare(String(b)));el.innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option value="${safe(v)}">${safe(v)}</option>`).join('');if(values.includes(current))el.value=current;};
 setOptions('branch','branch','All Branches');setOptions('salesman','salesman','All Salespeople');
 const suggestions=[];allRecords.forEach(r=>{[r.sales_order,r.invoice_no,r.customer,r.salesman,r.barcode,r.item].forEach(v=>{if(v&&String(v).trim())suggestions.push(String(v).trim())})});
 const unique=[...new Set(suggestions)].sort((a,b)=>a.localeCompare(b)).slice(0,12000);
 $('searchSuggestions').innerHTML=unique.map(v=>`<option value="${safe(v)}"></option>`).join('');
}
function applyFilters(){
 const q=String(filters.search||'').toLowerCase();
 filteredRecords=allRecords.filter(r=>{
  const diff=Number(r.amount_difference||0), invoice=Number(r.invoice_amount||0), disc=Number(r.discount_percent||0);
  if(filters.branch&&r.branch!==filters.branch)return false;
  if(filters.salesman&&r.salesman!==filters.salesman)return false;
  if(filters.status&&r.status!==filters.status)return false;
  if(filters.auditState&&String(!!r.audit_checked)!==filters.auditState)return false;
  if(filters.customer&&!String(r.customer||'').toLowerCase().includes(String(filters.customer).toLowerCase()))return false;
  if(filters.item&&!String(r.item||'').toLowerCase().includes(String(filters.item).toLowerCase()))return false;
  if(filters.orderFrom&&String(r.order_date||'')<filters.orderFrom)return false;
  if(filters.orderTo&&String(r.order_date||'')>filters.orderTo)return false;
  if(filters.minDiscount!==undefined&&filters.minDiscount!==''&&disc<Number(filters.minDiscount))return false;
  if(filters.maxDiscount!==undefined&&filters.maxDiscount!==''&&disc>Number(filters.maxDiscount))return false;
  if(filters.discountFilter==='none'&&disc!==0)return false;if(filters.discountFilter==='low'&&(disc<=0||disc>10))return false;if(filters.discountFilter==='medium'&&(disc<=10||disc>30))return false;if(filters.discountFilter==='high'&&disc<=30)return false;if(filters.differenceType==='missing'&&invoice!==0)return false;
  if(filters.differenceType==='matched'&&diff!==0)return false;
  if(filters.differenceType==='short'&&diff>=0)return false;
  if(filters.differenceType==='over'&&diff<=0)return false;
  if(q&&!String([r.sales_order,r.invoice_no,r.customer,r.salesman,r.barcode,r.item].join(' ')).toLowerCase().includes(q))return false;
  return true;
 });
 totalRecords=filteredRecords.length;
 const pages=Math.max(1,Math.ceil(totalRecords/pageSize));if(currentPage>pages)currentPage=pages;
 const start=(currentPage-1)*pageSize;records=filteredRecords.slice(start,start+pageSize);
 render();
}
function safe(v){return String(v??'').replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]))}function fillFilters(){[['branch','branch'],['salesman','salesman']].forEach(([id,key])=>{let e=$(id),v=e.value,first=e.options[0].outerHTML;e.innerHTML=first+[...new Set(records.map(r=>r[key]).filter(Boolean))].sort().map(x=>`<option>${safe(x)}</option>`).join('');e.value=v})}function render(){
 const summary=filteredRecords,sum=k=>summary.reduce((a,r)=>a+Number(r[k]||0),0),audited=summary.filter(r=>r.audit_checked).length,pendingAudit=summary.length-audited,missing=summary.filter(r=>!r.invoice_no||Number(r.invoice_amount)===0).length,matched=summary.filter(r=>Number(r.amount_difference)===0).length,shortRows=summary.filter(r=>Number(r.amount_difference)<0),overRows=summary.filter(r=>Number(r.amount_difference)>0),pendingBalance=Math.abs(shortRows.reduce((a,r)=>a+Number(r.amount_difference||0),0)),excessInvoice=overRows.reduce((a,r)=>a+Number(r.amount_difference||0),0);
 const cards=[['â—«','Records',summary.length,'#22d3ee'],['â‚¹','Order Value',money(sum('order_amount')),'#8b5cf6'],['â‚¹','Invoice Value',money(sum('invoice_amount')),'#21d4fd'],['â†“','Pending Balance',money(pendingBalance),'#ffb020'],['â†‘','Excess Invoice',money(excessInvoice),'#f472b6'],['âˆ…','Missing Invoice',missing,'#ff5573'],['âœ“','Matched',matched,'#28dd91'],['âŒ›','Pending Audit',pendingAudit,'#f59e0b']];
 $('cards').innerHTML=cards.map(x=>`<article class="kpi" style="--c:${x[3]}"><small>${x[1]}</small><strong>${x[2]}</strong></article>`).join('');
 const pct=summary.length?Math.round(audited/summary.length*100):0;$('completionText').textContent=pct+'%';$('progressRing').style.setProperty('--p',pct+'%');$('auditedTotal').textContent=audited;
 $('differenceLegend').innerHTML=`<div><span>Matched - no difference</span><b>${matched}</b></div><div><span>Pending balance lines</span><b>${shortRows.length}</b></div><div><span>Excess invoice lines</span><b>${overRows.length}</b></div><div><span>Missing invoice lines</span><b>${missing}</b></div>`;
 $('dataMsg').textContent=`Showing ${records.length.toLocaleString('en-IN')} rows on this page | ${summary.length.toLocaleString('en-IN')} matching records | ${allRecords.length.toLocaleString('en-IN')} total records`;
 $('rows').innerHTML=records.map(row).join('');$('unsavedBadge').textContent=dirty.size+' unsaved';pager();
}
function row(r){let d=dirty.get(r.id)||r;return `<tr data-id="${r.id}" class="${dirty.has(r.id)?'edited':''}"><td><input class="edit audit_checked" type="checkbox" ${d.audit_checked?'checked':''}></td><td>${safe(r.sales_order)}</td><td>${safe(r.invoice_no)}</td><td>${safe(r.customer)}</td><td>${safe(r.salesman)}</td><td title="${safe(r.item)}">${safe(r.item).slice(0,45)}</td><td>${money(r.order_amount)}</td><td>${money(r.invoice_amount)}</td><td class="${Number(r.amount_difference)<0?'diff-negative':Number(r.amount_difference)>0?'diff-positive':'diff-zero'}">${money(r.amount_difference)}</td><td><span class="discount-badge">${Number(r.discount_percent||0).toFixed(2)}%</span></td><td><select class="edit status">${['Pending','Reviewed','Correction Required','Resolved'].map(x=>`<option ${d.status===x?'selected':''}>${x}</option>`).join('')}</select></td><td><input class="edit comments" value="${safe(d.comments)}"></td><td><button onclick="saveOne(${r.id})">Save</button></td></tr>`}document.addEventListener('change',e=>{if(!e.target.classList.contains('edit'))return;let tr=e.target.closest('tr'),id=Number(tr.dataset.id),r={...(dirty.get(id)||records.find(x=>x.id===id))},key=[...e.target.classList].find(x=>x!=='edit');r[key]=e.target.type==='checkbox'?e.target.checked:e.target.value;dirty.set(id,r);saveAllBtn.disabled=false;render()});async function saveOne(id){let r=dirty.get(id);if(!r)return toast('No changes to save');let{error}=await db.from('audit_records').update({audit_checked:!!r.audit_checked,status:r.status,comments:r.comments,discount_percent:Number(r.discount_percent||0),updated_by:user.id,updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message,true);dirty.delete(id);toast('Audit record saved');await load()}window.saveOne=saveOne;$('saveAllBtn').onclick=async()=>{for(let id of [...dirty.keys()])await saveOne(id)};function pager(){let n=Math.max(1,Math.ceil(totalRecords/pageSize));$('pageInformation').textContent=`Page ${currentPage} of ${n}`;$('previousPage').disabled=currentPage<=1;$('nextPage').disabled=currentPage>=n}$('previousPage').onclick=()=>{if(currentPage>1){currentPage--;applyFilters()}};$('nextPage').onclick=()=>{if(currentPage<Math.ceil(totalRecords/pageSize)){currentPage++;applyFilters()}};$('pageSize').onchange=function(){pageSize=Number(this.value);currentPage=1;applyFilters()};const filterIds=['search','branch','salesman','differenceType','discountFilter','auditState','status'];let searchTimer;filterIds.forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{filters[id]=$(id).value;currentPage=1;if(id==='search'){clearTimeout(searchTimer);searchTimer=setTimeout(applyFilters,180)}else applyFilters()}));$('clearFilters').onclick=()=>{filterIds.forEach(id=>$(id).value='');filters={};currentPage=1;applyFilters()};$('exportCsv').onclick=()=>{let h=['Order','Invoice','Customer','Salesperson','Branch','Barcode','Item','Order Amount','Invoice Amount','Difference','Discount %','Status','Audited','Comment'],a=filteredRecords.map(r=>[r.sales_order,r.invoice_no,r.customer,r.salesman,r.branch,r.barcode,r.item,r.order_amount,r.invoice_amount,r.amount_difference,r.discount_percent,r.status,r.audit_checked,r.comments]),csv=[h,...a].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n'),link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='order_invoice_comparison_results.csv';link.click()};$('refreshBtn').onclick=load;$('logoutBtn').onclick=()=>db.auth.signOut();function toast(m,bad=false){let t=$('toast');t.textContent=m;t.style.background=bad?'#751c35':'#12613f';t.style.display='block';setTimeout(()=>t.style.display='none',2600)}db.auth.getSession().then(({data})=>data.session?showDashboard(data.session):showLogin());
