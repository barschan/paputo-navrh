/* Paputo – návrh e-shopu. Data: data.js (window.PAPUTO), stažená z paputo.cz. */
(function () {
  const D = window.PAPUTO;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');
  const SHOP = 'https://www.paputo.cz';

  const P = {}; D.products.forEach(p => P[p.slug] = p);
  const C = {}; D.cats.forEach(c => C[c.slug] = c);
  const byId = {}; D.products.forEach(p => byId[p.id] = p);
  const PG = {}; D.pages.forEach(p => PG[p.slug] = p);
  const AR = {}; D.articles.forEach(a => AR[a.slug] = a);
  const topCats = D.cats.filter(c => !c.parent);
  const kids = slug => D.cats.filter(c => c.parent === slug);

  const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const kc = n => n == null ? '' : new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(n) + ' Kč';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  // Názvy kategorií – jasné a jednotné (původní název je v perexu / drobečkové navigaci)
  const CAT_NAME = {
    'prvni-objednavka-zakladni-slozky-vyzivy': 'První objednávka',
    'andulka-prvotni-objednavka': 'Andulka',
    'vsechny-druhy-vyjma-andulek': 'Ostatní papoušci',
    'zrniny': 'Krmivo a zrniny',
    'zakladni-denni-smesi-zrnin-2': 'Základní směsi (START)',
    'ostatni-smesi': 'Pokračovací směsi Speciál',
    'smesi-pro-naklicovani-a-maceni': 'Klíčení a máčení',
    'jatra-a-ocista-organizmu': 'Játra a detoxikace',
    'zdrave-mlsani-pamlsky': 'Pamlsky',
    'suseny-hmyz-a-drobni-obratlovci': 'Hmyz',
    'skubani-nutno-dodat-vsechny-ziviny-produkty-c-1-8-viz-navody': 'Škubání peří',
    'vitaminy-a-mineraly': 'Vitamíny a minerály',
    'pyl-byliny': 'Pyl a byliny',
    'oleje--s-bez-vit-d3': 'Oleje s/bez vitamínu D3',
    'mineraly': 'Minerály',
    'konzultace-poradenstvi': 'Poradenství a dárky',
    'hygiena-a-domacnost': 'Hygiena a první pomoc',
    'odcerveni': 'Antiparazitika',
    'zakladni-lekarnicka-nejen-pro-papousky': 'Základní lékárnička',
    'pro-psy': 'Pro psy'
  };
  const cname = c => CAT_NAME[c.slug] || c.name;

  const avail = (txt, color) => txt ? `<span class="av" style="color:${esc(color || '#3E8E5E')}">● ${esc(txt)}</span>` : '';
  const pAvail = p => p.variants.length ? avail(p.variants[0].avail, p.variants[0].availColor) : avail(p.avail, p.availColor);
  const priceLabel = p => {
    if (p.guide) return 'zdarma k přečtení';
    if (p.variants.length) {
      const ps = p.variants.map(v => v.price).filter(x => x != null);
      const mn = Math.min(...ps), mx = Math.max(...ps);
      return (mn === mx ? '' : 'od ') + kc(mn);
    }
    return p.priceText || kc(p.price);
  };
  const img = (p, cls = '') => p.images[0]
    ? `<img src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy" class="${cls}">`
    : `<div class="noimg">🦜</div>`;
  const numBadge = p => p.num ? `<span class="n">${esc(p.num)}</span>` : '';

  const card = p => `
    <a class="card" href="#/produkt/${p.slug}">
      <div class="ph">${numBadge(p)}${p.guide ? '<span class="tag">Návod</span>' : ''}${img(p)}</div>
      <div class="tx"><h3>${esc(p.title)}</h3><div class="s">${esc(p.sub)}</div>
        <div class="bot"><span class="price">${priceLabel(p)}</span>${p.guide ? '' : pAvail(p)}</div></div>
    </a>`;

  /* ---------------- VYHLEDÁVÁNÍ ---------------- */
  const ALIAS = {
    vitamin: ['vit'], vit: ['vitamin'], d3: ['vit d', 'vitamin d'], vapnik: ['organica', 'calcium', 'vapn'],
    skubani: ['skube', 'peri'], parazit: ['odcerv', 'papendo', 'antiparazit'], cerv: ['parazit', 'odcerv'],
    olej: ['oleje'], semena: ['zrnin', 'semen'], zrni: ['zrnin'], krmeni: ['krmivo', 'zrnin'],
    zako: ['zako'], ara: ['ara '], jatra: ['jater', 'jatra'], pamlsek: ['pamlsk', 'mlsani'],
    hmyz: ['cervi', 'hmyz'], vitaminy: ['vitamin'], mineraly: ['mineral'], pyl: ['pyl'],
    klice: ['klic', 'namac'], namaceni: ['namac', 'klic'], kvasnice: ['kvasnic']
  };
  const index = [];
  D.products.forEach(p => index.push({
    kind: 'Produkty', href: '#/produkt/' + p.slug, title: p.title, sub: p.sub, price: priceLabel(p), img: p.images[0],
    f: [[norm(p.title + ' ' + p.num), 12], [norm(p.name), 6], [norm(p.sub), 5],
        [norm(p.variants.map(v => v.label + ' ' + v.code).join(' ') + ' ' + (p.code || '')), 4],
        [norm(p.cats.map(s => C[s] ? cname(C[s]) : '').join(' ')), 3], [norm(strip(p.short) + ' ' + strip(p.desc)), 1]]
  }));
  D.cats.forEach(c => index.push({
    kind: 'Kategorie', href: '#/kategorie/' + c.slug, title: cname(c), sub: c.products.length + ' položek', img: c.image,
    f: [[norm(cname(c) + ' ' + c.name), 10], [norm(strip(c.perex)), 1]]
  }));
  D.pages.concat(D.articles).forEach(a => index.push({
    kind: 'Návody a články', href: (AR[a.slug] ? '#/clanek/' : '#/stranka/') + a.slug, title: a.name, sub: a.date || 'informace',
    f: [[norm(a.name), 8], [norm(strip(a.html)), 1]]
  }));

  function tokenHit(text, t) {
    if (text.includes(t)) return true;
    if (t.length >= 6 && text.includes(t.slice(0, -2))) return true; // české koncovky: papousky → papous
    return (ALIAS[t] || []).some(a => text.includes(a));
  }
  function search(q) {
    const toks = norm(q).split(/[^a-z0-9]+/).filter(t => t.length > 1 || /\d/.test(t));
    if (!toks.length) return [];
    const res = [];
    for (const it of index) {
      const all = it.f.map(x => x[0]).join(' ');
      if (!toks.every(t => tokenHit(all, t))) continue;
      let sc = 0;
      for (const t of toks) for (const [txt, w] of it.f) if (tokenHit(txt, t)) sc += w * (txt.startsWith(t) ? 2 : 1);
      if (it.kind === 'Kategorie') sc += 3;
      res.push({ it, sc });
    }
    return res.sort((a, b) => b.sc - a.sc).map(r => r.it);
  }
  function hl(text, q) {
    let out = esc(text);
    norm(q).split(/[^a-z0-9]+/).filter(t => t.length > 1).forEach(t => {
      const n = norm(out); let i = n.indexOf(t);
      if (i >= 0) out = out.slice(0, i) + '<mark>' + out.slice(i, i + t.length) + '</mark>' + out.slice(i + t.length);
    });
    return out;
  }

  const sIn = $('#q'), sBox = $('#suggest');
  let act = -1;
  function renderSuggest() {
    const q = sIn.value.trim();
    if (q.length < 2) { sBox.classList.remove('open'); return; }
    const r = search(q);
    act = -1;
    if (!r.length) {
      sBox.innerHTML = `<div style="padding:16px">Nic jsme nenašli pro „${esc(q)}“. Zkuste např. <b>olej</b>, <b>žako</b>, <b>vápník</b> nebo <b>škubání</b>.</div>`;
    } else {
      let html = '', last = '';
      r.slice(0, 8).forEach(it => {
        if (it.kind !== last) { html += `<div class="kind">${it.kind}</div>`; last = it.kind; }
        html += `<a href="${it.href}">${it.img ? `<img src="${it.img}" alt="">` : '<span class="ph">📄</span>'}
          <span><span class="t">${hl(it.title, q)}</span><br><span class="s">${esc(it.sub || '')}</span></span>
          ${it.price ? `<span class="pr">${it.price}</span>` : ''}</a>`;
      });
      html += `<a class="all" href="#/hledat/${encodeURIComponent(q)}">Zobrazit všech ${r.length} výsledků →</a>`;
      sBox.innerHTML = html;
    }
    sBox.classList.add('open');
  }
  sIn.addEventListener('input', renderSuggest);
  sIn.addEventListener('focus', renderSuggest);
  sIn.addEventListener('keydown', e => {
    const links = [...sBox.querySelectorAll('a')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      act = (act + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle('act', i === act));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      location.hash = act >= 0 && links[act] ? links[act].getAttribute('href') : '#/hledat/' + encodeURIComponent(sIn.value.trim());
      sBox.classList.remove('open'); sIn.blur();
    } else if (e.key === 'Escape') sBox.classList.remove('open');
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sBox.classList.remove('open'); });

  /* ---------------- MENU ---------------- */
  $('#menu').innerHTML = `<ul>
    <li class="hl"><a href="#/stranka/jak-nakupovat">⭐ Jak vybrat krmivo</a></li>
    ${topCats.map(c => `<li><a href="#/kategorie/${c.slug}">${esc(cname(c))}</a>
      ${kids(c.slug).length ? `<ul class="sub">${kids(c.slug).map(k => `<li><a href="#/kategorie/${k.slug}">${esc(cname(k))}</a></li>`).join('')}</ul>` : ''}</li>`).join('')}
    <li><a href="#/navody">Návody</a></li>
    <li><a href="#/stranka/kontakty">Kontakt</a></li></ul>`;
  $('#burger').onclick = () => $('#menu').classList.toggle('open');

  /* ---------------- STRÁNKY ---------------- */
  const STEPS = [446, 87, 93, 102, 72, 78, 108, 84];
  const STEP_TXT = ['vyberte dle druhu papouška – zpočátku START', 'když papoušek není na přímém slunci', 'pyl nebo Multipap – vitamíny z květů',
    'jílový kámen – volně k dispozici', 'vitamíny skupiny B', 'Humac nebo bioaktivní uhlí', 'minerální kámen – volně k dispozici', 'vápník v organické formě'];
  const PDFS = [['Andulka', 'andulka'], ['Žako', 'Zako'], ['Ara', 'ara'], ['Eklekt', 'eklekt'], ['Kakadu', 'KAKADU'],
    ['Kakadu růžový', 'KAKADU%20RUZOVY'], ['Malé druhy', 'uni%20mal%C3%BD']];
  const pdfLinks = () => PDFS.map(([n, f]) => `<a href="${SHOP}/user/documents/upload/Vyzivovy%20plan%20tahak%20na%20lednici%20${f}.pdf" target="_blank" rel="noopener"><i>PDF</i>${n}</a>`).join('')
    + `<a href="${SHOP}/user/documents/upload/__navody%20paputo%202022%2001.pdf" target="_blank" rel="noopener"><i>PDF</i>Obecné návody</a>`;

  function home() {
    const steps = STEPS.map((id, i) => {
      const p = byId[id];
      return `<a class="step" href="#/produkt/${p.slug}"><div class="ph"><span class="n">${i + 1}</span>${img(p)}</div>
        <div class="tx"><h3>${esc(p.title)}</h3><p>${STEP_TXT[i]}</p></div></a>`;
    }).join('');
    const balicek = byId[415], andBal = byId[426];
    return `
    <section class="hero"><div class="wrap">
      <div>
        <span class="eyebrow" style="color:var(--mango)">ZRNÍ, které VONÍ · celostní zaměření na papoušky</span>
        <h1>Vítejte na Paputo.cz – <em>zakázková RUČNÍ výroba</em> krmiv a doplňků</h1>
        <p>„Lékař léčí, příroda uzdravuje.“ (Hippokrates)<br>Zdraví papoušků začíná prevencí. Důvěřuji pouze produktům od nejlepšího lékaře – přírody…</p>
        <div class="cta">
          <a class="btn btn-mango" href="#/kategorie/prvni-objednavka-zakladni-slozky-vyzivy">🦜 První objednávka</a>
          <a class="btn btn-ghost" href="#/stranka/jak-nakupovat">Jak vybrat krmivo</a>
        </div>
      </div>
      <div class="carousel" id="car">
        <img class="on" src="img/b/pred-a-po.jpg" alt="před a po">
        <img src="img/b/cerne-peri.jpg" alt="černé peří">
        <button class="arr l" aria-label="Předchozí">‹</button><button class="arr r" aria-label="Další">›</button>
        <div class="dots"><button class="on" aria-label="1"></button><button aria-label="2"></button></div>
      </div>
    </div></section>

    <div class="wrap"><div class="tiles">
      <a class="tile" href="#/stranka/jak-nakupovat"><img src="img/b/jak-vybirat.jpg" alt="jak vybírat"><div><b>jak vybírat</b><span>Jaké vybrat produkty …</span></div></a>
      <a class="tile" href="#/kategorie/prvni-objednavka-zakladni-slozky-vyzivy"><img src="img/b/logo-paputo.png" alt="- produkty č. 1-8"><div><b>první objednávka</b><span>Základ jídelníčku</span></div></a>
      <a class="tile" href="#/kategorie/zakladni-denni-smesi-zrnin-2"><img src="img/b/eu-bio.png" alt="Suroviny v BIO kvalitě"><div><b>BIO suroviny</b><span>Stále více surovin v BIO kvalitě a ještě více v potravinářské kvalitě :-)</span></div></a>
    </div></div>

    <section><div class="wrap center">
      <span class="eyebrow">Krok 1</span>
      <h2>Jakého máte papouška?</h2>
      <p class="lead">Andulky mají vlastní základní balíček. Pro ostatní druhy vyberete zrniny podle druhu.</p>
      <div class="species">
        <a class="sp" href="#/kategorie/andulka-prvotni-objednavka"><img src="${C['andulka-prvotni-objednavka'].image}" alt=""><div><b>Andulka</b><small>${C['andulka-prvotni-objednavka'].products.length} produktů</small></div></a>
        <a class="sp" href="#/kategorie/vsechny-druhy-vyjma-andulek"><img src="${C['vsechny-druhy-vyjma-andulek'].image}" alt=""><div><b>Ostatní papoušci</b><small>žako, ara, amazoňan, kakadu, korela…</small></div></a>
      </div>
    </div></section>

    <section class="band"><div class="wrap">
      <div class="center"><span class="eyebrow">Krok 2 · schéma Paputo</span>
        <h2>JEN ZRNÍ a ZELENINA NESTAČÍ</h2>
        <p class="lead">Zrniny a zelenina neobsahují všechny základní živiny, proto je potřeba je dodat v podobě například vit D (olej s organickým vit D3), vit skupiny B (sušené piv. kvasnice), pylu či minerálů jako je vápník a hořčík (mletého korálu/ řas nebo vaječných skořápek (organicapap)).</p></div>
      <div class="steps">${steps}</div>
      <div class="grid" style="grid-template-columns:1fr 1fr;max-width:620px;margin:26px auto 0">${card(balicek)}${card(andBal)}</div>
    </div></section>

    <section><div class="wrap">
      <div class="center"><span class="eyebrow">Řešíte konkrétní potíž?</span><h2>Vyberte, co vás trápí</h2></div>
      <div class="probs">
        <a class="prob c1" href="#/kategorie/skubani-nutno-dodat-vsechny-ziviny-produkty-c-1-8-viz-navody"><div class="ic">🪶</div><h3>Škubání peří</h3><p>nutno dodat všechny živiny – produkty č. 1–8</p><span>Zobrazit →</span></a>
        <a class="prob c2" href="#/kategorie/jatra-a-ocista-organizmu"><div class="ic">🌿</div><h3>Játra a detoxikace</h3><p>směsi a byliny pro očistu organismu</p><span>Zobrazit →</span></a>
        <a class="prob c3" href="#/kategorie/odcerveni"><div class="ic">🛡️</div><h3>Parazité</h3><p>šetrná přírodní antiparazitika</p><span>Zobrazit →</span></a>
        <a class="prob c4" href="#/clanek/vapnik-a-vitamin-d"><div class="ic">🦴</div><h3>Vápník a vitamín D</h3><p>článek – stres, černání peří, škubání</p><span>Přečíst →</span></a>
        <a class="prob c5" href="#/stranka/skubani--nervozita--agresivita--nechutenstvi--spatna-kvalita-peri"><div class="ic">😟</div><h3>Nervozita a agresivita</h3><p>nechutenství, špatná kvalita peří</p><span>Přečíst →</span></a>
        <a class="prob c6" href="#/kategorie/zakladni-lekarnicka-nejen-pro-papousky"><div class="ic">🩹</div><h3>První pomoc</h3><p>základní lékárnička nejen pro papoušky</p><span>Zobrazit →</span></a>
      </div>
    </div></section>

    <section class="band"><div class="wrap">
      <div class="center"><span class="eyebrow">Celý sortiment</span><h2>Kategorie</h2></div>
      <div class="cats">${topCats.map(c => `<a class="cat" href="#/kategorie/${c.slug}"><b>${esc(cname(c))}</b>
        <small>${c.products.length} položek${kids(c.slug).length ? ' · ' + kids(c.slug).map(k => esc(cname(k))).join(', ') : ''}</small></a>`).join('')}</div>
    </div></section>

    <section><div class="wrap">
      <div class="center"><span class="eyebrow">Zdarma ke stažení</span><h2>Výživový plán – tahák na lednici</h2>
        <p class="lead">Příklady harmonogramu krmení dle schématu Paputo. Klikněte na svůj druh papouška.</p></div>
      <div class="dl">${pdfLinks()}</div>
    </div></section>

    <section style="padding-top:0"><div class="wrap">
      <div class="center"><span class="eyebrow">Poradna</span><h2>Články a informace</h2></div>
      <div class="posts">${D.articles.map(a => `<a class="post" href="#/clanek/${a.slug}"><small>${esc(a.date)}</small><h3>${esc(a.name)}</h3></a>`).join('')}</div>
    </div></section>

    <section style="padding-top:0"><div class="wrap"><div class="consult">
      <div><h2>Nevíte si rady?</h2><p>Individuální konzultace včetně vypracování doporučení.</p></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-teal" href="#/produkt/individualni-konzultace">Individuální konzultace</a>
      <a class="btn btn-ghost" href="tel:+420603459399">☎ 603 459 399</a></div>
    </div></div></section>`;
  }

  function startCarousel() {
    const car = $('#car'); if (!car) return;
    const imgs = car.querySelectorAll('img'), dots = car.querySelectorAll('.dots button');
    let i = 0;
    const go = n => { i = (n + imgs.length) % imgs.length; imgs.forEach((im, k) => im.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    car.querySelector('.l').onclick = () => go(i - 1);
    car.querySelector('.r').onclick = () => go(i + 1);
    dots.forEach((d, k) => d.onclick = () => go(k));
    clearInterval(window._car); window._car = setInterval(() => go(i + 1), 6000);
  }

  function category(slug, sort = 'rec', stock = false) {
    const c = C[slug]; if (!c) return notFound();
    const parent = c.parent ? C[c.parent] : null;
    const subs = kids(slug);
    let list = c.products.map(s => P[s]).filter(Boolean);
    if (stock) list = list.filter(p => (p.variants[0] ? p.variants[0].avail : p.avail) === 'Skladem' || p.guide);
    if (sort === 'cheap') list.sort((a, b) => a.minPrice - b.minPrice);
    if (sort === 'exp') list.sort((a, b) => b.minPrice - a.minPrice);
    if (sort === 'abc') list.sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    return `<div class="wrap">
      <div class="crumbs"><a href="#/">Úvod</a>${parent ? ` / <a href="#/kategorie/${parent.slug}">${esc(cname(parent))}</a>` : ''} / ${esc(cname(c))}</div>
      <h1 style="margin-top:14px">${esc(cname(c))}</h1>
      ${subs.length ? `<div class="chips">${subs.map(k => `<a class="chip" href="#/kategorie/${k.slug}">${esc(cname(k))}</a>`).join('')}</div>` : ''}
      ${parent ? `<div class="chips">${kids(parent.slug).map(k => `<a class="chip ${k.slug === slug ? 'on' : ''}" href="#/kategorie/${k.slug}">${esc(cname(k))}</a>`).join('')}</div>` : ''}
      ${c.perex ? `<div class="page rich" style="margin:10px 0 24px">${c.perex}</div>` : ''}
      <div class="toolbar"><span class="muted"><b>${list.length}</b> položek</span>
        <span style="display:flex;gap:16px;flex-wrap:wrap">
        <label><input type="checkbox" id="stock" ${stock ? 'checked' : ''}> jen skladem</label>
        <label>Řadit: <select id="sort">
          <option value="rec" ${sort === 'rec' ? 'selected' : ''}>Doporučujeme</option>
          <option value="cheap" ${sort === 'cheap' ? 'selected' : ''}>Nejlevnější</option>
          <option value="exp" ${sort === 'exp' ? 'selected' : ''}>Nejdražší</option>
          <option value="abc" ${sort === 'abc' ? 'selected' : ''}>Abecedně</option></select></label></span></div>
      <div class="grid">${list.map(card).join('')}</div></div>`;
  }

  function product(slug) {
    const p = P[slug]; if (!p) return notFound();
    const cat = C[p.cats[0]];
    const v0 = p.variants[0];
    const multi = (p.paramNames || []).length > 1;
    const vars = multi ? `<div class="selgrid">${p.paramNames.map((n, k) => `<label><span class="vlabel">${esc(n)}</span>
        <select data-k="${k}">${p.paramValues[k].map(v => `<option ${v === v0.parts[k] ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`).join('')}</div>`
      : p.variants.length ? `
      <div class="vlabel">${esc(p.variantLabel || 'Varianta')}:</div>
      <div class="vars">${p.variants.map((v, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${esc(v.label)}<small>${kc(v.price)}</small></button>`).join('')}</div>` : '';
    const related = (cat ? cat.products : []).filter(s => s !== slug).slice(0, 4).map(s => P[s]).filter(Boolean);
    return `<div class="wrap">
      <div class="crumbs"><a href="#/">Úvod</a>${cat ? ` / <a href="#/kategorie/${cat.slug}">${esc(cname(cat))}</a>` : ''} / ${esc(p.title)}</div>
      <div class="pd">
        <div class="gal"><div class="main">${numBadge(p)}${img(p)}</div>
          ${p.images.length > 1 ? `<div class="th">${p.images.map(s => `<img src="${s}" alt="">`).join('')}</div>` : ''}</div>
        <div>
          ${p.guide ? '<span class="eyebrow">Návod zdarma</span>' : (p.num ? `<span class="eyebrow">Schéma Paputo · produkt č. ${esc(p.num)}</span>` : '')}
          <h1>${esc(p.title)}</h1>
          ${p.sub ? `<p class="subt">${esc(p.sub)}</p>` : ''}
          <div class="orig"><b>Celý název v e-shopu:</b> ${esc(p.name)}</div>
          ${p.guide ? `<div class="buy"><p style="margin:0 0 12px">Tento návod je zdarma. Celý text najdete níže.</p></div>` : `
          <div class="buy">
            ${vars}
            <div class="big" id="vp">${v0 ? kc(v0.price) : esc(priceLabel(p))}</div>
            <div class="meta"><span id="va">${v0 ? avail(v0.avail, v0.availColor) : pAvail(p)}</span>
              <span>Kód: <b id="vc">${esc(v0 ? v0.code : p.code)}</b></span>
              ${p.unitPrice ? `<span>Měrná cena: ${esc(p.unitPrice)}</span>` : ''}</div>
            <a class="btn btn-mango" href="${p.url}" target="_blank" rel="noopener">🛒 Koupit na paputo.cz</a>
          </div>`}
          ${p.short ? `<div class="short rich">${p.short}</div>` : ''}
          ${p.params.length ? `<table class="params">${p.params.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table>` : ''}
          ${p.cats.length ? `<div class="chips">${p.cats.map(s => C[s] ? `<a class="chip" href="#/kategorie/${s}">${esc(cname(C[s]))}</a>` : '').join('')}</div>` : ''}
        </div>
      </div>
      ${p.desc ? `<div class="desc rich"><h2>Popis</h2>${p.desc}</div>` : ''}
      ${related.length ? `<div class="related"><h2>Ze stejné kategorie</h2><div class="grid">${related.map(card).join('')}</div></div>` : ''}
    </div>`;
  }
  function bindProduct(slug) {
    const p = P[slug]; if (!p) return;
    document.querySelectorAll('.vars button').forEach(b => b.onclick = () => {
      const v = p.variants[+b.dataset.i];
      document.querySelectorAll('.vars button').forEach(x => x.classList.toggle('on', x === b));
      $('#vp').textContent = kc(v.price); $('#vc').textContent = v.code; $('#va').innerHTML = avail(v.avail, v.availColor);
    });
    const sels = [...document.querySelectorAll('.selgrid select')];
    sels.forEach(sel => sel.onchange = () => {
      const want = sels.map(x => x.value);
      const v = p.variants.find(x => x.parts.every((val, k) => val === want[k]));
      if (!v) { $('#vp').textContent = '—'; $('#vc').textContent = '—'; $('#va').innerHTML = '<span class="av" style="color:#E86F4C">Tato kombinace není k dispozici</span>'; return; }
      $('#vp').textContent = kc(v.price); $('#vc').textContent = v.code; $('#va').innerHTML = avail(v.avail, v.availColor);
    });
    document.querySelectorAll('.gal .th img').forEach(t => t.onclick = () => { $('.gal .main img').src = t.src; });
  }

  function results(q) {
    const r = search(q);
    const prods = r.filter(x => x.kind === 'Produkty').map(x => P[x.href.split('/').pop()]);
    const other = r.filter(x => x.kind !== 'Produkty');
    sIn.value = q;
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / Hledání</div>
      <h1 style="margin-top:14px">Výsledky pro „${esc(q)}“</h1>
      ${!r.length ? `<div class="empty"><h2>Nic jsme nenašli</h2><p>Zkuste jiné slovo, např. <a href="#/hledat/olej">olej</a>, <a href="#/hledat/žako">žako</a>, <a href="#/hledat/vápník">vápník</a>, <a href="#/hledat/škubání">škubání</a> nebo <a href="#/hledat/pamlsky">pamlsky</a>.</p></div>` : ''}
      ${other.length ? `<div class="chips">${other.map(x => `<a class="chip" href="${x.href}">${x.kind === 'Kategorie' ? '📂' : '📖'} ${esc(x.title)}</a>`).join('')}</div>` : ''}
      ${prods.length ? `<p class="muted"><b>${prods.length}</b> produktů</p><div class="grid">${prods.map(card).join('')}</div>` : ''}</div>`;
  }

  function page(slug) {
    const p = PG[slug] || AR[slug]; if (!p) return notFound();
    const extra = slug === 'navody-paputo' || slug === 'harmonogramy' ? `<h2 style="margin-top:28px">Taháky na lednici ke stažení</h2><div class="dl">${pdfLinks()}</div>` : '';
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / ${AR[slug] ? '<a href="#/navody">Návody a články</a> / ' : ''}${esc(p.name)}</div>
      <div class="page rich">${p.date ? `<span class="eyebrow">${esc(p.date)}</span>` : ''}<h1>${esc(p.name)}</h1>${p.html}${extra}</div></div>`;
  }

  function guides() {
    const g = D.products.filter(p => p.guide);
    return `<div class="wrap"><div class="crumbs"><a href="#/">Úvod</a> / Návody a články</div>
      <h1 style="margin-top:14px">Návody a články</h1>
      <div class="posts">${['jak-nakupovat', 'navody-paputo', 'navody-a-prakticke-informace', 'harmonogramy', 'skubani--nervozita--agresivita--nechutenstvi--spatna-kvalita-peri'].map(s =>
        `<a class="post" href="#/stranka/${s}"><small>Návod</small><h3>${esc(PG[s].name)}</h3></a>`).join('')}
        ${g.map(p => `<a class="post" href="#/produkt/${p.slug}"><small>Návod</small><h3>${esc(p.title)}</h3></a>`).join('')}
        ${D.articles.map(a => `<a class="post" href="#/clanek/${a.slug}"><small>Článek · ${esc(a.date)}</small><h3>${esc(a.name)}</h3></a>`).join('')}</div>
      <h2 style="margin-top:36px">Taháky na lednici ke stažení</h2><div class="dl">${pdfLinks()}</div></div>`;
  }

  const notFound = () => `<div class="wrap"><div class="empty" style="margin-top:30px"><h2>Stránka nenalezena</h2><p><a href="#/">Zpět na úvod</a></p></div></div>`;

  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [kind, ...rest] = h.split('/');
    const arg = rest.join('/');
    let html, after = () => {};
    sBox.classList.remove('open'); $('#menu').classList.remove('open');
    if (!kind) { html = home(); after = startCarousel; }
    else if (kind === 'kategorie') {
      html = category(arg);
      after = () => {
        const upd = () => { app.innerHTML = category(arg, $('#sort').value, $('#stock').checked); bindCat(); };
        const bindCat = () => { $('#sort').onchange = upd; $('#stock').onchange = upd; };
        bindCat();
      };
    }
    else if (kind === 'produkt') { html = product(arg); after = () => bindProduct(arg); }
    else if (kind === 'hledat') html = results(arg);
    else if (kind === 'stranka' || kind === 'clanek') html = page(arg);
    else if (kind === 'navody') html = guides();
    else html = notFound();
    if (kind !== 'hledat') sIn.value = '';
    app.innerHTML = html; after();
    window.scrollTo(0, 0);
    const t = $('h1', app); document.title = (kind && t ? t.textContent + ' – ' : '') + 'Paputo.cz (návrh)';
  }
  window.addEventListener('hashchange', route);
  route();
})();
