// Prima e dopo: la linea si trascina (e si usa anche con la tastiera, è un cursore normale)
(function () {
  [].forEach.call(document.querySelectorAll('[data-pd]'), function (card) {
    var view = card.querySelector('.pd-view');
    var range = card.querySelector('.pd-range');
    if (!view || !range) return;
    function set() { view.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', set);
    set();
  });
})();
