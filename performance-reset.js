(function(){
  function cleanBrokenText(){
    document.querySelectorAll('#dataMsg').forEach(function(el){
      el.textContent=el.textContent.replace(/â€¢/g,' | ').replace(/•/g,' | ');
    });
  }
  var observer=new MutationObserver(cleanBrokenText);
  window.addEventListener('load',function(){
    cleanBrokenText();
    var msg=document.getElementById('dataMsg');
    if(msg)observer.observe(msg,{childList:true,characterData:true,subtree:true});
  });
})();
