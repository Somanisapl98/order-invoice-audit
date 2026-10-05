(function(){
  var busy=false;
  function master(){return document.getElementById('selectAllVisible')||document.getElementById('selectAllPage');}
  function auditRows(){
    return Array.from(document.querySelectorAll('#recordRows tr')).filter(function(row){
      return row.style.display!=='none' && row.querySelector('td:first-child input[type="checkbox"]') && Number.isFinite(Number(row.dataset.id));
    });
  }
  async function apply(checked){
    var rows=auditRows();
    var ids=rows.map(function(row){return Number(row.dataset.id);});
    if(!ids.length){alert('No visible audit rows found.');return;}
    busy=true;var box=master();if(box)box.disabled=true;
    var response=await client.from('audit_records').update({audit_checked:checked,updated_by:currentUser.id,updated_at:new Date().toISOString()}).in('id',ids).select('id,audit_checked');
    busy=false;if(box)box.disabled=false;
    if(response.error){alert('Select Page error: '+response.error.message);return;}
    var returned=response.data||[];
    var stateById=new Map(returned.map(function(record){return [Number(record.id),Boolean(record.audit_checked)];}));
    rows.forEach(function(row){
      var id=Number(row.dataset.id);if(!stateById.has(id))return;
      var tick=row.querySelector('td:first-child input[type="checkbox"]');
      tick.checked=stateById.get(id);tick.setAttribute('data-saved','true');
      row.classList.toggle('bulk-audited',tick.checked);
    });
    if(typeof allRecords!=='undefined')allRecords.forEach(function(record){if(stateById.has(Number(record.id)))record.audit_checked=stateById.get(Number(record.id));});
    if(typeof filteredRecords!=='undefined')filteredRecords.forEach(function(record){if(stateById.has(Number(record.id)))record.audit_checked=stateById.get(Number(record.id));});
    if(typeof pageRecords!=='undefined')pageRecords.forEach(function(record){if(stateById.has(Number(record.id)))record.audit_checked=stateById.get(Number(record.id));});
    if(box){box.checked=checked;box.indeterminate=false;}
    var unsaved=document.getElementById('unsavedCount');if(unsaved)unsaved.textContent='0 unsaved';
    if(returned.length!==ids.length)alert('Requested '+ids.length+' rows, but Supabase returned '+returned.length+'.');
    else if(typeof toast==='function')toast(returned.length+' audit rows saved and displayed');
  }
  document.addEventListener('change',function(event){var target=event.target;if(!target||(target.id!=='selectAllVisible'&&target.id!=='selectAllPage'))return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(!busy)apply(target.checked);},true);
})();
