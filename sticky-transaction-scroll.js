(function(){
'use strict';
if(window.__oaiTxnStickyInstalled)return;window.__oaiTxnStickyInstalled=true;
let host=null, section=null, bar=null, inner=null, lock=false;
const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function visible(el){const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}
function findSection(){
 const nodes=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span')];
 const title=nodes.find(e=>visible(e)&&norm(e.textContent).includes('transaction review')&&norm(e.textContent).length<80);
 return title ? (title.closest('section,.card,.panel,.content-section,[class*="transaction"],[id*="transaction"]')||title.parentElement) : document.body;
}
function score(el){return el.scrollWidth-el.clientWidth}
function findHost(root){
 const candidates=[...root.querySelectorAll('div,section,main')].filter(e=>visible(e)&&score(e)>20&&['auto','scroll'].includes(getComputedStyle(e).overflowX));
 if(candidates.length)candidates.sort((a,b)=>score(b)-score(a));
 if(candidates[0])return candidates[0];
 const table=root.querySelector('table');
 if(!table)return null;
 let p=table.parentElement;while(p&&p!==root.parentElement){if(score(p)>20)return p;p=p.parentElement}
 return null;
}
function build(){if(bar)return;bar=document.createElement('div');bar.id='oaiTxnFloatScroll';bar.setAttribute('aria-label','Transaction Review horizontal scrollbar');inner=document.createElement('div');bar.appendChild(inner);document.body.appendChild(bar);bar.addEventListener('scroll',()=>{if(lock||!host)return;lock=true;host.scrollLeft=bar.scrollLeft;requestAnimationFrame(()=>lock=false)});}
function locate(){section=findSection();host=findHost(section);if(!host&&section!==document.body)host=findHost(document.body);return !!host}
function syncSize(){if(!host)return;const r=host.getBoundingClientRect();inner.style.width=host.scrollWidth+'px';bar.style.setProperty('--txn-left',Math.max(8,r.left)+'px');bar.style.setProperty('--txn-width',Math.max(80,Math.min(r.width,innerWidth-16))+'px');if(!lock)bar.scrollLeft=host.scrollLeft}
function refresh(){build();if(!host||!document.contains(host)||score(host)<=20){locate()}if(!host){bar.style.display='none';return}syncSize();const r=host.getBoundingClientRect(),sr=section.getBoundingClientRect();const inSection=sr.bottom>0&&sr.top<innerHeight;const realBottomHidden=r.bottom>innerHeight-24;bar.style.display=(score(host)>20&&inSection&&realBottomHidden)?'block':'none'}
function bind(){if(!locate())return;host.addEventListener('scroll',()=>{if(lock)return;lock=true;bar.scrollLeft=host.scrollLeft;requestAnimationFrame(()=>lock=false)},{passive:true})}
document.addEventListener('DOMContentLoaded',()=>{build();bind();refresh();new MutationObserver(()=>{if(!host||!document.contains(host)){bind()}refresh()}).observe(document.body,{childList:true,subtree:true});if(window.ResizeObserver)new ResizeObserver(refresh).observe(document.body)});
addEventListener('scroll',refresh,{passive:true});addEventListener('resize',refresh,{passive:true});setInterval(refresh,1500);
})();
