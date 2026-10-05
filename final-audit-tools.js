(function(){
  var filterRow=null;
  var busy=false;
  var labels=['Audit','Order','Invoice','Customer','Salesperson','Item','Order Value','Invoice Value','Difference','Discount','Review Status','Comment','Action'];

  function transactionRows(){
    return Array.from(document.querySelectorAll('#recordRows tr')).filter(function(row){
      return row.querySelector('td:first-child input[type="checkbox"]') && Number.isFinite(Number(row.dataset.id));
    });
  }
  function visibleTransactionRows(){
    return transactionRows().filter(function(row){return row.style.display!=='none';});
  }
  function cellValue(row,index){
    var cell=row.children[index];if(!cell)return '';
    var control=cell.querySelector('input,select');
    if(control){if(control.type==='checkbox')return control.checked?'checked':'unchecked';return String(control.value||'').toLowerCase();}
    return String(cell.textContent||'').trim().toLowerCase();
  }
  function applyColumnFilters(){
    if(!filterRow)return;
    var controls=Array.from(filterRow.querySelectorAll('[data-col]'));
    transactionRows().forEach(function(row){
      var show=controls.every(function(control){
        var term=String(control.value||'').trim().toLowerCase();
        return !term||cellValue(row,Number(control.dataset.col)).includes(term);
      });
      row.style.display=show?'':'none';
    });
    updateCount();
  }
  function updateCount(){
    var el=document.getElementById('visibleAuditCount');
    if(el)el.textContent=visibleTransactionRows().length+' visible audit rows';
  }
  async function bulkSave(checked){
    if(busy)return;
    var rows=visibleTransactionRows();
    var ids=rows.map(function(row){return Number(row.dataset.id);});
    if(!ids.length){alert('No visible audit rows to update.');return;}
    busy=true;setButtonsDisabled(true);
    rows.forEach(function(row){
      var tick=row.querySelector('td:first-child input[type="checkbox"]');
      tick.checked=checked;row.classList.toggle('bulk-audited',checked);
    });
    var response=await client.from('audit_records').update({audit_checked:checked,updated_by:currentUser.id,updated_at:new Date().toISOString()}).in('id',ids).select('id,audit_checked');
    busy=false;setButtonsDisabled(false);
    if(response.error){
      rows.forEach(function(row){var tick=row.querySelector('td:first-child input[type="checkbox"]');tick.checked=!checked;row.classList.toggle('bulk-audited',!checked);});
      alert('Bulk audit error: '+response.error.message);return;
    }
    var saved=response.data||[];
    var savedMap=new Map(saved.map(function(item){return [Number(item.id),Boolean(item.audit_checked)];}));
    rows.forEach(function(row){var id=Number(row.dataset.id),tick=row.querySelector('td:first-child input[type="checkbox"]');if(savedMap.has(id)){tick.checked=savedMap.get(id);row.classList.toggle('bulk-audited',tick.checked);}});
    if(typeof allRecords!=='undefined')allRecords.forEach(function(item){if(savedMap.has(Number(item.id)))item.audit_checked=savedMap.get(Number(item.id));});
    if(typeof filteredRecords!=='undefined')filteredRecords.forEach(function(item){if(savedMap.has(Number(item.id)))item.audit_checked=savedMap.get(Number(item.id));});
    if(typeof pageRecords!=='undefined')pageRecords.forEach(function(item){if(savedMap.has(Number(item.id)))item.audit_checked=savedMap.get(Number(item.id));});
    if(saved.length!==ids.length){alert('Requested '+ids.length+' rows, but Supabase saved '+saved.length+'.');}
    else if(typeof toast==='function')toast(saved.length+(checked?' audit rows selected':' audit rows cleared'));
    updateCount();
  }
  function setButtonsDisabled(value){['selectVisibleAudit','clearVisibleAudit'].forEach(function(id){var button=document.getElementById(id);if(button)button.disabled=value;});}
  function buildTools(){
    var table=document.querySelector('.table-scroll table');
    var head=table&&table.querySelector('thead');
    if(!table||!head)return;
    var firstRow=head.querySelector('tr');
    if(firstRow&&firstRow.children[0]){
      firstRow.children[0].innerHTML='<div class="bulk-buttons"><button id="selectVisibleAudit" type="button">Select Visible</button><button id="clearVisibleAudit" type="button">Clear Visible</button><small id="visibleAuditCount"></small></div>';
    }
    var old=head.querySelector('.field-filter-row');if(old)old.remove();
    filterRow=document.createElement('tr');filterRow.className='field-filter-row';
    labels.forEach(function(label,index){
      var th=document.createElement('th');
      if(index===0)th.innerHTML='<select data-col="0"><option value="">All</option><option value="checked">Checked</option><option value="unchecked">Unchecked</option></select>';
      else if(index===10)th.innerHTML='<select data-col="10"><option value="">All</option><option>Pending</option><option>Reviewed</option><option>Correction Required</option><option>Resolved</option></select>';
      else if(index===12)th.innerHTML='<button id="clearAuditFilters" type="button">Clear Filters</button>';
      else th.innerHTML='<input data-col="'+index+'" placeholder="Filter '+label.toLowerCase()+'">';
      filterRow.appendChild(th);
    });
    head.appendChild(filterRow);
    head.addEventListener('input',applyColumnFilters);head.addEventListener('change',applyColumnFilters);
    document.getElementById('selectVisibleAudit').onclick=function(){bulkSave(true);};
    document.getElementById('clearVisibleAudit').onclick=function(){bulkSave(false);};
    document.getElementById('clearAuditFilters').onclick=function(){filterRow.querySelectorAll('input,select').forEach(function(el){el.value='';});applyColumnFilters();};
    var body=document.getElementById('recordRows');if(body)new MutationObserver(function(){applyColumnFilters();}).observe(body,{childList:true});
    applyColumnFilters();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildTools);else buildTools();
})();
