(function(){
  var labels=['Audit','Order','Invoice','Customer','Salesperson','Item','Order Value','Invoice Value','Difference','Discount','Review Status','Comment','Action'];
  var filterRow=null;
  function setup(){
    var table=document.querySelector('.table-scroll table');
    var head=table&&table.querySelector('thead');
    if(!table||!head||filterRow)return;
    var first=head.querySelector('tr');
    var firstTh=first&&first.querySelector('th');
    if(firstTh){firstTh.innerHTML='<label class="select-page"><input id="selectAllVisible" type="checkbox"> Select Page</label>';}
    filterRow=document.createElement('tr');filterRow.className='field-filter-row';
    labels.forEach(function(label,index){
      var th=document.createElement('th');
      if(index===0){th.innerHTML='<select data-col="0"><option value="">All</option><option value="checked">Checked</option><option value="unchecked">Unchecked</option></select>';}
      else if(index===10){th.innerHTML='<select data-col="10"><option value="">All</option><option>Pending</option><option>Reviewed</option><option>Correction Required</option><option>Resolved</option></select>';}
      else if(index===12){th.innerHTML='<button id="clearFieldFilters" type="button">Clear</button>';}
      else{th.innerHTML='<input data-col="'+index+'" placeholder="Filter '+label.toLowerCase()+'">';}
      filterRow.appendChild(th);
    });
    head.appendChild(filterRow);
    head.addEventListener('input',applyRowFilters);head.addEventListener('change',applyRowFilters);
    document.getElementById('clearFieldFilters').onclick=function(){filterRow.querySelectorAll('input,select').forEach(function(el){el.value='';});applyRowFilters();};
    document.getElementById('selectAllVisible').onchange=function(event){
      visibleRows().forEach(function(row){var box=row.querySelector('td:first-child input[type="checkbox"]');if(box&&box.checked!==event.target.checked){box.checked=event.target.checked;box.dispatchEvent(new Event('change',{bubbles:true}));}});
      updateSelectState();
    };
    observeRows(table);applyRowFilters();
  }
  function rows(){return Array.from(document.querySelectorAll('#recordRows tr'));}
  function visibleRows(){return rows().filter(function(row){return row.style.display!=='none';});}
  function cellText(row,index){var cell=row.children[index];if(!cell)return '';var control=cell.querySelector('input,select');if(control){if(control.type==='checkbox')return control.checked?'checked':'unchecked';return String(control.value||'').toLowerCase();}return String(cell.textContent||'').trim().toLowerCase();}
  function applyRowFilters(){
    if(!filterRow)return;var controls=Array.from(filterRow.querySelectorAll('[data-col]'));
    rows().forEach(function(row){var match=controls.every(function(control){var term=String(control.value||'').trim().toLowerCase();return !term||cellText(row,Number(control.dataset.col)).includes(term);});row.style.display=match?'':'none';});
    updateSelectState();
  }
  function updateSelectState(){var master=document.getElementById('selectAllVisible');if(!master)return;var list=visibleRows(),checked=list.filter(function(row){var box=row.querySelector('td:first-child input[type="checkbox"]');return box&&box.checked;}).length;master.checked=list.length>0&&checked===list.length;master.indeterminate=checked>0&&checked<list.length;}
  function observeRows(table){var body=table.querySelector('tbody');if(!body)return;new MutationObserver(function(){applyRowFilters();}).observe(body,{childList:true});body.addEventListener('change',function(){setTimeout(updateSelectState,0);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
