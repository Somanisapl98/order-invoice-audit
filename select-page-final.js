(function(){
  var bulkRunning=false;

  function getMaster(){
    return document.getElementById('selectAllVisible') || document.getElementById('selectAllPage');
  }

  function visibleCheckboxes(){
    return Array.from(document.querySelectorAll('#recordRows tr'))
      .filter(function(row){return row.style.display !== 'none';})
      .map(function(row){return row.querySelector('td:first-child input[type="checkbox"]');})
      .filter(Boolean);
  }

  function refreshMaster(){
    if(bulkRunning)return;
    var master=getMaster();
    if(!master)return;
    var boxes=visibleCheckboxes();
    var selected=boxes.filter(function(box){return box.checked;}).length;
    master.checked=boxes.length>0 && selected===boxes.length;
    master.indeterminate=selected>0 && selected<boxes.length;
  }

  function changeOneByOne(targetState){
    var next=visibleCheckboxes().find(function(box){return box.checked!==targetState;});
    if(!next){
      bulkRunning=false;
      refreshMaster();
      return;
    }
    next.click();
    window.setTimeout(function(){changeOneByOne(targetState);},10);
  }

  document.addEventListener('click',function(event){
    var target=event.target;
    if(!target || (target.id!=='selectAllVisible' && target.id!=='selectAllPage'))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if(bulkRunning)return;
    var desired=!target.checked;
    target.checked=desired;
    target.indeterminate=false;
    bulkRunning=true;
    changeOneByOne(desired);
  },true);

  document.addEventListener('change',function(event){
    if(event.target && event.target.matches('#recordRows td:first-child input[type="checkbox"]')){
      window.setTimeout(refreshMaster,20);
    }
  });

  window.setInterval(refreshMaster,800);
})();
