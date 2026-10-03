(function(){
  function setupTopScrollbar(){
    var tableScroll=document.querySelector('.table-scroll');
    var table=tableScroll&&tableScroll.querySelector('table');
    if(!tableScroll||!table)return;
    var top=document.querySelector('.table-scroll-top');
    if(!top){
      top=document.createElement('div');
      top.className='table-scroll-top';
      top.setAttribute('aria-label','Horizontal table scroll');
      var inner=document.createElement('div');
      inner.className='table-scroll-top-inner';
      top.appendChild(inner);
      tableScroll.parentNode.insertBefore(top,tableScroll);
    }
    var inner=top.firstElementChild;
    function updateWidth(){inner.style.width=table.scrollWidth+'px';}
    var syncing=false;
    top.addEventListener('scroll',function(){if(syncing)return;syncing=true;tableScroll.scrollLeft=top.scrollLeft;syncing=false;});
    tableScroll.addEventListener('scroll',function(){if(syncing)return;syncing=true;top.scrollLeft=tableScroll.scrollLeft;syncing=false;});
    updateWidth();
    window.addEventListener('resize',updateWidth);
    new ResizeObserver(updateWidth).observe(table);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupTopScrollbar);else setupTopScrollbar();
})();
