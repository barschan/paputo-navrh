/* Paputo – NÁVRH 2. Data: data.js (window.PAPUTO), stažená z paputo.cz 10. 10. 2026. */
(function () {
  const D = window.PAPUTO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const SHOP = 'https://www.paputo.cz';

  /* ---------- barevná varianta ---------- */
  const qsTheme = new URLSearchParams(location.search).get('theme');
  let theme = qsTheme || localStorage.getItem('paputo-theme') || 'priroda';
  const setTheme = t => {
    theme = t; document.documentElement.dataset.theme = t; localStorage.setItem('paputo-theme', t);
    $$('.themes button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  };
  $$('.themes button').forEach(b => b.onclick = () => setTheme(b.dataset.t));
  setTheme(theme);

  /* ---------- data ---------- */
  const P = {}; D.products.forEach(p => P[p.slug] = p);
  const byId = {}; D.products.forEach(p => byId[p.id] = p);
  const C = {}; D.cats.forEach(c => C[c.slug] = c);
  const PG = {}; D.pages.forEach(p => PG[p.slug] = p);
  const AR = {}; D.articles.forEach(a => AR[a.slug] = a);
  const kids = s => D.cats.filter(c => c.parent === s);

  // Bezplatné informační materiály (v e-shopu vedené jako „produkt“ za 0,01 Kč) – oddělené od nákupu
  const GUIDE_IDS = new Set([372, 397, 273]);
  // Služby – nakupují se, ale prezentují jinak než zboží
  const SERVICE_IDS = new Set([255, 336, 330, 321]);
  const BUNDLE_IDS = new Set([415, 426]);
  const isGuide = p => GUIDE_IDS.has(p.id);
  const sellable = p => !isGuide(p);

  const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const kc = n => n == null ? '' : new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(n) + ' Kč';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const slugify = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const CAT_NAME = {
    'prvni-objednavka-zakladni-slozky-vyzivy': 'První objednávka', 'andulka-prvotni-objednavka': 'Andulka',
    'vsechny-druhy-vyjma-andulek': 'Ostatní papoušci', 'zrniny': 'Krmivo a zrniny',
    'zakladni-denni-smesi-zrnin-2': 'Základní směsi (START)', 'ostatni-smesi': 'Pokračovací směsi Speciál',
    'smesi-pro-naklicovani-a-maceni': 'Klíčení a máčení', 'jatra-a-ocista-organizmu': 'Játra a detoxikace',
    'zdrave-mlsani-pamlsky': 'Pamlsky', 'suseny-hmyz-a-drobni-obratlovci': 'Hmyz',
    'skubani-nutno-dodat-vsechny-ziviny-produkty-c-1-8-viz-navody': 'Škubání peří',
    'vitaminy-a-mineraly': 'Vitamíny a minerály', 'pyl-byliny': 'Pyl a byliny', 'oleje--s-bez-vit-d3': 'Oleje s/bez vitamínu D3',
    'mineraly': 'Minerály', 'konzultace-poradenstvi': 'Poradenství a dárky', 'hygiena-a-domacnost': 'Hygiena a první pomoc',
    'odcerveni': 'Antiparazitika', 'zakladni-lekarnicka-nejen-pro-papousky': 'Základní lékárnička', 'pro-psy': 'Pro psy'
  };
  const cname = c => CAT_NAME[c.slug] || c.name;
  const catLink = s => `#/kategorie/${s}`;

  /* ---------- druhy papoušků (hodnoty z varianty „DRUH papouška“ u zrnin) ---------- */
  const ZR = byId[446];
  const SPECIES = ZR.paramValues[0];
  const spSlug = {}; const spBySlug = {};
  SPECIES.forEach(s => { const k = slugify(s); spSlug[s] = k; spBySlug[k] = s; });
  const prettySp = s => { const t = s.replace(/^p\. /, 'papoušek ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };
  // ORIENTAČNÍ rozdělení podle velikosti – ke kontrole Janou
  const SIZE = {
    male: ['ANDULKA', 'Andulka ALL', 'AGAPORNIS', 'KORELA', 'NEOFÉMA', 'PAPOUŠÍČEK', 'KAKARIKY', 'p. ZPĚVAVÝ'],
    stredni: ['PYRURY', 'ROSELA', 'BARNARD', 'MNÍŠEK', 'ARATINGA', 'p. SENEGALSKÝ', 'p. NÁDHERNÝ', 'p. HORSKÝ', 'p. KRÁLOVSKÝ',
      'p. ČERVENOKŘÍDLÝ', 'p. PATAGONSKÝ', 'ALEXANDR', 'AMAZÓNEK', 'MADA'],
    velke: ['AMAZÓŇAN', 'ŽAKO', 'ARA', 'EKLEKT', 'KAKADU (mimo růžový a inka)', 'KAKADU INKA / RŮŽOVÝ', 'KAKADU HAVRANÍ / ČERNÝ']
  };
  const sizeOf = s => Object.keys(SIZE).find(k => SIZE[k].includes(s)) || 'stredni';
  // australské druhy – travní semena jsou podle e-shopu „nutná pro zdraví andulek, ale i ostatních australských“
  const AUSTRAL = ['ANDULKA', 'Andulka ALL', 'KORELA', 'NEOFÉMA', 'ROSELA', 'BARNARD', 'p. KRÁLOVSKÝ', 'p. NÁDHERNÝ', 'p. HORSKÝ', 'p. ZPĚVAVÝ', 'p. ČERVENOKŘÍDLÝ'];
  const TOP_SPECIES = ['ANDULKA', 'KORELA', 'AGAPORNIS', 'ŽAKO', 'AMAZÓŇAN', 'ARA', 'KAKADU (mimo růžový a inka)', 'ALEXANDR'];

  /* ---------- pomocníci pro karty ---------- */
  const firstV = p => p.variants[0];
  const stockOf = p => p.variants.length ? { t: firstV(p).avail, c: firstV(p).availColor } : { t: p.avail, c: p.availColor };
  const prices = p => p.variants.length ? p.variants.map(v => v.price).filter(x => x != null) : [p.price];
  const priceLabel = p => {
    if (isGuide(p)) return 'zdarma';
    const ps = prices(p); const mn = Math.min(...ps), mx = Math.max(...ps);
    if (!p.variants.length && p.priceText && !/\d/.test(p.priceText)) return p.priceText;
    return (mn === mx ? '' : 'od ') + kc(mn);
  };
  const stockHtml = p => { const s = stockOf(p); return s.t ? `<div class="stock" style="color:${esc(s.c || '#2E8B57')}">${esc(s.t)}</div>` : ''; };
  const photo = (p, alt) => p.images[0]
    ? `<img src="${p.images[0]}" alt="${esc(alt || p.title)}" loading="lazy">`
    : `<div class="none"><b>📷</b>Fotografie bude doplněna</div>`;
  function vchips(p) {
    if ((p.paramNames || []).length > 1) return p.paramNames.map((n, k) => `<span>${p.paramValues[k].length}× ${esc(n.split(' ')[0].toLowerCase())}</span>`).join('');
    if (!p.variants.length) return '';
    // zkrácené hodnoty na jeden řádek: „30ml - s vitaminem D3“ → „30ml“ (celý výběr je na detailu)
    const seen = new Set(), short = [];
    p.variants.forEach(v => { const l = v.label.split(/\s+-\s+|\s+\/\s+/)[0].trim(), k = l.replace(/\s+/g, '').toLowerCase(); if (!seen.has(k)) { seen.add(k); short.push(l); } });
    const n = p.variants.length;
    return `<span class="cnt">${n} ${n < 5 ? 'varianty' : 'variant'}</span>` + short.slice(0, 3).map(l => `<span>${esc(l.length > 14 ? l.slice(0, 13) + '…' : l)}</span>`).join('');
  }
  function cta(p) {
    if (SERVICE_IDS.has(p.id)) return `<a class="addbtn sec" href="#/produkt/${p.slug}">Objednat</a>`;
    if (p.variants.length) return `<a class="addbtn" href="#/produkt/${p.slug}">Vybrat variantu</a>`;
    return `<a class="addbtn" href="${p.url}" target="_blank" rel="noopener" title="Otevře skutečný e-shop">Do košíku</a>`;
  }
  const card = p => `
    <article class="pcard">
      <a class="ph" href="#/produkt/${p.slug}" tabindex="-1">
        <div class="badges">${p.num ? `<span class="bdg">č. ${esc(p.num)}</span>` : '<span></span>'}
          ${BUNDLE_IDS.has(p.id) ? '<span class="bdg hot">Balíček</span>' : SERVICE_IDS.has(p.id) ? '<span class="bdg light">Služba</span>' : ''}</div>
        ${photo(p)}</a>
      <div class="body">
        <h3><a href="#/produkt/${p.slug}">${esc(p.title)}</a></h3>
        <div class="sub">${esc(p.sub)}</div>
        <div class="vchips">${vchips(p)}</div>
        ${stockHtml(p)}
        <div class="foot"><div class="price">${priceLabel(p)}${p.unitPrice ? `<small>${esc(p.unitPrice)}</small>` : ''}</div>
          <div class="cta">${cta(p)}</div></div>
      </div>
    </article>`;
  const guideCard = (href, label, title) => `<a class="guide" href="${href}"><small>${label}</small><b>${esc(title)}</b></a>`;

  /* ---------- vyhledávání ---------- */
  const ALIAS = {
    vitamin: ['vit'], vit: ['vitamin'], d3: ['vit d', 'vitamin d'], vapnik: ['organica', 'vapn'],
    skubani: ['skube', 'peri'], parazit: ['odcerv', 'papendo', 'antiparazit'], cerv: ['parazit', 'odcerv'],
    olej: ['oleje'], semena: ['zrnin', 'semen'], zrni: ['zrnin'], krmeni: ['krmivo', 'zrnin'], jatra: ['jater'],
    pamlsek: ['pamlsk', 'mlsani'], hmyz: ['cervi'], klice: ['klic', 'namac'], kvasnice: ['kvasnic']
  };
  const index = [];
  D.products.forEach(p => index.push({
    kind: isGuide(p) ? 'Poradna – zdarma' : 'Produkty', href: '#/produkt/' + p.slug, title: p.title, sub: p.sub,
    price: isGuide(p) ? '' : priceLabel(p), img: p.images[0],
    f: [[norm(p.title + ' ' + p.num), 12], [norm(p.name), 6], [norm(p.sub), 5],
        [norm(p.variants.map(v => v.label + ' ' + v.code).join(' ') + ' ' + (p.code || '')), 4],
        [norm(p.cats.map(s => C[s] ? cname(C[s]) : '').join(' ')), 3], [norm(strip(p.short) + ' ' + strip(p.desc)), 1]]
  }));
  SPECIES.forEach(s => index.push({ kind: 'Druh papouška', href: '#/druh/' + spSlug[s], title: 'Krmivo pro: ' + prettySp(s), sub: 'zrniny a doporučené doplňky', f: [[norm(s), 14]] }));
  D.cats.forEach(c => index.push({ kind: 'Kategorie', href: catLink(c.slug), title: cname(c), sub: c.products.length + ' položek', f: [[norm(cname(c) + ' ' + c.name), 10], [norm(strip(c.perex)), 1]] }));
  D.pages.concat(D.articles).forEach(a => index.push({
    kind: 'Poradna – zdarma', href: (AR[a.slug] ? '#/clanek/' : '#/stranka/') + a.slug, title: a.name, sub: a.date || 'návod',
    f: [[norm(a.name), 8], [norm(strip(a.html)), 1]]
  }));
  const tokenHit = (text, t) => text.includes(t) || (t.length >= 6 && text.includes(t.slice(0, -2))) || (ALIAS[t] || []).some(a => text.includes(a));
  function search(q) {
    const toks = norm(q).split(/[^a-z0-9]+/).filter(t => t.length > 1 || /\d/.test(t));
    if (!toks.length) return [];
    const res = [];
    for (const it of index) {
      const all = it.f.map(x => x[0]).join(' ');
      if (!toks.every(t => tokenHit(all, t))) continue;
      let sc = 0;
      for (const t of toks) for (const [txt, w] of it.f) if (tokenHit(txt, t)) sc += w * (txt.startsWith(t) ? 2 : 1);
      res.push({ it, sc });
    }
    return res.sort((a, b) => b.sc - a.sc).map(r => r.it);
  }
  function hl(text, q) {
    let out = esc(text);
    norm(q).split(/[^a-z0-9]+/).filter(t => t.length > 1).forEach(t => {
      const i = norm(out).indexOf(t);
      if (i >= 0) out = out.slice(0, i) + '<mark>' + out.slice(i, i + t.length) + '</mark>' + out.slice(i + t.length);
    });
    return out;
  }
  const sIn = $('#q'), sBox = $('#suggest');
  let act = -1;
  const POPULAR = ['olej s D3', 'žako', 'škubání', 'vápník', 'pamlsky', 'Papendo'];
  function renderSuggest() {
    const q = sIn.value.trim(); act = -1;
    if (q.length < 2) {
      sBox.innerHTML = `<div class="kind">Často hledáte</div><div class="pop">${POPULAR.map(x => `<a class="chip" href="#/hledat/${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>`;
      sBox.classList.add('open'); return;
    }
    const r = search(q);
    if (!r.length) sBox.innerHTML = `<div style="padding:16px">Pro „${esc(q)}“ nic nemáme. Zkuste např. <b>olej</b>, <b>žako</b> nebo <b>vápník</b>.</div>`;
    else {
      const order = ['Druh papouška', 'Produkty', 'Kategorie', 'Poradna – zdarma'];
      let html = '';
      order.forEach(k => {
        const g = r.filter(x => x.kind === k).slice(0, k === 'Produkty' ? 5 : 2);
        if (!g.length) return;
        html += `<div class="kind">${k}</div>` + g.map(it => `<a href="${it.href}"><span class="thumb">${it.img ? `<img src="${it.img}" alt="">` : (k === 'Druh papouška' ? '🦜' : k === 'Kategorie' ? '📂' : '📖')}</span>
          <span><span class="t">${hl(it.title, q)}</span><br><span class="s">${esc(it.sub || '')}</span></span>${it.price ? `<span class="pr">${it.price}</span>` : ''}</a>`).join('');
      });
      sBox.innerHTML = html + `<a class="all" href="#/hledat/${encodeURIComponent(q)}">Všechny výsledky (${r.length}) →</a>`;
    }
    sBox.classList.add('open');
  }
  sIn.addEventListener('input', renderSuggest);
  sIn.addEventListener('focus', renderSuggest);
  sIn.addEventListener('keydown', e => {
    const links = $$('a', sBox);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle('act', i === act));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      location.hash = act >= 0 && links[act] ? links[act].getAttribute('href') : '#/hledat/' + encodeURIComponent(sIn.value.trim());
      sBox.classList.remove('open'); sIn.blur();
    } else if (e.key === 'Escape') sBox.classList.remove('open');
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sBox.classList.remove('open'); });

  /* ---------- navigace ---------- */
  const li = (href, t) => `<li><a href="${href}">${esc(t)}</a></li>`;
  const spGroupLinks = k => SIZE[k].map(s => li('#/druh/' + spSlug[s], prettySp(s))).join('');
  $('#menu').innerHTML = `<ul>
    <li><button>Podle druhu ▾</button><div class="mega"><div class="wrap">
      <div><h4>Malí papoušci</h4><ul>${spGroupLinks('male')}</ul></div>
      <div><h4>Střední papoušci</h4><ul>${SIZE.stredni.slice(0, 7).map(s => li('#/druh/' + spSlug[s], prettySp(s))).join('')}</ul></div>
      <div><h4>&nbsp;</h4><ul>${SIZE.stredni.slice(7).map(s => li('#/druh/' + spSlug[s], prettySp(s))).join('')}</ul></div>
      <div><h4>Velcí papoušci</h4><ul>${spGroupLinks('velke')}</ul></div>
      <div class="promo"><b>Nevíte, co vybrat?</b><p>Ke každému druhu ukážeme vhodné zrniny a doplňky ze schématu Paputo.</p><a class="btn btn-brand" href="#/druhy">Všechny druhy</a></div>
    </div></div></li>
    <li><button>Krmivo a doplňky ▾</button><div class="mega"><div class="wrap">
      <div><h4>Krmivo</h4><ul>${li(catLink('zrniny'), 'Všechno krmivo')}${kids('zrniny').map(c => li(catLink(c.slug), cname(c))).join('')}</ul></div>
      <div><h4>Doplňky</h4><ul>${li(catLink('vitaminy-a-mineraly'), 'Vitamíny a minerály')}${kids('vitaminy-a-mineraly').map(c => li(catLink(c.slug), cname(c))).join('')}</ul></div>
      <div><h4>Péče</h4><ul>${li(catLink('hygiena-a-domacnost'), 'Hygiena a první pomoc')}${kids('hygiena-a-domacnost').map(c => li(catLink(c.slug), cname(c))).join('')}${li(catLink('pro-psy'), 'Pro psy')}</ul></div>
      <div><h4>Balíčky</h4><ul>${li('#/produkt/' + byId[415].slug, 'Balíček č. 2–8')}${li('#/produkt/' + byId[426].slug, 'Andulka – základní balíček')}</ul></div>
      <div class="promo"><b>Schéma Paputo 1–8</b><p>Základ jídelníčku: zrniny + 7 doplňků. Produkty jsou očíslované.</p><a class="btn btn-brand" href="#schema">Jak to funguje</a></div>
    </div></div></li>
    <li><a href="${catLink('skubani-nutno-dodat-vsechny-ziviny-produkty-c-1-8-viz-navody')}">Škubání a problémy</a></li>
    <li><a href="${catLink('prvni-objednavka-zakladni-slozky-vyzivy')}">První objednávka</a></li>
    <li><a href="#/poradna">Poradna</a></li>
    <li class="right"><a href="#/stranka/kontakty">Kontakt</a></li></ul>`;
  $('#burger').onclick = () => $('#menu').classList.toggle('open');
  $('#tab-menu').onclick = e => { e.preventDefault(); $('#menu').classList.toggle('open'); window.scrollTo(0, 0); };
  $('#tab-search').onclick = e => { e.preventDefault(); window.scrollTo(0, 0); sIn.focus(); };

  /* ---------- úvod ---------- */
  const STEPS = [
    [446, 'vyberte zrniny dle druhu papouška – zpočátku spíše START (základní směs)'],
    [87, 'jestliže papoušek není na přímém slunečním světle (přes okna/sklo UVB záření neprochází)'],
    [93, 'jestliže nemá každý den alespoň 2 květy nebo pupeny rostlin a dostatek zeleniny/bylin'],
    [102, 'každý papoušek by měl mít volně k dispozici jílový a minerální kámen'],
    [72, 'na doplnění vitamínu B12, celé skupiny B a ostatních prvků (betaglukan)'],
    [78, 'jako zdroj huminových kyselin – Humac nebo bioaktivní uhlí'],
    [108, 'každý papoušek by měl mít volně k dispozici jílový a minerální kámen'],
    [84, 'pro doplnění vápníku a ostatních minerálů v organické formě']];
  const PDFS = [['Andulka', 'andulka'], ['Žako', 'Zako'], ['Ara', 'ara'], ['Eklekt', 'eklekt'], ['Kakadu', 'KAKADU'], ['Kakadu růžový', 'KAKADU%20RUZOVY'], ['Malé druhy', 'uni%20mal%C3%BD']];
  const pdfLinks = () => PDFS.map(([n, f]) => `<a href="${SHOP}/user/documents/upload/Vyzivovy%20plan%20tahak%20na%20lednici%20${f}.pdf" target="_blank" rel="noopener"><i>PDF</i>${n}</a>`).join('')
    + `<a href="${SHOP}/user/documents/upload/__navody%20paputo%202022%2001.pdf" target="_blank" rel="noopener"><i>PDF</i>Obecné návody</a>`;
  const bundleBox = (p, alt, text) => `<a class="bundle ${alt ? 'alt' : ''}" href="#/produkt/${p.slug}"><div class="ph">${photo(p)}</div>
    <div><h3>${esc(p.title)}</h3><p>${esc(text)}</p><div class="row"><span class="price">${priceLabel(p)}</span><span class="addbtn${alt ? ' sec' : ''}">Zobrazit balíček</span></div></div></a>`;
  function services() {
    return `<div class="services">
      <a class="svc" href="#/produkt/individualni-konzultace"><span class="ic">💬</span><h3>Individuální konzultace</h3><p>Konzultace včetně vypracování doporučení pro vašeho papouška. 15–60 minut.</p>
        <div class="foot"><span class="price">${priceLabel(byId[255])}</span><span class="addbtn sec">Objednat</span></div></a>
      <a class="svc" href="#/produkt/${byId[330].slug}"><span class="ic">⚖️</span><h3>Směs na míru</h3><p>Dle specifických požadavků, od 10 kg. Cena dle telefonické konzultace.</p>
        <div class="foot"><span class="price">cena dohodou</span><span class="addbtn sec">Poptat</span></div></a>
      <a class="svc" href="#/produkt/${byId[336].slug}"><span class="ic">🎁</span><h3>Dárkový poukaz</h3><p>Se jménem papouška či majitele, hodnota dle výběru.</p>
        <div class="foot"><span class="price">${priceLabel(byId[336])}</span><span class="addbtn sec">Vybrat hodnotu</span></div></a></div>`;
  }
  function home() {
    const sch = STEPS.map(([id, why], i) => { const p = byId[id];
      return `<a class="sch" href="#/produkt/${p.slug}"><div class="ph"><span class="no">${i + 1}</span>${photo(p)}</div>
        <div><h3>${esc(p.title)}</h3><p class="why">${esc(why)}</p><span class="pr">${priceLabel(p)}</span></div></a>`; }).join('');
    const extras = [126, 63, 111, 114, 117, 123, 449, 120].map(id => card(byId[id])).join('');
    return `
    <section class="hero" style="padding:0"><div class="wrap">
      <div>
        <span class="eyebrow">Zakázková ruční výroba · celostní organická výživa</span>
        <h1>Zdravý papoušek začíná <em>v misce</em></h1>
        <p class="l">Ručně míchané zrniny podle druhu papouška a doplňky, které zrní a zelenina neobsahují. „Zdraví papoušků začíná prevencí.“</p>
        <div class="picker"><b>Pro koho nakupujete?</b><div class="row">
          ${TOP_SPECIES.map(s => `<a href="#/druh/${spSlug[s]}">${esc(prettySp(s).replace(' (mimo růžový a inka)', ''))}</a>`).join('')}
          <a class="more" href="#/druhy">Všech ${SPECIES.length} druhů →</a></div></div>
      </div>
      <figure class="proof"><div class="carousel" id="car">
        <img class="on" src="img/b/pred-a-po.jpg" alt="před a po"><img src="img/b/cerne-peri.jpg" alt="černé peří">
        <div class="dots"><button class="on" aria-label="Snímek 1"></button><button aria-label="Snímek 2"></button></div></div>
        <figcaption>Před a po – ukázky z úvodní stránky Paputo.cz</figcaption></figure>
    </div></section>

    <div class="trust"><div class="wrap">
      <div><i>✋</i><span><b>Ruční výroba</b>směsi míchané na zakázku</span></div>
      <div><i>🌱</i><span><b>BIO suroviny</b>a potravinářská kvalita</span></div>
      <div><i>💬</i><span><b>Osobní poradenství</b>Ing. Jana Jiroušková Kamberská</span></div>
      <div><i>🚚</i><span><b>Doprava od 150 Kč</b>osobní odběr po domluvě zdarma</span></div>
    </div></div>

    <section><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">Začínáte?</span><h2>První objednávka ve třech krocích</h2></div></div>
      <div class="start">
        <a href="#/druhy"><h3>Vyberte druh papouška</h3><p>Ukážeme vhodné zrniny (START, Speciál, Diet, Játra) i velikost balení.</p><span>Vybrat druh →</span></a>
        <a href="#schema"><h3>Doplňte základ zdraví</h3><p>Zrní a zelenina nestačí. Balíček č. 2–8 obsahuje vše ostatní ze schématu.</p><span>Co je ve schématu →</span></a>
        <a href="#/poradna"><h3>Stáhněte tahák na lednici</h3><p>Výživový plán pro váš druh zdarma v PDF. Nejasnosti vyřeší konzultace.</p><span>Do poradny →</span></a>
      </div></div></section>

    <section class="band" id="schema"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">Proč právě tyto produkty</span><h2>Schéma Paputo: základ zdraví v 8 krocích</h2>
        <p>Zrniny a zelenina neobsahují všechny základní živiny – proto je doplňujeme vitamínem D, vitamíny skupiny B, pylem a minerály.</p></div></div>
      <div class="scheme">${sch}</div>
      <div class="scheme-cta">
        ${bundleBox(byId[415], false, 'Produkty č. 2–8 v jednom balíčku. Stačí doplnit vhodné zrniny. Pro všechny druhy kromě andulek.')}
        ${bundleBox(byId[426], true, 'Zrniny START 1 kg, olej s D3, OrganiCa pro andulky, kvasnice a další.')}
      </div>
      <p class="source">Doporučení vychází z textu „NÁVODY Paputo“ na e-shopu. <a href="#/stranka/navody-paputo">Celý návod →</a></p>
    </div></section>

    <section><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">Řešení problémů</span><h2>Co vašeho papouška trápí?</h2></div><a href="#/poradna">Poradna →</a></div>
      <div class="probs">
        <a class="prob" href="${catLink('skubani-nutno-dodat-vsechny-ziviny-produkty-c-1-8-viz-navody')}"><span class="ic c1">🪶</span><span><h3>Škubání peří</h3><p>Nutno urychleně dodat všechny živiny – minimálně produkty č. 1–8.</p></span></a>
        <a class="prob" href="#/stranka/skubani--nervozita--agresivita--nechutenstvi--spatna-kvalita-peri"><span class="ic c5">😟</span><span><h3>Nervozita, agresivita</h3><p>Nechutenství a špatná kvalita peří – role stravy.</p></span></a>
        <a class="prob" href="${catLink('jatra-a-ocista-organizmu')}"><span class="ic c2">🌿</span><span><h3>Játra a detoxikace</h3><p>Směsi a byliny, které pomáhají čistit a regenerovat játra.</p></span></a>
        <a class="prob" href="${catLink('odcerveni')}"><span class="ic c3">🛡️</span><span><h3>Parazité</h3><p>Šetrná přírodní antiparazitika.</p></span></a>
        <a class="prob" href="#/clanek/vapnik-a-vitamin-d"><span class="ic c4">🦴</span><span><h3>Vápník a vitamín D</h3><p>Stres, černání peří, škubání, agrese.</p></span></a>
        <a class="prob" href="${catLink('zakladni-lekarnicka-nejen-pro-papousky')}"><span class="ic c6">🩹</span><span><h3>První pomoc</h3><p>Základní lékárnička nejen pro papoušky.</p></span></a>
      </div></div></section>

    <section style="padding-top:0"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">Rozšíření jídelníčku</span><h2>Další produkty ze schématu</h2></div><a href="${catLink('vitaminy-a-mineraly')}">Všechny doplňky →</a></div>
      <div class="grid">${extras}</div></div></section>

    <section class="band"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">Poradna</span><h2>Rady zdarma a osobní pomoc</h2></div><a href="#/poradna">Vše v poradně →</a></div>
      ${services()}
      <h3 style="margin:26px 0 10px">Výživový plán na lednici <span class="free">ZDARMA</span></h3>
      <div class="dl">${pdfLinks()}</div>
    </div></section>`;
  }
  function startCarousel() {
    const car = $('#car'); if (!car) return;
    const imgs = $$('img', car), dots = $$('.dots button', car); let i = 0;
    const go = n => { i = (n + imgs.length) % imgs.length; imgs.forEach((im, k) => im.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    dots.forEach((d, k) => d.onclick = () => go(k));
    clearInterval(window._car); window._car = setInterval(() => go(i + 1), 6000);
  }

  /* ---------- druhy ---------- */
  function speciesIndex() {
    const grp = (k, t, d) => `<div class="sgroup"><h3>${t}</h3><p>${d}</p><div class="row">${SIZE[k].map(s => `<a class="chip" href="#/druh/${spSlug[s]}">${esc(prettySp(s))}</a>`).join('')}</div></div>`;
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / Podle druhu</div>
      <h1>Krmivo podle druhu papouška</h1><p class="lead">Zrniny Paputo se míchají pro ${SPECIES.length} druhů. Vyberte svého papouška a ukážeme vhodné směsi a doplňky.</p>
      <div class="species-groups">${grp('male', 'Malí papoušci', 'andulky, korely, agapornisové…')}${grp('stredni', 'Střední papoušci', 'pyrury, rosely, alexandři…')}${grp('velke', 'Velcí papoušci', 'žako, amazoňani, ary, kakaduové…')}</div>
      <p class="note">Rozdělení podle velikosti je orientační (pro přehlednost návrhu) – ke kontrole majitelkou e-shopu.</p></div>`;
  }
  function speciesPage(slug) {
    const s = spBySlug[slug]; if (!s) return notFound();
    const vs = ZR.variants.filter(v => v.parts[0] === s);
    const types = [...new Set(vs.map(v => v.parts[2]))];
    const size = sizeOf(s), andulka = /andulka/i.test(s);
    const mixes = types.map(t => {
      const tv = vs.filter(v => v.parts[2] === t).sort((a, b) => a.price - b.price);
      return `<a class="mix" href="#/produkt/${ZR.slug}?druh=${encodeURIComponent(s)}&typ=${encodeURIComponent(t)}"><span><b>${esc(t)}</b><small>${tv.map(v => esc(v.parts[1].replace(/\s*\(.*\)/, '')) + ' ' + kc(v.price)).join(' · ')}</small></span>
        <span class="price">od ${kc(tv[0].price)}</span><span class="addbtn">Vybrat</span></a>`;
    }).join('');
    const rec = [];
    rec.push(andulka ? [426, 'balíček základních produktů pro zdraví andulky'] : [415, 'produkty č. 2–8 – stačí doplnit zrniny (vyjma andulek)']);
    if (andulka) rec.push([120, 'zdroj organického vápníku a jódu pro andulky']);
    if (AUSTRAL.includes(s)) rec.push([153, 'nutná pro zdraví andulek, ale i ostatních australských']);
    if (size === 'male') rec.push([342, 'jemnější jílová cihla pro menší papoušky'], [111, 'k namáčení/klíčení – hlavně pro malé druhy'], [231, 'mix hmyzu pro malé druhy']);
    else rec.push([102, 'jílový minerální kámen – detoxikace'], [123, 'MIX NAMÁČENÍ pro větší druhy'], [225, 'vhodné pro střední a větší papoušky']);
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / <a href="#/druhy">Podle druhu</a> / ${esc(prettySp(s))}</div>
      <div class="sp-hero">
        <div><span class="eyebrow">Krmivo pro</span><h1>${esc(prettySp(s))}</h1>
          <p class="muted">Zrniny jsou ručně míchány a baleny na základě druhu papouška. Začněte směsí <b>START</b> – je určena pro snadný přechod na nové zrniny.</p>
          <div class="mixes">${mixes}</div>
          <p class="note">Typy směsí: <b>START</b> – vyšší podíl větších zrnin, pro přechod. <b>SPECIÁL / DIET</b> – více drobných semen. <b>JÁTRA</b> – semena, která pomáhají čistit a regenerovat játra. (z popisu kategorie Krmivo/Zrniny)</p></div>
        <div><h2 style="font-size:1.3rem">Doporučený základ</h2>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">${rec.slice(0, 4).map(([id]) => card(byId[id])).join('')}</div>
          <p class="note">${rec.slice(0, 4).map(([id, why]) => `<b>${esc(byId[id].title)}:</b> ${esc(why)}`).join('<br>')}<br><i>Zdroj: názvy a popisy produktů / NÁVODY Paputo.</i></p></div>
      </div>
      <div class="sec-head" style="margin-top:34px"><h2>Výživový plán na lednici</h2></div><div class="dl">${pdfLinks()}</div></div>`;
  }

  /* ---------- kategorie ---------- */
  function category(slug, sort = 'rec', stock = false) {
    const c = C[slug]; if (!c) return notFound();
    const parent = c.parent ? C[c.parent] : null;
    const all = c.products.map(s => P[s]).filter(Boolean);
    const guides = all.filter(isGuide);
    let list = all.filter(sellable);
    if (stock) list = list.filter(p => stockOf(p).t === 'Skladem');
    const mp = p => Math.min(...prices(p));
    if (sort === 'cheap') list.sort((a, b) => mp(a) - mp(b));
    if (sort === 'exp') list.sort((a, b) => mp(b) - mp(a));
    if (sort === 'abc') list.sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    const sibs = parent ? kids(parent.slug) : kids(slug);
    return `<div class="wrap">
      <div class="crumbs"><a href="#/">Úvod</a>${parent ? ` / <a href="${catLink(parent.slug)}">${esc(cname(parent))}</a>` : ''} / ${esc(cname(c))}</div>
      <h1>${esc(cname(c))}</h1>
      ${sibs.length ? `<div class="chips">${sibs.map(k => `<a class="chip ${k.slug === slug ? 'on' : ''}" href="${catLink(k.slug)}">${esc(cname(k))}</a>`).join('')}</div>` : ''}
      ${c.perex ? `<div class="perex rich">${c.perex}</div>` : ''}
      ${guides.length ? `<div class="guides" style="margin-bottom:18px">${guides.map(g => guideCard('#/produkt/' + g.slug, 'Návod zdarma', g.title)).join('')}</div>` : ''}
      <div class="toolbar"><span class="muted"><b>${list.length}</b> produktů</span>
        <span style="display:flex;gap:16px;flex-wrap:wrap"><label><input type="checkbox" id="stock" ${stock ? 'checked' : ''}> Jen skladem</label>
        <label>Řadit <select id="sort">${[['rec', 'Doporučujeme'], ['cheap', 'Nejlevnější'], ['exp', 'Nejdražší'], ['abc', 'Abecedně']].map(([v, t]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></span></div>
      <div class="grid">${list.map(card).join('')}</div></div>`;
  }

  /* ---------- detail ---------- */
  function product(slug, qs) {
    const p = P[slug]; if (!p) return notFound();
    const ENTRY = ['prvni-objednavka-zakladni-slozky-vyzivy', 'andulka-prvotni-objednavka', 'vsechny-druhy-vyjma-andulek'];
    const cat = C[p.cats.find(s => !ENTRY.includes(s)) || p.cats[0]];
    const multi = (p.paramNames || []).length > 1;
    let v0 = firstV(p);
    if (multi && qs) {
      const want = [qs.get('druh'), null, qs.get('typ')];
      v0 = p.variants.find(v => (!want[0] || v.parts[0] === want[0]) && v.parts[1] === '1 kg' && (!want[2] || v.parts[2] === want[2])) || v0;
    }
    const step = STEPS.find(([id]) => id === p.id);
    let vars = '';
    if (multi) vars = `<div class="selgrid">${p.paramNames.map((n, k) => `<label><span class="vlabel">${esc(n)}</span><select data-k="${k}">${p.paramValues[k].map(v => `<option ${v === v0.parts[k] ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`).join('')}</div>`;
    else if (p.variants.length) vars = `<span class="vlabel">${esc(p.variantLabel || 'Varianta')}</span><div class="vars">${p.variants.map((v, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${esc(v.label)}<small>${kc(v.price)}</small></button>`).join('')}</div>`;
    const related = (cat ? cat.products : []).filter(s => s !== slug).map(s => P[s]).filter(x => x && sellable(x)).slice(0, 4);
    const buyLabel = SERVICE_IDS.has(p.id) ? 'Objednat na paputo.cz' : 'Do košíku na paputo.cz';
    return `<div class="wrap">
      <div class="crumbs"><a href="#/">Úvod</a>${cat ? ` / <a href="${catLink(cat.slug)}">${esc(cname(cat))}</a>` : ''} / ${esc(p.title)}</div>
      <div class="pd">
        <div class="gal"><div class="main">${photo(p)}</div></div>
        <div>
          ${isGuide(p) ? '<span class="free">NÁVOD ZDARMA</span>' : p.num ? `<span class="eyebrow">Schéma Paputo · č. ${esc(p.num)}</span>` : ''}
          <h1>${esc(p.title)}</h1>
          ${p.sub ? `<p class="subt">${esc(p.sub)}</p>` : ''}
          <div class="orig"><b>Celý název v e-shopu:</b> ${esc(p.name)}</div>
          ${step ? `<p class="note" style="margin-top:0"><b>Proč ve schématu:</b> ${esc(step[1])}.</p>` : ''}
          ${isGuide(p) ? '' : `<div class="buy">${vars}
            <div class="big" id="vp">${v0 ? kc(v0.price) : esc(priceLabel(p))}</div>
            <div class="meta"><span id="va">${v0 ? `<span class="stock" style="color:${esc(v0.availColor)};margin:0">${esc(v0.avail)}</span>` : stockHtml(p)}</span>
              <span>Kód: <b id="vc">${esc(v0 ? v0.code : p.code)}</b></span>${p.unitPrice ? `<span>${esc(p.unitPrice)}</span>` : ''}</div>
            <a class="btn btn-accent btn-block" href="${p.url}" target="_blank" rel="noopener">🛒 ${buyLabel}</a></div>`}
          ${p.short ? `<div class="short rich">${p.short}</div>` : ''}
          ${p.params.length ? `<table class="rich">${p.params.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table>` : ''}
        </div></div>
      ${p.desc ? `<div class="desc rich"><h2>Popis</h2>${p.desc}</div>` : ''}
      ${related.length ? `<div class="sec-head" style="margin-top:40px"><h2>Ze stejné kategorie</h2></div><div class="grid">${related.map(card).join('')}</div>` : ''}
      ${isGuide(p) ? '' : `<div class="sticky-buy"><span class="price" id="sp">${v0 ? kc(v0.price) : priceLabel(p)}</span><a class="addbtn" href="${p.url}" target="_blank" rel="noopener">🛒 Do košíku</a></div>`}
    </div>`;
  }
  function bindProduct(slug) {
    const p = P[slug]; if (!p) return;
    const show = v => {
      if (!v) { $('#vp').textContent = '—'; $('#vc').textContent = '—'; $('#va').innerHTML = '<span class="stock" style="color:#C9502F;margin:0">Tato kombinace není k dispozici</span>'; return; }
      $('#vp').textContent = kc(v.price); $('#vc').textContent = v.code; if ($('#sp')) $('#sp').textContent = kc(v.price);
      $('#va').innerHTML = `<span class="stock" style="color:${esc(v.availColor)};margin:0">${esc(v.avail)}</span>`;
    };
    $$('.vars button').forEach(b => b.onclick = () => { $$('.vars button').forEach(x => x.classList.toggle('on', x === b)); show(p.variants[+b.dataset.i]); });
    const sels = $$('.selgrid select');
    sels.forEach(sel => sel.onchange = () => { const w = sels.map(x => x.value); show(p.variants.find(x => x.parts.every((val, k) => val === w[k]))); });
  }

  /* ---------- poradna ---------- */
  function poradna() {
    const g = D.products.filter(isGuide);
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / Poradna</div>
      <h1>Poradna Paputo</h1><p class="lead">Návody, výživové plány a články zdarma. Když si nevíte rady, objednejte si osobní konzultaci.</p>
      <div class="sec-head" style="margin-top:20px"><h2>Osobní pomoc a dárky</h2></div>${services()}
      <div class="sec-head" style="margin-top:36px"><h2>Návody <span class="free">ZDARMA</span></h2></div>
      <div class="guides">${['jak-nakupovat', 'navody-paputo', 'navody-a-prakticke-informace', 'skubani--nervozita--agresivita--nechutenstvi--spatna-kvalita-peri'].map(s => guideCard('#/stranka/' + s, 'Návod', PG[s].name)).join('')}
        ${g.map(p => guideCard('#/produkt/' + p.slug, 'Návod', p.title)).join('')}</div>
      <div class="sec-head" style="margin-top:36px"><h2>Výživový plán na lednici <span class="free">PDF</span></h2></div><div class="dl">${pdfLinks()}</div>
      <div class="sec-head" style="margin-top:36px"><h2>Články</h2></div>
      <div class="guides">${D.articles.map(a => guideCard('#/clanek/' + a.slug, 'Článek · ' + a.date, a.name)).join('')}</div></div>`;
  }
  function results(q) {
    const r = search(q);
    const prods = r.filter(x => x.kind === 'Produkty').map(x => P[x.href.split('/').pop()]);
    const other = r.filter(x => x.kind !== 'Produkty');
    sIn.value = q;
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / Hledání</div>
      <h1>Výsledky pro „${esc(q)}“</h1>
      ${!r.length ? `<div class="empty"><h2>Nic jsme nenašli</h2><p>Zkuste např. ${POPULAR.map(x => `<a href="#/hledat/${encodeURIComponent(x)}">${esc(x)}</a>`).join(', ')}.</p></div>` : ''}
      ${other.length ? `<div class="chips">${other.map(x => `<a class="chip" href="${x.href}">${x.kind === 'Kategorie' ? '📂' : x.kind === 'Druh papouška' ? '🦜' : '📖'} ${esc(x.title)}</a>`).join('')}</div>` : ''}
      ${prods.length ? `<p class="muted"><b>${prods.length}</b> produktů</p><div class="grid">${prods.map(card).join('')}</div>` : ''}</div>`;
  }
  function page(slug) {
    const p = PG[slug] || AR[slug]; if (!p) return notFound();
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / <a href="#/poradna">Poradna</a> / ${esc(p.name)}</div>
      <div class="page rich">${p.date ? `<span class="eyebrow">${esc(p.date)}</span>` : '<span class="free">ZDARMA</span>'}<h1>${esc(p.name)}</h1>${p.html}
      ${slug === 'harmonogramy' || slug === 'navody-paputo' ? `<h2>Výživový plán na lednici</h2><div class="dl">${pdfLinks()}</div>` : ''}</div></div>`;
  }
  const notFound = () => `<div class="wrap"><div class="empty" style="margin-top:30px"><h2>Stránka nenalezena</h2><p><a href="#/">Zpět na úvod</a></p></div></div>`;

  /* ---------- router ---------- */
  function route() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (raw === 'schema' || raw === '#schema') { location.hash = '#/'; setTimeout(() => $('#schema') && $('#schema').scrollIntoView(), 50); return; }
    const [path, query] = raw.split('?');
    const [kind, ...rest] = path.split('/'); const arg = rest.join('/');
    const qs = query ? new URLSearchParams(query) : null;
    let html, after = () => {};
    sBox.classList.remove('open'); $('#menu').classList.remove('open');
    if (!kind) { html = home(); after = startCarousel; }
    else if (kind === 'kategorie') {
      html = category(arg);
      after = () => { const bind = () => { $('#sort').onchange = upd; $('#stock').onchange = upd; }; const upd = () => { app.innerHTML = category(arg, $('#sort').value, $('#stock').checked); bind(); }; bind(); };
    }
    else if (kind === 'produkt') { html = product(arg, qs); after = () => bindProduct(arg); }
    else if (kind === 'druhy') html = speciesIndex();
    else if (kind === 'druh') html = speciesPage(arg);
    else if (kind === 'poradna' || kind === 'navody') html = poradna();
    else if (kind === 'hledat') html = results(arg);
    else if (kind === 'stranka' || kind === 'clanek') html = page(arg);
    else html = notFound();
    if (kind !== 'hledat') sIn.value = '';
    app.innerHTML = html; after(); window.scrollTo(0, 0);
    $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.k === (kind || 'home')));
    const t = $('h1', app); document.title = (kind && t ? t.textContent + ' – ' : '') + 'Paputo.cz (návrh 2)';
  }
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#schema"]'); if (a) { e.preventDefault(); const s = $('#schema'); if (s) s.scrollIntoView({ behavior: 'smooth' }); else { location.hash = '#/'; setTimeout(() => $('#schema').scrollIntoView(), 60); } } });
  window.addEventListener('hashchange', route);
  route();
})();
