/* Ballet Bloom · 交互逻辑 */
(function () {
  'use strict';

  const { $, $$, esc, uid, pad, dateStr, fmtDay, weekday, fmtTime, monthLabel, icon, store, imageToDataUrl, toast } = BB;

  const CATEGORIES = ['体服', '纱裙', '打底袜', '舞鞋', '配饰', '外套'];
  const CLASS_TYPES = ['L1', 'L2', 'L3', 'L4', 'L4+转', '转专项', '软开课', '肌肉素质'];
  const SLOTS = [
    { key: 'leotard', cat: '体服', label: '体服' },
    { key: 'skirt', cat: '纱裙', label: '纱裙' },
    { key: 'tights', cat: '打底袜', label: '打底袜' },
    { key: 'shoes', cat: '舞鞋', label: '舞鞋' },
    { key: 'accessory', cat: '配饰', label: '配饰' },
    { key: 'warmup', cat: '外套', label: '外套' }
  ];
  const EMPTY_BOARD = () => ({ leotard: null, skirt: null, tights: null, shoes: null, accessory: null, warmup: null });
  const TITLES = { home: "yuki's ballet space", photos: '照片墙', classes: '课时记录', wardrobe: '我的衣柜', stylist: '搭配台' };

  // 足尖鞋（pointe shoes）：方形鞋头 platform + 交叉缎带 + 蝴蝶结
  const HERO_ART = `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="bbShoe" x1="40" y1="30" x2="120" y2="130" gradientUnits="userSpaceOnUse"><stop stop-color="#EECFD4"/><stop offset="1" stop-color="#C28697"/></linearGradient>
      <linearGradient id="bbTip" x1="50" y1="110" x2="110" y2="135" gradientUnits="userSpaceOnUse"><stop stop-color="#C28697"/><stop offset="1" stop-color="#A96C80"/></linearGradient>
      <radialGradient id="bbGlow"><stop stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="80" cy="80" r="74" fill="url(#bbGlow)"/>
    <!-- 蝴蝶结与飘带 -->
    <path d="M80 46 C66 33 51 35 53 45 C55 55 69 54 80 46 Z" fill="url(#bbShoe)"/>
    <path d="M80 46 C94 33 109 35 107 45 C105 55 91 54 80 46 Z" fill="url(#bbShoe)"/>
    <path d="M76 50 C71 61 67 70 62 80" stroke="#C28697" stroke-width="4" stroke-linecap="round"/>
    <path d="M84 50 C89 61 93 70 98 80" stroke="#C28697" stroke-width="4" stroke-linecap="round"/>
    <path d="M80 46 C64 32 51 37 42 26" stroke="#C28697" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <path d="M80 46 C96 32 109 37 118 26" stroke="#C28697" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <circle cx="80" cy="46" r="5" fill="#B47186"/>
    <!-- 左鞋 -->
    <g transform="translate(53 100) rotate(-13)">
      <path d="M-10 -30 C-13 -20 -14 -6 -12 6 C-11 14 -9 18 -8 22 L-8 28 Q0 31 8 28 L8 22 C9 18 11 14 12 6 C14 -6 13 -20 10 -30 Q0 -26 -10 -30 Z" fill="url(#bbShoe)" stroke="#B47186" stroke-width="1.1"/>
      <path d="M-8 20 Q0 23 8 20 L8 28 Q0 31 -8 28 Z" fill="url(#bbTip)"/>
      <path d="M-8 20 Q0 23 8 20" stroke="#B47186" stroke-width="1" opacity=".5"/>
      <path d="M-10 -30 Q0 -25 10 -30" stroke="#fff" stroke-width="2.2" opacity=".7"/>
      <path d="M-8 -18 Q-3 -14 0 -16" stroke="#fff" stroke-width="1.2" opacity=".4"/>
      <path d="M-12 -12 Q0 -4 12 -10" stroke="#C28697" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M12 -12 Q0 -4 -12 -10" stroke="#C28697" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M-9 -28 C-16 -32 -18 -38 -15 -44" stroke="#C28697" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M9 -28 C16 -32 18 -38 15 -44" stroke="#C28697" stroke-width="3.2" stroke-linecap="round"/>
    </g>
    <!-- 右鞋 -->
    <g transform="translate(107 100) rotate(13)">
      <path d="M-10 -30 C-13 -20 -14 -6 -12 6 C-11 14 -9 18 -8 22 L-8 28 Q0 31 8 28 L8 22 C9 18 11 14 12 6 C14 -6 13 -20 10 -30 Q0 -26 -10 -30 Z" fill="url(#bbShoe)" stroke="#B47186" stroke-width="1.1"/>
      <path d="M-8 20 Q0 23 8 20 L8 28 Q0 31 -8 28 Z" fill="url(#bbTip)"/>
      <path d="M-8 20 Q0 23 8 20" stroke="#B47186" stroke-width="1" opacity=".5"/>
      <path d="M-10 -30 Q0 -25 10 -30" stroke="#fff" stroke-width="2.2" opacity=".7"/>
      <path d="M-8 -18 Q-3 -14 0 -16" stroke="#fff" stroke-width="1.2" opacity=".4"/>
      <path d="M-12 -12 Q0 -4 12 -10" stroke="#C28697" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M12 -12 Q0 -4 -12 -10" stroke="#C28697" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M-9 -28 C-16 -32 -18 -38 -15 -44" stroke="#C28697" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M9 -28 C16 -32 18 -38 15 -44" stroke="#C28697" stroke-width="3.2" stroke-linecap="round"/>
    </g>
    <!-- 星点 -->
    <path d="M22 60 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill="#D6A3AC"/>
    <path d="M138 66 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill="#BFA9B4"/>
    <circle cx="26" cy="122" r="2.4" fill="#D6A3AC"/>
    <circle cx="134" cy="124" r="2" fill="#BFA9B4"/>
  </svg>`;

  const state = {
    page: 'home',
    photos: [], items: [], classes: [], looks: [],
    photoTag: '全部',
    wardrobeCat: '全部',
    shelfCat: '体服',
    classType: '全部',
    classSearch: '',
    classDate: '',
    board: EMPTY_BOARD(),
    calendar: { y: new Date().getFullYear(), m: new Date().getMonth() },
    confirm: null,
    lightbox: null
  };
  let pendingPhotos = [];
  let pendingItemImage = '';

  /* ---------- 数据 ---------- */
  async function loadAll() {
    try {
      const [photos, items, classes, looks] = await Promise.all([
        store.all('photos'), store.all('items'), store.all('classes'), store.all('looks')
      ]);
      state.photos = photos.sort((a, b) => b.createdAt - a.createdAt);
      state.items = items.sort((a, b) => b.createdAt - a.createdAt);
      state.classes = classes.sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
      state.looks = looks.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      console.error(err);
      toast('本地数据读取失败，请更换浏览器重试');
    }
  }

  function itemById(id) { return state.items.find((i) => i.id === id); }
  function lookById(id) { return state.looks.find((l) => l.id === id); }
  function availableTypes() {
    const legacy = state.classes.map((c) => c.type).filter((t) => t && !CLASS_TYPES.includes(t));
    return [...CLASS_TYPES, ...Array.from(new Set(legacy))];
  }
  function allTags() {
    const set = new Set();
    state.photos.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return ['全部', ...Array.from(set)];
  }

  /* ---------- 渲染入口 ---------- */
  function render() {
    $('#page-title').textContent = TITLES[state.page];
    const now = new Date();
    $('#today-label').textContent = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekday(dateStr(now))}`;
    $$('.nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.page === state.page));
    const views = { home: viewHome, photos: viewPhotos, classes: viewClasses, wardrobe: viewWardrobe, stylist: viewStylist };
    $('#view-root').innerHTML = `<div class="view">${views[state.page]()}</div>`;
  }

  async function refresh() { await loadAll(); render(); }

  /* ---------- 概览 ---------- */
  function stats() {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const minutes = state.classes.reduce((sum, c) => sum + (Number(c.duration) || 0), 0);
    return {
      total: state.classes.length,
      hours: (minutes / 60).toFixed(1),
      month: state.classes.filter((c) => (c.date || '').startsWith(prefix)).length,
      items: state.items.length
    };
  }

  function viewHome() {
    const s = stats();
    const recent = state.classes.slice(0, 4);
    const photos = state.photos.slice(0, 4);
    return `
      <section class="hero">
        <div class="hero-copy">
          <span class="hero-kicker">ballet bloom</span>
          <h2 class="hero-quote">Don't do it until you get it right,<br />but do it until you can't get it wrong.</h2>
        </div>
        <div class="hero-art">${HERO_ART}</div>
      </section>

      <section class="stat-grid">
        <div class="stat-card"><div class="stat-icon">${icon('calendar')}</div><div class="stat-value">${s.total}<small>节</small></div><div class="stat-label">累计课时</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('clock')}</div><div class="stat-value">${s.hours}<small>小时</small></div><div class="stat-label">累计练习时长</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('star')}</div><div class="stat-value">${s.month}<small>节</small></div><div class="stat-label">本月上课</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('hanger')}</div><div class="stat-value">${s.items}<small>件</small></div><div class="stat-label">衣柜单品</div></div>
      </section>

      <div class="two-col">
        <section class="card">
          <div class="card-head"><h2 class="section-title">最近课堂</h2><button class="link-btn" data-action="goto" data-page="classes">查看全部 →</button></div>
          ${recent.length ? `<div class="timeline">${recent.map(timelineItem).join('')}</div>` : emptyBlock('calendar', '还没有课时记录', '记录第一节课，开启你的成长轨迹。', 'add-class', '记一节课')}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="section-title">本月日历</h2><span class="subtle">有课的日子会亮起来</span></div>
          ${calendarHtml()}
        </section>
      </div>

      <div class="two-col">
        <section class="card">
          <div class="card-head"><h2 class="section-title">最近照片</h2><button class="link-btn" data-action="goto" data-page="photos">去照片墙 →</button></div>
          ${photos.length ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">${photos.map((p) => `<button data-action="view-photo" data-id="${p.id}" style="padding:0;border:0;border-radius:12px;overflow:hidden;background:none;aspect-ratio:1"><img src="${p.data}" alt="${esc(p.caption || '芭蕾照片')}" style="width:100%;height:100%;object-fit:cover;display:block"></button>`).join('')}</div>`
            : emptyBlock('photo', '照片墙还空着', '上传一张喜欢的芭蕾照片吧。', 'open-photo-upload', '上传照片')}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="section-title">我的搭配</h2><button class="link-btn" data-action="goto" data-page="stylist">去搭配台 →</button></div>
          ${state.looks.length ? state.looks.slice(0, 2).map((l) => `<div class="class-row" style="grid-template-columns:1fr auto;margin-bottom:10px"><div class="class-main"><h4>${esc(l.name)}</h4><p>${slotNames(l.slots).join(' · ') || '尚未选择单品'}</p></div><button class="btn btn-soft btn-sm" data-action="load-look" data-id="${l.id}">载入</button></div>`).join('')
            : emptyBlock('sparkle', '还没有保存搭配', '去搭配台组合你的体服与配饰。', 'goto', '开始搭配', 'stylist')}
        </section>
      </div>`;
  }

  function timelineItem(c) {
    const d = new Date(c.date + 'T00:00:00');
    return `<div class="tl-item">
      <div class="tl-date"><strong>${pad(d.getDate())}</strong><small>${d.getMonth() + 1}月 · ${weekday(c.date)}</small></div>
      <div class="tl-line"><i></i></div>
      <div class="tl-body">
        <h4>${esc(c.type || '芭蕾课')} <span class="tag ${typeTagClass(c.type)}">${esc(c.time || '')} ${c.duration ? '· ' + c.duration + '分钟' : ''}</span></h4>
        <div class="tl-meta"><span>${icon('pin')}${esc(c.location || '未记录地点')}</span><span>${icon('hanger')}${esc(outfitLabel(c))}</span></div>
      </div>
    </div>`;
  }

  function typeTagClass(type) {
    return ({
      'L3': 'tag-purple', 'L4': 'tag-purple', 'L4+转': 'tag-sand',
      '转专项': 'tag-sand', '软开课': 'tag-purple', '肌肉素质': 'tag-mint'
    })[type] || '';
  }

  function outfitLabel(c) {
    const look = lookById(c.lookId);
    if (look) return look.name;
    if (c.outfitNote) return c.outfitNote;
    const names = (c.itemIds || []).map((id) => itemById(id)).filter(Boolean).map((i) => i.name);
    return names.length ? names.join(' + ') : '未记录搭配';
  }

  function calendarHtml() {
    const { y, m } = state.calendar;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const marked = new Set(state.classes.map((c) => c.date));
    const today = dateStr();
    let cells = Array.from({ length: first }, () => '<div class="cal-day blank"></div>').join('');
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      cells += `<div class="cal-day ${marked.has(key) ? 'has-class' : ''} ${key === today ? 'today' : ''}" ${marked.has(key) ? `data-action="class-date" data-date="${key}" title="查看这天的课"` : ''}>${d}</div>`;
    }
    return `<div class="calendar-head">
      <button class="btn-icon" data-action="cal-prev">${icon('left')}</button>
      <strong>${monthLabel(y, m)}</strong>
      <button class="btn-icon" data-action="cal-next">${icon('right')}</button>
    </div><div class="calendar-grid">${['日', '一', '二', '三', '四', '五', '六'].map((d) => `<div class="dow">${d}</div>`).join('')}${cells}</div>`;
  }

  function emptyBlock(ic, title, desc, action, label, page) {
    return `<div class="empty">${icon(ic)}<strong>${title}</strong><p>${desc}</p><button class="btn btn-soft btn-sm" data-action="${action}" ${page ? `data-page="${page}"` : ''}>${label}</button></div>`;
  }

  /* ---------- 照片墙 ---------- */
  function viewPhotos() {
    const tags = allTags();
    const list = state.photoTag === '全部' ? state.photos : state.photos.filter((p) => (p.tags || []).includes(state.photoTag));
    return `
      <div class="toolbar">
        <div class="chips">${tags.map((t) => `<button class="chip ${state.photoTag === t ? 'active' : ''}" data-action="filter-tag" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>
        <button class="btn btn-primary" data-action="open-photo-upload">${icon('plus')}上传照片</button>
      </div>
      ${list.length ? `<div class="photo-grid">${list.map((p) => `
        <article class="photo-card">
          <img src="${p.data}" alt="${esc(p.caption || '芭蕾照片')}" loading="lazy" data-action="view-photo" data-id="${p.id}" />
          <div class="photo-actions">
            <button class="btn-icon" data-action="edit-photo" data-id="${p.id}" title="编辑">${icon('edit')}</button>
            <button class="btn-icon" data-action="delete-photo" data-id="${p.id}" title="删除">${icon('trash')}</button>
          </div>
          <div class="photo-info"><strong>${esc(p.caption || '未命名照片')}</strong><small>${fmtTime(p.createdAt)}${(p.tags || []).length ? ' · ' + esc(p.tags.join(' / ')) : ''}</small></div>
        </article>`).join('')}</div>`
        : emptyBlock('photo', state.photos.length ? '这个分类下还没有照片' : '照片墙还空着', '上传排练、演出或日常练习的照片，记录每一个闪光瞬间。', 'open-photo-upload', '上传第一张照片')}`;
  }

  /* ---------- 课时记录 ---------- */
  function filteredClasses() {
    const q = state.classSearch.trim().toLowerCase();
    return state.classes.filter((c) => {
      if (state.classType !== '全部' && c.type !== state.classType) return false;
      if (state.classDate && c.date !== state.classDate) return false;
      if (!q) return true;
      return [c.type, c.location, c.teacher, c.outfitNote, outfitLabel(c), c.notes].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }

  function viewClasses() {
    const list = filteredClasses();
    const s = stats();
    return `
      <section class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-icon">${icon('calendar')}</div><div class="stat-value">${s.total}<small>节</small></div><div class="stat-label">累计课时</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('clock')}</div><div class="stat-value">${s.hours}<small>小时</small></div><div class="stat-label">累计时长</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('star')}</div><div class="stat-value">${s.month}<small>节</small></div><div class="stat-label">本月次数</div></div>
      </section>
      <section class="card">
        <div class="toolbar" style="margin-bottom:16px">
          <div class="chips">
            ${['全部', ...availableTypes()].map((t) => `<button class="chip ${state.classType === t ? 'active' : ''}" data-action="filter-type" data-type="${t}">${t}</button>`).join('')}
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="position:relative">
              <span style="position:absolute;left:11px;top:10px;color:var(--ink-faint)">${icon('search')}</span>
              <input class="input" data-input="class-search" placeholder="搜索地点、体服…" value="${esc(state.classSearch)}" style="padding-left:34px;width:190px" />
            </div>
            <button class="btn btn-primary" data-action="add-class">${icon('plus')}记一节课</button>
          </div>
        </div>
        ${state.classDate ? `<div style="margin-bottom:14px"><span class="tag tag-purple">${esc(state.classDate)} 的课堂</span> <button class="link-btn" data-action="clear-date">清除筛选</button></div>` : ''}
        ${list.length ? `<div class="class-list">${list.map(classRow).join('')}</div>`
          : emptyBlock('calendar', state.classes.length ? '没有符合条件的记录' : '还没有课时记录', '写下时间、地点和当天穿的体服，留住这段旅程。', 'add-class', '记第一节课')}
      </section>`;
  }

  function classRow(c) {
    const names = (c.itemIds || []).map((id) => itemById(id)).filter(Boolean).map((i) => i.name);
    return `<article class="class-row">
      <div class="class-date"><strong>${pad(new Date(c.date + 'T00:00:00').getDate())}</strong><small>${new Date(c.date + 'T00:00:00').getMonth() + 1}月 · ${weekday(c.date)}</small></div>
      <div class="class-main">
        <h4>${esc(c.type || '芭蕾课')} <span class="tag ${typeTagClass(c.type)}">${esc(c.time || '')}${c.duration ? ' · ' + c.duration + ' 分钟' : ''}</span>${c.teacher ? `<span class="tag tag-mint">${esc(c.teacher)}</span>` : ''}</h4>
        <p>${icon('pin').replace('<svg', '<svg style="width:12px;height:12px;vertical-align:-2px"')} ${esc(c.location || '未记录地点')} &nbsp;·&nbsp; ${icon('hanger').replace('<svg', '<svg style="width:12px;height:12px;vertical-align:-2px"')} 体服：${esc(outfitLabel(c))}${names.length ? '（' + esc(names.join('、')) + '）' : ''}</p>
        ${c.notes ? `<p style="color:var(--ink-faint);margin-top:4px">${esc(c.notes)}</p>` : ''}
      </div>
      <div class="class-actions">
        <button class="btn-icon" data-action="edit-class" data-id="${c.id}" title="编辑">${icon('edit')}</button>
        <button class="btn-icon" data-action="delete-class" data-id="${c.id}" title="删除">${icon('trash')}</button>
      </div>
    </article>`;
  }

  /* ---------- 衣柜 ---------- */
  function viewWardrobe() {
    const cats = ['全部', ...CATEGORIES];
    const list = state.wardrobeCat === '全部' ? state.items : state.items.filter((i) => i.category === state.wardrobeCat);
    return `
      <div class="toolbar">
        <div class="chips">${cats.map((c) => `<button class="chip ${state.wardrobeCat === c ? 'active' : ''}" data-action="filter-cat" data-cat="${c}">${c}<span class="subtle" style="margin-left:5px">${c === '全部' ? state.items.length : state.items.filter((i) => i.category === c).length}</span></button>`).join('')}</div>
        <button class="btn btn-primary" data-action="add-item">${icon('plus')}添加单品</button>
      </div>
      ${list.length ? `<div class="wardrobe-grid">${list.map(itemCard).join('')}</div>`
        : emptyBlock('hanger', state.items.length ? '这个分类还没有单品' : '衣柜还是空的', '拍照上传体服、纱裙、舞鞋和配饰，随时看见自己的收藏。', 'add-item', '添加第一件单品')}`;
  }

  function itemCard(i) {
    return `<article class="item-card">
      <div class="item-media">${i.data ? `<img src="${i.data}" alt="${esc(i.name)}" loading="lazy" />` : `<span class="no-img">${icon('hanger')}</span>`}</div>
      <div class="item-actions">
        <button class="btn-icon" data-action="edit-item" data-id="${i.id}" title="编辑">${icon('edit')}</button>
        <button class="btn-icon" data-action="delete-item" data-id="${i.id}" title="删除">${icon('trash')}</button>
      </div>
      <div class="item-body"><h4>${esc(i.name)}</h4><p><i class="color-dot" style="background:${esc(i.color || '#d6a3ac')}"></i>${esc(i.category)}${i.brand ? ' · ' + esc(i.brand) : ''}</p></div>
    </article>`;
  }

  /* ---------- 搭配台 ---------- */
  function viewStylist() {
    const shelf = state.items.filter((i) => i.category === state.shelfCat);
    const chosenId = state.board[SLOTS.find((s) => s.cat === state.shelfCat).key];
    return `
      <div class="studio">
        <section class="card">
          <div class="card-head"><h2 class="section-title">我的衣柜</h2><button class="btn btn-soft btn-sm" data-action="add-item">${icon('plus')}添加单品</button></div>
          <div class="chips" style="margin-bottom:16px">${CATEGORIES.map((c) => `<button class="chip ${state.shelfCat === c ? 'active' : ''}" data-action="shelf-cat" data-cat="${c}">${c}</button>`).join('')}</div>
          ${shelf.length ? `<div class="shelf-grid">${shelf.map((i) => `
            <div class="shelf-item ${chosenId === i.id ? 'chosen' : ''}" data-action="shelf-pick" data-id="${i.id}" title="点击放到搭配板">
              ${i.data ? `<img src="${i.data}" alt="${esc(i.name)}" />` : `<div class="placeholder">${icon('hanger')}</div>`}
              <span>${esc(i.name)}</span>
            </div>`).join('')}</div>`
            : emptyBlock('hanger', '还没有' + state.shelfCat, '先添加一件单品，再来搭配吧。', 'add-item', '添加单品')}
        </section>

        <section class="board">
          <div class="board-head"><h3>今日搭配板</h3><span class="subtle">点左侧单品即可放入</span></div>
          <div class="board-canvas">
            <div class="board-silhouette">${icon('dancer')}</div>
            ${SLOTS.map((slot) => slotHtml(slot)).join('')}
          </div>
          <div class="board-actions">
            <button class="btn btn-primary" data-action="save-look">${icon('save')}保存搭配</button>
            <button class="btn btn-ghost" data-action="random-look">${icon('shuffle')}随机搭配</button>
            <button class="btn btn-ghost" data-action="clear-board">${icon('reset')}清空</button>
          </div>
        </section>
      </div>
      <section class="card">
        <div class="card-head"><h2 class="section-title">已保存的搭配</h2><span class="subtle">共 ${state.looks.length} 套 · 可直接关联到课时记录</span></div>
        ${state.looks.length ? `<div class="look-list">${state.looks.map((l) => `
          <div class="look-card">
            <div class="look-thumbs">${SLOTS.map((slot) => {
              const it = itemById(l.slots[slot.key]);
              return `<div>${it && it.data ? `<img src="${it.data}" alt="" />` : icon('plus')}</div>`;
            }).join('')}</div>
            <strong>${esc(l.name)}</strong>
            <div class="row"><button class="btn btn-soft btn-sm" data-action="load-look" data-id="${l.id}">载入</button><button class="btn-icon" data-action="delete-look" data-id="${l.id}" title="删除">${icon('trash')}</button></div>
          </div>`).join('')}</div>`
          : emptyBlock('sparkle', '还没有保存的搭配', '选好单品后点击「保存搭配」，以后上课就能一键记录。', 'random-look', '试试随机搭配')}
      </section>`;
  }

  function slotHtml(slot) {
    const item = itemById(state.board[slot.key]);
    return `<div class="board-slot ${item ? 'filled' : ''}">
      ${item ? `<button class="clear-slot" data-action="clear-slot" data-key="${slot.key}" title="移除">${icon('close')}</button>
        ${item.data ? `<img src="${item.data}" alt="${esc(item.name)}" />` : `<span class="slot-icon">${icon('hanger')}</span>`}
        <b>${esc(item.name)}</b><span>${esc(item.color || item.category)}</span>`
        : `<span class="slot-icon">${icon('plus')}</span><b>${slot.label}</b><span>待选择</span>`}
    </div>`;
  }

  function slotNames(board) {
    return SLOTS.map((s) => {
      const it = itemById(board && board[s.key]);
      return it ? `${s.label}：${it.name}` : null;
    }).filter(Boolean);
  }

  /* ---------- 弹窗 ---------- */
  function showModal({ title, body, footer = '', wide = false, onMount }) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-backdrop">
      <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head"><h3>${title}</h3><button class="btn-icon" data-action="close-modal" title="关闭">${icon('close')}</button></div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
      </div>
    </div>`;
    if (onMount) onMount($('.modal', root));
  }
  function closeModal() { $('#modal-root').innerHTML = ''; }

  function confirmDialog(message, onYes) {
    state.confirm = onYes;
    showModal({
      title: '确认操作',
      body: `<p style="margin:0;font-size:13px;line-height:1.8;color:var(--ink-soft)">${esc(message)}</p>`,
      footer: `<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-danger" data-action="confirm-yes">确认删除</button>`
    });
  }

  function attachDropzone(drop, input, kind) {
    if (!drop || !input) return;
    drop.addEventListener('click', () => input.click());
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('dragover'); }));
    drop.addEventListener('drop', (e) => handleFiles(Array.from(e.dataTransfer.files), kind));
  }

  async function handleFiles(files, kind) {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) { toast('请选择图片文件'); return; }
    if (images.some((f) => f.size > 12 * 1024 * 1024)) { toast('单张图片请小于 12MB'); return; }
    try {
      if (kind === 'photo') {
        for (const file of images) {
          const data = await imageToDataUrl(file, 1400, 0.84, false);
          pendingPhotos.push({ data });
        }
        updatePhotoPreview();
      } else {
        pendingItemImage = await imageToDataUrl(images[0], 900, 0.9, images[0].type !== 'image/jpeg');
        const preview = $('#item-image-preview');
        if (preview) preview.innerHTML = `<img src="${pendingItemImage}" alt="单品预览" />`;
      }
    } catch (err) { toast('图片处理失败，请重试'); console.error(err); }
  }

  function updatePhotoPreview() {
    const box = $('#photo-preview-strip');
    if (box) box.innerHTML = pendingPhotos.map((p, i) => `<div class="preview-thumb"><img src="${p.data}" alt="预览 ${i + 1}" /><button type="button" data-action="remove-pending" data-index="${i}">${icon('close')}</button></div>`).join('');
    const count = $('#photo-count');
    if (count) count.textContent = `已选择 ${pendingPhotos.length} 张`;
  }

  function openPhotoUpload() {
    pendingPhotos = [];
    showModal({
      title: '上传照片',
      body: `<form id="photo-upload-form" data-form="photo-upload">
        <div class="field" style="margin-bottom:14px"><label>照片说明 <span class="hint">（可选，会应用到此批照片）</span></label><input class="input" name="caption" placeholder="例如：第一次完成整支变奏" /></div>
        <div class="field"><label>标签</label><div class="chips" id="photo-tag-picker">${['课堂', '排练', '演出', '随手拍'].map((t) => `<button type="button" class="chip" data-action="toggle-tag" data-tag="${t}">${t}</button>`).join('')}</div></div>
        <div class="dropzone" id="photo-drop" style="margin-top:14px">${icon('up')}<strong>点击或拖拽图片到这里</strong><small>支持多选 · 单张不超过 12MB · 自动压缩后保存在本机</small>
          <input id="photo-file" type="file" accept="image/*" multiple hidden /></div>
        <p class="subtle" id="photo-count" style="margin:12px 0 0">已选择 0 张</p>
        <div class="preview-strip" id="photo-preview-strip"></div>
      </form>`,
      footer: `<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-primary" data-action="submit-form" data-target="photo-upload-form">保存照片</button>`,
      onMount(modal) { attachDropzone($('#photo-drop', modal), $('#photo-file', modal), 'photo'); }
    });
  }

  function openPhotoEdit(id) {
    const p = state.photos.find((x) => x.id === id);
    if (!p) return;
    showModal({
      title: '编辑照片',
      body: `<form id="photo-edit-form" data-form="photo-edit" data-id="${id}">
        <div style="text-align:center;margin-bottom:16px"><img src="${p.data}" alt="" style="max-height:220px;max-width:100%;border-radius:12px" /></div>
        <div class="field" style="margin-bottom:14px"><label>照片说明</label><input class="input" name="caption" value="${esc(p.caption)}" /></div>
        <div class="field"><label>标签 <span class="hint">（用逗号分隔）</span></label><input class="input" name="tags" value="${esc((p.tags || []).join('，'))}" placeholder="课堂，演出" /></div>
      </form>`,
      footer: `<button class="btn btn-danger" data-action="delete-photo" data-id="${id}">删除照片</button><div style="flex:1"></div><button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-primary" data-action="submit-form" data-target="photo-edit-form">保存修改</button>`
    });
  }

  function openClassForm(id) {
    const c = state.classes.find((x) => x.id === id) || {};
    const selected = c.itemIds || [];
    showModal({
      title: id ? '编辑课时记录' : '记一节课',
      wide: true,
      body: `<form id="class-form" data-form="class" data-id="${id || ''}">
        <div class="form-grid">
          <div class="field"><label>上课日期</label><input class="input" type="date" name="date" value="${esc(c.date || dateStr())}" required /></div>
          <div class="field"><label>开始时间</label><input class="input" type="time" name="time" value="${esc(c.time || '19:00')}" /></div>
          <div class="field"><label>时长（分钟）</label><input class="input" type="number" name="duration" min="15" max="300" step="15" value="${esc(c.duration || 90)}" /></div>
          <div class="field"><label>课程类型</label><select class="select" name="type">${availableTypes().map((t) => `<option ${c.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="field"><label>上课地点</label><input class="input" name="location" value="${esc(c.location || '')}" placeholder="例如：星辰舞蹈工作室 A 教室" /></div>
          <div class="field"><label>老师 <span class="hint">（可选）</span></label><input class="input" name="teacher" value="${esc(c.teacher || '')}" placeholder="老师名字" /></div>
          <div class="field"><label>关联已保存搭配</label><select class="select" name="lookId"><option value="">不关联</option>${state.looks.map((l) => `<option value="${l.id}" ${c.lookId === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></div>
          <div class="field"><label>今日体服 / 搭配描述</label><input class="input" name="outfitNote" value="${esc(c.outfitNote || '')}" placeholder="例如：粉色吊带体服 + 白纱裙" /></div>
          <div class="field full"><label>衣柜单品 <span class="hint">（点击选择，可多选）</span></label>
            ${state.items.length ? `<div class="picker">${state.items.map((i) => `<button type="button" class="picker-item ${selected.includes(i.id) ? 'selected' : ''}" data-action="toggle-pick" data-id="${i.id}"><i style="background:${esc(i.color || '#d6a3ac')}"></i>${esc(i.name)}</button>`).join('')}</div>` : `<p class="subtle" style="margin:0">衣柜还是空的，先去添加单品吧。</p>`}
          </div>
          <div class="field full"><label>课堂笔记</label><textarea class="textarea" name="notes" placeholder="今天的状态、老师纠正的动作、小目标…">${esc(c.notes || '')}</textarea></div>
        </div>
      </form>`,
      footer: `<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-primary" data-action="submit-form" data-target="class-form">保存记录</button>`
    });
  }

  function openItemForm(id) {
    const item = state.items.find((x) => x.id === id) || {};
    pendingItemImage = item.data || '';
    showModal({
      title: id ? '编辑单品' : '添加单品',
      body: `<form id="item-form" data-form="item" data-id="${id || ''}">
        <div class="form-grid">
          <div class="field"><label>单品名称</label><input class="input" name="name" value="${esc(item.name || '')}" placeholder="例如：玫瑰粉吊带体服" required /></div>
          <div class="field"><label>分类</label><select class="select" name="category">${CATEGORIES.map((c) => `<option ${item.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>颜色</label><input class="input" type="color" name="color" value="${esc(item.color || '#d6a3ac')}" style="height:42px;padding:5px" /></div>
          <div class="field"><label>品牌 <span class="hint">（可选）</span></label><input class="input" name="brand" value="${esc(item.brand || '')}" placeholder="品牌名称" /></div>
          <div class="field full"><label>备注</label><input class="input" name="note" value="${esc(item.note || '')}" placeholder="尺码、购买渠道、搭配心得…" /></div>
          <div class="field full"><label>单品照片</label>
            <div class="dropzone" id="item-drop">${icon('up')}<strong>点击或拖拽上传照片</strong><small>建议使用透明背景 PNG，方便搭配展示</small>
              <input id="item-file" type="file" accept="image/*" hidden /></div>
            <div id="item-image-preview" class="preview-strip">${pendingItemImage ? `<div class="preview-thumb"><img src="${pendingItemImage}" alt="预览" /></div>` : ''}</div>
          </div>
        </div>
      </form>`,
      footer: `<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-primary" data-action="submit-form" data-target="item-form">保存单品</button>`,
      onMount(modal) {
        attachDropzone($('#item-drop', modal), $('#item-file', modal), 'item');
      }
    });
  }

  function openLookSave() {
    if (!Object.values(state.board).some(Boolean)) { toast('先选几件单品再保存吧'); return; }
    showModal({
      title: '保存这套搭配',
      body: `<form id="look-form" data-form="look"><div class="field"><label>搭配名称</label><input class="input" name="name" required placeholder="例如：春日粉色系 · 剧目课" /></div>
        <p class="subtle" style="margin:12px 0 0">${esc(slotNames(state.board).join(' / ') || '')}</p></form>`,
      footer: `<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-primary" data-action="submit-form" data-target="look-form">保存搭配</button>`
    });
  }

  /* ---------- 表单提交 ---------- */
  async function submitForm(form) {
    const kind = form.dataset.form;
    const v = (name) => form.elements[name] ? form.elements[name].value.trim() : '';
    const id = form.dataset.id;

    if (kind === 'photo-upload') {
      if (!pendingPhotos.length) { toast('请先选择照片'); return; }
      const tags = $$('.chip.active', $('#photo-tag-picker')).map((el) => el.dataset.tag);
      const caption = v('caption');
      for (const p of pendingPhotos) {
        await store.put('photos', { id: uid(), data: p.data, caption, tags, createdAt: Date.now() });
      }
      closeModal();
      await refresh();
      toast(`已保存 ${pendingPhotos.length} 张照片`);
      pendingPhotos = [];
      return;
    }

    if (kind === 'photo-edit') {
      const p = state.photos.find((x) => x.id === id);
      if (!p) return;
      p.caption = v('caption');
      p.tags = v('tags').split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
      await store.put('photos', p);
      closeModal(); await refresh(); toast('照片信息已更新');
      return;
    }

    if (kind === 'class') {
      const record = {
        id: id || uid(),
        date: v('date') || dateStr(),
        time: v('time'),
        duration: Number(v('duration')) || 0,
        type: v('type') || 'L1',
        location: v('location'),
        teacher: v('teacher'),
        lookId: v('lookId'),
        outfitNote: v('outfitNote'),
        itemIds: $$('.picker-item.selected', form).map((el) => el.dataset.id),
        notes: form.elements.notes.value.trim(),
        createdAt: (state.classes.find((c) => c.id === id) || {}).createdAt || Date.now()
      };
      await store.put('classes', record);
      closeModal(); await refresh(); toast(id ? '课时记录已更新' : '这节课已记下啦');
      return;
    }

    if (kind === 'item') {
      const old = state.items.find((x) => x.id === id) || {};
      const item = {
        id: id || uid(), name: v('name'), category: v('category'), color: v('color'),
        brand: v('brand'), note: v('note'), data: pendingItemImage || old.data || '',
        createdAt: old.createdAt || Date.now()
      };
      await store.put('items', item);
      closeModal(); await refresh(); toast(id ? '单品已更新' : '单品已加入衣柜');
      return;
    }

    if (kind === 'look') {
      await store.put('looks', { id: uid(), name: v('name'), slots: { ...state.board }, createdAt: Date.now() });
      closeModal(); await refresh(); toast('搭配已保存');
    }
  }

  /* ---------- 动作分发 ---------- */
  async function handleAction(action, el) {
    const id = el.dataset.id;
    switch (action) {
      case 'goto':
        state.page = el.dataset.page; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'close-modal': closeModal(); break;
      case 'confirm-yes': {
        const fn = state.confirm; state.confirm = null; closeModal();
        if (fn) await fn();
        break;
      }
      case 'open-photo-upload': openPhotoUpload(); break;
      case 'submit-form': {
        const form = document.getElementById(el.dataset.target);
        if (form) await submitForm(form);
        break;
      }
      case 'toggle-tag': el.classList.toggle('active'); break;
      case 'toggle-pick': el.classList.toggle('selected'); break;
      case 'remove-pending': pendingPhotos.splice(Number(el.dataset.index), 1); updatePhotoPreview(); break;
      case 'view-photo': openLightbox(id); break;
      case 'lightbox-close': closeLightbox(); break;
      case 'lightbox-prev': stepLightbox(-1); break;
      case 'lightbox-next': stepLightbox(1); break;
      case 'edit-photo': openPhotoEdit(id); break;
      case 'delete-photo':
        confirmDialog('确定删除这张照片吗？删除后无法恢复。', async () => {
          await store.remove('photos', id); await refresh(); closeLightbox(); toast('照片已删除');
        });
        break;
      case 'filter-tag': state.photoTag = el.dataset.tag; render(); break;
      case 'filter-cat': state.wardrobeCat = el.dataset.cat; render(); break;
      case 'filter-type': state.classType = el.dataset.type; render(); break;
      case 'clear-date': state.classDate = ''; render(); break;
      case 'class-date': state.page = 'classes'; state.classType = '全部'; state.classDate = el.dataset.date; render(); break;
      case 'cal-prev': state.calendar.m--; if (state.calendar.m < 0) { state.calendar.m = 11; state.calendar.y--; } render(); break;
      case 'cal-next': state.calendar.m++; if (state.calendar.m > 11) { state.calendar.m = 0; state.calendar.y++; } render(); break;
      case 'add-class': case 'edit-class': openClassForm(action === 'edit-class' ? id : ''); break;
      case 'delete-class':
        confirmDialog('确定删除这条课时记录吗？', async () => {
          await store.remove('classes', id); await refresh(); toast('记录已删除');
        });
        break;
      case 'add-item': case 'edit-item': openItemForm(action === 'edit-item' ? id : ''); break;
      case 'delete-item':
        confirmDialog('确定从衣柜删除这件单品吗？', async () => {
          await store.remove('items', id);
          SLOTS.forEach((s) => { if (state.board[s.key] === id) state.board[s.key] = null; });
          await refresh(); toast('单品已删除');
        });
        break;
      case 'shelf-cat': state.shelfCat = el.dataset.cat; render(); break;
      case 'shelf-pick': {
        const slot = SLOTS.find((s) => s.cat === state.shelfCat);
        state.board[slot.key] = state.board[slot.key] === id ? null : id;
        render();
        break;
      }
      case 'clear-slot': state.board[el.dataset.key] = null; render(); break;
      case 'clear-board': state.board = EMPTY_BOARD(); render(); toast('搭配板已清空'); break;
      case 'random-look': {
        SLOTS.forEach((s) => {
          const pool = state.items.filter((i) => i.category === s.cat);
          state.board[s.key] = pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null;
        });
        render(); toast('换了一套新搭配');
        break;
      }
      case 'save-look': openLookSave(); break;
      case 'load-look': {
        const look = lookById(id);
        if (!look) return;
        state.board = { ...EMPTY_BOARD(), ...look.slots };
        state.page = 'stylist'; render(); toast(`已载入「${look.name}」`);
        break;
      }
      case 'delete-look':
        confirmDialog('确定删除这套搭配吗？', async () => {
          await store.remove('looks', id); await refresh(); toast('搭配已删除');
        });
        break;
    }
  }

  /* ---------- 大图浏览 ---------- */
  function openLightbox(id) {
    const ids = (state.photoTag === '全部' ? state.photos : state.photos.filter((p) => (p.tags || []).includes(state.photoTag))).map((p) => p.id);
    state.lightbox = { ids, index: Math.max(0, ids.indexOf(id)) };
    drawLightbox();
  }
  function drawLightbox() {
    const lb = state.lightbox;
    closeLightbox();
    state.lightbox = lb;
    const p = state.photos.find((x) => x.id === lb.ids[lb.index]);
    if (!p) return;
    const node = document.createElement('div');
    node.id = 'lightbox-layer';
    node.className = 'lightbox';
    node.innerHTML = `<button class="lightbox-close" data-action="lightbox-close">${icon('close')}</button>
      ${lb.ids.length > 1 ? `<button class="lightbox-nav prev" data-action="lightbox-prev">${icon('left')}</button><button class="lightbox-nav next" data-action="lightbox-next">${icon('right')}</button>` : ''}
      <div><img src="${p.data}" alt="${esc(p.caption || '')}" /><div class="lightbox-cap">${esc(p.caption || '未命名照片')} · ${lb.index + 1}/${lb.ids.length}</div></div>`;
    document.body.appendChild(node);
  }
  function closeLightbox() { const n = $('#lightbox-layer'); if (n) n.remove(); state.lightbox = null; }
  function stepLightbox(delta) {
    if (!state.lightbox) return;
    state.lightbox.index = (state.lightbox.index + delta + state.lightbox.ids.length) % state.lightbox.ids.length;
    drawLightbox();
  }

  /* ---------- 全局事件 ---------- */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('.nav-item');
    if (nav) { state.page = nav.dataset.page; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const quick = e.target.closest('[data-quick]');
    if (quick) { quick.dataset.quick === 'photo' ? openPhotoUpload() : openClassForm(''); return; }
    if (e.target.classList.contains('modal-backdrop')) { closeModal(); return; }
    const el = e.target.closest('[data-action]');
    if (el) { e.preventDefault(); handleAction(el.dataset.action, el); }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (form) { e.preventDefault(); submitForm(form); }
  });

  let searchTimer;
  document.addEventListener('input', (e) => {
    if (e.target.dataset.input === 'class-search') {
      clearTimeout(searchTimer);
      const value = e.target.value;
      searchTimer = setTimeout(() => { state.classSearch = value; render(); const input = $('[data-input="class-search"]'); if (input) { input.focus(); input.setSelectionRange(value.length, value.length); } }, 250);
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'photo-file') {
      handleFiles(Array.from(e.target.files), 'photo');
      e.target.value = '';
    }
    if (e.target.id === 'item-file') {
      handleFiles(Array.from(e.target.files), 'item');
      e.target.value = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (state.lightbox) closeLightbox(); else closeModal(); }
    if (state.lightbox && e.key === 'ArrowLeft') stepLightbox(-1);
    if (state.lightbox && e.key === 'ArrowRight') stepLightbox(1);
  });

  /* ---------- 启动 ---------- */
  loadAll().then(render);
})();
