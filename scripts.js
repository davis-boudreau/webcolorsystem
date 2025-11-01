/* ========= OKLCH mini-kit ========= */
const clamp = (x,a,b)=>Math.min(b,Math.max(a,x));
const toFixedHex = x => clamp(Math.round(x*255),0,255).toString(16).padStart(2,'0');
const hexToRgb = hex => {
  const m = hex.replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(!m) throw Error("Bad HEX");
  let h = m[1].toLowerCase();
  if(h.length===3) h = [...h].map(c=>c+c).join('');
  return { r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16) };
};
const rgbToHex = ({r,g,b}) => `#${toFixedHex(r/255)}${toFixedHex(g/255)}${toFixedHex(b/255)}`;

const srgbToLinear = v => (v<=0.04045)? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
const linearToSrgb = v => (v<=0.0031308)? 12.92*v : 1.055*Math.pow(v,1/2.4)-0.055;

function srgbToOklab(r8,g8,b8){
  const r = srgbToLinear(r8/255), g = srgbToLinear(g8/255), b = srgbToLinear(b8/255);
  const l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b;
  const m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b;
  const s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b;
  const l_=Math.cbrt(l), m_=Math.cbrt(m), s_=Math.cbrt(s);
  const L = 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_;
  const a = 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_;
  const b2= 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_;
  return {L, a, b:b2};
}
function oklabToSrgb(L,a,b){
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const l = l_**3, m = m_**3, s = s_**3;
  let r = +4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
  let g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
  let bl= -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;
  r = clamp(linearToSrgb(r),0,1);
  g = clamp(linearToSrgb(g),0,1);
  bl= clamp(linearToSrgb(bl),0,1);
  return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(bl*255) };
}
const rad2deg = x => x*180/Math.PI;
const deg2rad = x => x*Math.PI/180;
function oklabToOklch({L,a,b}) { const C = Math.hypot(a,b); let h = Math.atan2(b,a); if (h < 0) h += 2*Math.PI; return { L, C, H: rad2deg(h) }; }
function oklchToOklab({L,C,H}){ const h = deg2rad(H); return { L, a: C*Math.cos(h), b: C*Math.sin(h) }; }
function hexToOklch(hex){ const {r,g,b} = hexToRgb(hex); return oklabToOklch(srgbToOklab(r,g,b)); }
function oklchToHex(L,C,H){ const lab = oklchToOklab({L,C,H}); return rgbToHex(oklabToSrgb(lab.L, lab.a, lab.b)); }

/* ===== Ramp Generators ===== */
function buildBrandRamp(seedHex, Ls, opts={}){
  const seed = hexToOklch(seedHex);
  const H = (typeof opts.brandHueDeg === 'number') ? opts.brandHueDeg : seed.H;
  const midC = (typeof opts.midChroma === 'number') ? opts.midChroma : seed.C;
  const endC = (typeof opts.endChroma === 'number') ? opts.endChroma : (midC*0.55);
  const labels = [50,100,200,300,400,500,600,700,800,900];
  const N = Ls.length-1;
  return Ls.map((L,i)=>{
    const t = i/N; // 0..1
    const C = endC + (midC - endC) * (1 - Math.abs(0.5 - t)*2); // peak mid, ease ends
    const hex = oklchToHex(L, C, H);
    return { token:`--brand-${labels[i]}`, L:+L.toFixed(3), C:+C.toFixed(3), H:+H.toFixed(1), hex };
  });
}
function buildNeutralRamp({hueDeg=280, chroma=0.01, Ls}){
  const labels = [25,50,100,200,300,400,500,600,700,800,900,950];
  return Ls.map((L,i)=>{
    const hex = oklchToHex(L, chroma, hueDeg);
    return { token:`--gray-${labels[i]}`, L:+L.toFixed(3), C:+chroma.toFixed(3), H:+hueDeg.toFixed(1), hex };
  });
}

/* ===== UI Wiring ===== */
const $ = sel => document.querySelector(sel);
const dynamicStyle = $("#dynamicTokens");
const brandSwatches = $("#brandSwatches");
const brandTableBody = $("#brandTable tbody");
const neutralSwatches = $("#neutralSwatches");
const neutralTableBody = $("#neutralTable tbody");
const cssOut = $("#cssOut");
const jsonOut = $("#jsonOut");
const downloadLink = $("#downloadJson");
const copyCssBtn = $("#copyCssBtn");
const toast = $("#toast");

const brandChip = $("#brandChip");
const previewRoot = $("#previewRoot");
const prevBrandSwatches = $("#previewBrandSwatches");
const prevNeutralSwatches = $("#previewNeutralSwatches");

/* Theme toggle */
$("#lightBtn").addEventListener("click", ()=>{ previewRoot.dataset.theme="light"; });
$("#darkBtn").addEventListener("click", ()=>{ previewRoot.dataset.theme="dark"; });

function showToast(msg="Copied!") {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"), 1500);
}
copyCssBtn.addEventListener("click", async ()=>{
  try{
    await navigator.clipboard.writeText(cssOut.textContent);
    showToast("Copied CSS variables to clipboard.");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = cssOut.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Copied CSS variables to clipboard.");
  }
});

function parseNumberList(str, expectedCount) {
  const arr = str.split(/[, \n\t]+/).map(s=>s.trim()).filter(Boolean).map(Number);
  if (arr.some(n => Number.isNaN(n))) throw Error("One or more Lightness values are not numbers.");
  if (expectedCount && arr.length !== expectedCount) throw Error(`Expected ${expectedCount} values, got ${arr.length}.`);
  return arr;
}
function renderSwatches(container, list) {
  container.innerHTML = list.map(item => `
    <div class="swatch" style="background:${item.hex}">
      <span class="tag">${item.token}</span>
    </div>
  `).join("");
}
function renderTable(tbody, list){
  tbody.innerHTML = list.map(item => `
    <tr>
      <td><code>${item.token}</code></td>
      <td><code>${item.hex}</code></td>
      <td>${item.L}</td><td>${item.C}</td><td>${item.H}</td>
    </tr>
  `).join("");
}
function toCssBlock(title, rows){
  const lines = rows.map(r => `  ${r.token}: ${r.hex};`).join("\n");
  return `/* ${title} */\n:root {\n${lines}\n}\n`;
}
function mapSemantics(brand, neutral){
  const by = {}; brand.forEach(x=>by[x.token]=x.hex);
  const gy = {}; neutral.forEach(x=>gy[x.token]=x.hex);

  return `
/* Primitive ramps */
:root {
${brand.map(x=>`  ${x.token}: ${x.hex};`).join('\n')}
${neutral.map(x=>`  ${x.token}: ${x.hex};`).join('\n')}
}

/* Semantic mapping for PREVIEW ONLY */
#previewRoot[data-theme="light"]{
  --preview-color-bg: ${gy['--gray-25']};
  --preview-color-surface: ${gy['--gray-50']};
  --preview-color-elevated: ${gy['--gray-100']};
  --preview-color-border: ${gy['--gray-200']};
  --preview-color-text: ${gy['--gray-900']};
  --preview-color-text-muted: ${gy['--gray-700']};

  --preview-color-brand: ${by['--brand-600']};
  --preview-color-brand-hover: ${by['--brand-700']};
  --preview-color-brand-active: ${by['--brand-800']};
  --preview-color-brand-soft: ${by['--brand-100']};

  --preview-text-on-brand: #ffffff;
  --preview-text-on-brand-hover: #ffffff;
  --preview-text-on-brand-soft: ${by['--brand-700']};

  /* Modal guidance (light) */
  --preview-modal-surface: ${gy['--gray-100']};     /* neutral/100 */
  --preview-modal-text: ${gy['--gray-900']};        /* neutral/900 */
  --preview-modal-heading: ${by['--brand-500']};    /* brand/500 */
  --preview-modal-primary-bg: ${by['--brand-600']}; /* brand/600 */
  --preview-modal-primary-fg: #ffffff;
  --preview-modal-secondary-bg: ${gy['--gray-400']};/* neutral/400 */
  --preview-modal-secondary-fg: ${gy['--gray-900']};
  --preview-success: #2E8B57; --preview-success-soft: #E9FFF5;
  --preview-warning: #B8860B; --preview-warning-soft: #FFF7E6;
  --preview-danger:  #C03631; --preview-danger-soft:  #FFEDEE;
}

#previewRoot[data-theme="dark"]{
  --preview-color-bg: ${gy['--gray-950']};
  --preview-color-surface: ${gy['--gray-900']};
  --preview-color-elevated: ${gy['--gray-800']};
  --preview-color-border: ${gy['--gray-700']};
  --preview-color-text: ${gy['--gray-25']};
  --preview-color-text-muted: ${gy['--gray-300']};

  --preview-color-brand: ${by['--brand-400']};
  --preview-color-brand-hover: ${by['--brand-300']};
  --preview-color-brand-active: ${by['--brand-500']};
  --preview-color-brand-soft: color-mix(in oklab, ${by['--brand-400']} 18%, transparent);

  --preview-text-on-brand: #ffffff;
  --preview-text-on-brand-hover: #ffffff;
  --preview-text-on-brand-soft: ${by['--brand-900']};

  /* Modal guidance (dark) */
  --preview-modal-surface: ${gy['--gray-900']};     /* neutral/900 */
  --preview-modal-text: ${gy['--gray-25']};         /* neutral/25 */
  --preview-modal-heading: ${by['--brand-500']};    /* brand/500 */
  --preview-modal-primary-bg: ${by['--brand-600']}; /* brand/600 */
  --preview-modal-primary-fg: #ffffff;
  --preview-modal-secondary-bg: ${gy['--gray-400']};/* neutral/400 */
  --preview-modal-secondary-fg: ${gy['--gray-25']};
  --preview-success: #5ED0A2; --preview-success-soft: color-mix(in oklab, #5ED0A2 14%, transparent);
  --preview-warning: #FFC472; --preview-warning-soft: color-mix(in oklab, #FFC472 14%, transparent);
  --preview-danger:  #FF8C8A; --preview-danger-soft: color-mix(in oklab, #FF8C8A 14%, transparent);
}

/* Apply background/text from preview tokens */
#previewRoot{
  background: var(--preview-color-bg);
  color: var(--preview-color-text);
}
#previewRoot .preview-header,
#previewRoot .section,
#previewRoot .card,
#previewRoot .preview-footer{
  background: var(--preview-color-surface);
  border-color: var(--preview-color-border);
}
#previewRoot a { color: var(--preview-color-brand); text-decoration: underline; text-underline-offset: 2px; }
`;
}
function downloadJSON(dataObj){
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = $("#downloadJson");
  link.href = url;
  link.setAttribute("aria-disabled","false");
}
function setBrandChip(hex){ brandChip.textContent = "Brand: " + hex.toUpperCase(); }

/* ===== Interactions: Modal, Tabs, Accordion, Sliders ===== */
const openModalButton = document.getElementById("openModalBtn");
const backdrop = document.getElementById("backdrop");
const closeModalButton = document.getElementById("closeModalBtn");
const cancelModalButton = document.getElementById("cancelModalBtn");

function openModal(){ backdrop.setAttribute("aria-hidden","false"); closeModalButton && closeModalButton.focus(); document.addEventListener("keydown", trap); }
function closeModal(){ backdrop.setAttribute("aria-hidden","true"); openModalButton && openModalButton.focus(); document.removeEventListener("keydown", trap); }
function trap(e){ if(e.key === "Escape") closeModal(); }
openModalButton && openModalButton.addEventListener("click", openModal);
closeModalButton && closeModalButton.addEventListener("click", closeModal);
cancelModalButton && cancelModalButton.addEventListener("click", closeModal);

// Tabs
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.tabpanel'));
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>selectTab(tab));
  tab.addEventListener('keydown', (e)=>{
    const i = tabs.indexOf(tab);
    if(e.key === 'ArrowRight'){ tabs[(i+1)%tabs.length].click(); }
    if(e.key === 'ArrowLeft'){ tabs[(i-1+tabs.length)%tabs.length].click(); }
  });
});
function selectTab(active){
  tabs.forEach(t=>{
    const selected = (t===active);
    t.setAttribute('aria-selected', selected);
    t.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(p=>{
    p.hidden = (p.id !== active.getAttribute('aria-controls'));
  });
  active.focus();
}

/* Sliders: show live values + update CSS progress */
document.querySelectorAll('.range-row').forEach(row=>{
  const r = row.querySelector('input[type="range"]');
  const out = row.querySelector('output');
  if (r) {
    const setP = () => {
      const p = ((r.value - r.min) / (r.max - r.min)) * 100;
      r.style.setProperty('--p', p);
    };
    setP();
    r.addEventListener('input', ()=>{
      out && (out.textContent = r.value);
      setP();
    });
  }
});

/* ===== Generate ramps ===== */
document.getElementById("runBtn").addEventListener("click", () => {
  try{
    const seedHex = $("#seedHex").value.trim();
    if(!/^#?[0-9a-f]{6}$/i.test(seedHex) && !/^#?[0-9a-f]{3}$/i.test(seedHex)){
      alert("Please enter a valid HEX color, e.g., #7B458F");
      return;
    }
    const seedHexNormalized = seedHex.startsWith("#") ? seedHex : ("#"+seedHex);

    // Optional brand overrides
    const brandHueStr = $("#brandHue").value.trim();
    const brandChromaStr = $("#brandChroma").value.trim();
    const brandHue = brandHueStr === "" ? undefined : Number(brandHueStr);
    const brandMidC = brandChromaStr === "" ? undefined : Number(brandChromaStr);

    const neutralHue = Number($("#neutralHue").value);
    const neutralChroma = Number($("#neutralChroma").value);

    const LsBrand = parseNumberList($("#brandLs").value, 10);
    const LsNeutral = parseNumberList($("#neutralLs").value, 12);

    // Build ramps
    const brand = buildBrandRamp(seedHexNormalized, LsBrand, { brandHueDeg: brandHue, midChroma: brandMidC });
    const neutral = buildNeutralRamp({hueDeg: neutralHue, chroma: neutralChroma, Ls: LsNeutral});

    // Left column: swatches & tables
    renderSwatches(brandSwatches, brand);
    renderTable(brandTableBody, brand);
    renderSwatches(neutralSwatches, neutral);
    renderTable(neutralTableBody, neutral);

    // CSS vars
    const css = toCssBlock("Brand ramp variables", brand) + "\n" + toCssBlock("Neutral ramp variables", neutral);
    cssOut.textContent = css;

    // Inject preview mapping
    dynamicStyle.textContent = mapSemantics(brand, neutral);
    const brand600 = brand.find(x=>x.token==='--brand-600')?.hex || seedHexNormalized;
    setBrandChip(brand600);

    // Preview swatches
    const brandOrder = [50,100,200,300,400,500,600,700,800,900];
    const neutralOrder = [25,50,100,200,300,400,500,600,700,800,900,950];
    const brandMap = Object.fromEntries(brand.map(x=>[x.token,x.hex]));
    const neutralMap = Object.fromEntries(neutral.map(x=>[x.token,x.hex]));

    const brandPreviewHtml = brandOrder.map(n => {
      const key = "--brand-" + n;
      const hex = brandMap[key];
      return '<div class="swatch" style="background:' + hex + '"><span class="tag">' + key + '</span></div>';
    }).join("");

    const neutralPreviewHtml = neutralOrder.map(n => {
      const key = "--gray-" + n;
      const hex = neutralMap[key];
      return '<div class="swatch" style="background:' + hex + '"><span class="tag">' + key + '</span></div>';
    }).join("");

    prevBrandSwatches.innerHTML = brandPreviewHtml;
    prevNeutralSwatches.innerHTML = neutralPreviewHtml;

    // JSON
    const seedOKLCH = hexToOklch(seedHexNormalized);
    const actualBrandHue = (typeof brandHue === 'number') ? brandHue : +seedOKLCH.H.toFixed(1);
    const actualBrandMidC = (typeof brandMidC === 'number') ? brandMidC : +seedOKLCH.C.toFixed(3);
    const data = {
      seedHex: seedHexNormalized,
      seedOKLCH: { L:+seedOKLCH.L.toFixed(3), C:+seedOKLCH.C.toFixed(3), H:+seedOKLCH.H.toFixed(1) },
      brandControls: { brandHue: actualBrandHue, midChroma: actualBrandMidC, endChromaRatio: 0.55 },
      neutralControls: { hue: neutralHue, chroma: neutralChroma },
      brand, neutral
    };
    jsonOut.textContent = JSON.stringify(data, null, 2);
    downloadJSON(data);

  } catch(err){
    alert("Error: " + err.message);
  }
});

/* Copy CSS */
document.getElementById("copyCssBtn").addEventListener("click", async ()=>{
  try{
    await navigator.clipboard.writeText(cssOut.textContent);
    showToast("Copied CSS variables to clipboard.");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = cssOut.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Copied CSS variables to clipboard.");
  }
});

/* Modal open/close */
const confirmBtn = document.getElementById("confirmBtn");
confirmBtn && confirmBtn.addEventListener("click", closeModal);

/* ===== Accordion wiring (single-open, keyboard accessible) ===== */
(function wireAccordion(){
  const acc = document.getElementById('acc');
  if (!acc) return;

  const items = Array.from(acc.querySelectorAll('.accordion-item'));

  const setState = (item, open) => {
    const header = item.querySelector('.accordion-header');
    const panel  = item.querySelector('.accordion-panel');
    const chevron = header.querySelector('span[aria-hidden="true"]');

    item.setAttribute('aria-expanded', String(open));
    header.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;                // hide/show content
    if (chevron) chevron.textContent = open ? '▾' : '▸';
  };

  // init state
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const panel  = item.querySelector('.accordion-panel');
    // ensure accessible relationships
    if (!header.hasAttribute('aria-controls') && panel.id) {
      header.setAttribute('aria-controls', panel.id);
    }
    if (!panel.hasAttribute('role')) {
      panel.setAttribute('role','region');
      panel.setAttribute('aria-labelledby', header.id || (header.id = crypto.randomUUID()));
    }
    // default closed unless author marked open
    const open = item.getAttribute('aria-expanded') === 'true';
    setState(item, open);

    header.type = 'button'; // prevent accidental form submit if any
    header.addEventListener('click', () => {
      // single-open behavior: close others first
      items.forEach(i => i !== item && setState(i, false));
      setState(item, !(item.getAttribute('aria-expanded') === 'true'));
    });
    header.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        header.click();
      }
      // Optional arrow-key navigation
      const i = items.indexOf(item);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i+1)%items.length].querySelector('.accordion-header').focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); items[(i-1+items.length)%items.length].querySelector('.accordion-header').focus(); }
    });
  });
})();
