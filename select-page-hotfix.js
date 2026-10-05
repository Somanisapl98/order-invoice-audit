(function(){
  var running=false;
  function visibleRowCheckboxes(){
    return Array.from(document.querySelectorAll('#recordRows tr')).filter(function(row){
      return row.style.display!=='none';
    }).map(function(row){
      return row.querySelector('td:first-child input[type="checkbox"]');
    }).filter(Boolean);
  }
  function updateMaster(){
    var master=document.getElementById('selectAllVisible')||document.getElementById('selectAllPage');
    if(!master||running)return;
    var boxes=visibleRowCheckboxes();
    var checked=boxes.filter(function(box){return box.checked;}).length;
    master.checked=boxes.length>0&&checked===boxes.length;
    master.indeterminate=checked>0&&checked<boxes.length;
  }
  function applyNext(targetState){
    var next=visibleRowCheckboxes().find(function(box){return box.checked!==targetState;});
    if(!next){running=false;updateMaster();return;}
    next.checked=targetState;
    next.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(function(){applyNext(targetState);},0);
  }
  function bind(){
    var master=document.getElementById('selectAllVisible')||document.getElementById('selectAllPage');
    if(!master)return;
    var replacement=master.cloneNode(true);
    master.parentNode.replaceChild(replacement,master);
    replacement.addEventListener('change',function(event){
      if(running)return;
      running=true;
      replacement.indeterminate=false;
      applyNext(event.target.checked);
    });
    document.addEventListener('change',function(event){
      if(event.target.matches('#recordRows td:first-child input[type="checkbox"]'))setTimeout(updateMaster,0);
    });
    var body=document.getElementById('recordRows');
    if(body)new MutationObserver(function(){setTimeout(updateMaster,0);}).observe(body,{childList:true});
    updateMaster();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
