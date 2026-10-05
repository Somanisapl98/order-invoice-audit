(function(){
  var busy=false;

  function masterBox(){
    return document.getElementById('selectAllVisible') || document.getElementById('selectAllPage');
  }

  function actualVisibleAuditRows(){
    return Array.from(document.querySelectorAll('#recordRows tr')).filter(function(row){
      if(row.style.display==='none')return false;
      var checkbox=row.querySelector('td:first-child input[type="checkbox"]');
      var id=Number(row.dataset.id);
      return Boolean(checkbox) && Number.isFinite(id);
    });
  }

  async function updateActualRows(checked){
    var rows=actualVisibleAuditRows();
    var ids=rows.map(function(row){return Number(row.dataset.id);});
    if(!ids.length){
      alert('No visible audit transaction rows were found.');
      return;
    }

    busy=true;
    var master=masterBox();
    if(master)master.disabled=true;

    var response=await client
      .from('audit_records')
      .update({
        audit_checked:checked,
        updated_by:currentUser.id,
        updated_at:new Date().toISOString()
      })
      .in('id',ids)
      .select('id,audit_checked');

    busy=false;
    if(master)master.disabled=false;

    if(response.error){
      alert('Select Page error: '+response.error.message);
      return;
    }

    var updated=response.data||[];
    var updatedIds=new Set(updated.map(function(row){return Number(row.id);}));

    rows.forEach(function(row){
      var id=Number(row.dataset.id);
      if(!updatedIds.has(id))return;
      var checkbox=row.querySelector('td:first-child input[type="checkbox"]');
      if(checkbox)checkbox.checked=checked;
    });

    if(updated.length!==ids.length){
      alert('Requested '+ids.length+' audit rows, but Supabase returned '+updated.length+'. Check the update policy for audit_records.');
    }else if(typeof toast==='function'){
      toast(updated.length+' audit rows updated');
    }

    if(typeof loadAllRecords==='function')await loadAllRecords();
  }

  document.addEventListener('change',function(event){
    var target=event.target;
    if(!target||(target.id!=='selectAllVisible'&&target.id!=='selectAllPage'))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if(busy)return;
    updateActualRows(target.checked);
  },true);
})();
