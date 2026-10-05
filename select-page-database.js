(function(){
  var busy=false;
  function masterBox(){return document.getElementById('selectAllVisible')||document.getElementById('selectAllPage');}
  async function saveVisible(checked){
    var rows=Array.from(document.querySelectorAll('#recordRows tr')).filter(function(row){return row.style.display!=='none';});
    var ids=rows.map(function(row){return Number(row.dataset.id);}).filter(Number.isFinite);
    if(!ids.length){alert('No visible records to update.');return;}
    busy=true;
    var master=masterBox();if(master)master.disabled=true;
    var result=await client.from('audit_records').update({audit_checked:checked,updated_by:currentUser.id,updated_at:new Date().toISOString()}).in('id',ids);
    busy=false;
    if(master)master.disabled=false;
    if(result.error){alert('Select Page error: '+result.error.message);return;}
    if(typeof toast==='function')toast(ids.length+' visible records updated');
    if(typeof loadAllRecords==='function')await loadAllRecords();else location.reload();
  }
  document.addEventListener('change',function(event){
    var target=event.target;
    if(!target||(target.id!=='selectAllVisible'&&target.id!=='selectAllPage'))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(busy)return;
    saveVisible(target.checked);
  },true);
})();
