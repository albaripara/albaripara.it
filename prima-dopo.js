// Prima e dopo: video brevi che partono quando si vedono; l'etichetta passa da «Prima» a «Dopo» al momento giusto
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('[data-pdv]'), function (card) {
    var v = card.querySelector('.pd-video');
    var tag = card.querySelector('.pd-state');
    var cut = parseFloat(card.getAttribute('data-cut')) || 3.5;
    if (!v) return;
    function label() {
      var after = v.currentTime >= cut;
      tag.textContent = after ? 'Dopo' : 'Prima';
      card.classList.toggle('is-after', after);
    }
    v.addEventListener('timeupdate', label);
    if (reduce) { v.controls = true; return; }
    if (!('IntersectionObserver' in window)) { v.autoplay = true; return; }
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    }, { threshold: 0.35 }).observe(v);
  });
})();
