window.addEventListener('load', function () {
  var msg = document.getElementById('dataMsg');
  if (!msg) return;
  function clean() {
    msg.textContent = msg.textContent.split('Ã¢â‚¬Â¢').join(' | ').split('â€¢').join(' | ');
  }
  clean();
  new MutationObserver(clean).observe(msg, {childList:true,subtree:true,characterData:true});
});