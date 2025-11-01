// docs/preview.js — static preview behavior
(function(){
  const root = document.getElementById('previewRoot');
  const light = document.getElementById('light');
  const dark = document.getElementById('dark');
  light && light.addEventListener('click', ()=> root.setAttribute('data-theme','light'));
  dark && dark.addEventListener('click',  ()=> root.setAttribute('data-theme','dark'));

  // Build swatches from computed CSS variables in tokens.css
  const brandTokens = [50,100,200,300,400,500,600,700,800,900].map(n=>`--brand-${n}`);
  const grayTokens  = [25,50,100,200,300,400,500,600,700,800,900,950].map(n=>`--gray-${n}`);

  function swatch(token){
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim() || '#ccc';
    return `<div class="swatch" style="background:${value}"><span class="tag">${token}</span></div>`;
  }
  document.getElementById('brandSwatches').innerHTML = brandTokens.map(swatch).join('');
  document.getElementById('neutralSwatches').innerHTML = grayTokens.map(swatch).join('');

  // Tabs behavior
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.tabs');
      group.querySelectorAll('.tab').forEach(t => { t.setAttribute('aria-selected','false'); t.setAttribute('tabindex','-1'); });
      group.querySelectorAll('.tabpanel').forEach(p => p.hidden = true);
      tab.setAttribute('aria-selected','true'); tab.removeAttribute('tabindex');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = false;
    });
  });
})();