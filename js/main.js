// main UI behaviors
(function(){
  // set copyright years
  document.getElementById('year')?.textContent = new Date().getFullYear();

  // prompt for PWA install event handling
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // optional: show a lightweight CTA if you want
  });

  // register service worker when available
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{ /* silent fail */ });
  }
})();
