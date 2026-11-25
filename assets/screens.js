/* Apertra workspace: detail screens (shipment, product form, document viewer,
   notifications, help, reports, security, corridor) */
(function () {
  function toast(msg) {
    var t = document.getElementById('ws-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, 3400);
  }
  function go(id) { if (window.showPaneById) showPaneById(id); }
  function esc(s) { return String(s == null ? '' : s); }

  /* ---------------- Shipment detail ---------------- */
  var STEPS = ['Booked', 'Documents ready', 'In transit', 'Customs', 'Delivered'];
  var SHIPMENTS = {
    'AP-2041': { goods: 'Maple syrup, 1,200 cases', route: 'Toronto → Chicago', partner: 'Great Lakes Grocery, Chicago', value: 48200, status: 'Action needed', step: 1, hs: '1702.20', weight: '14,400 kg', incoterm: 'DAP Chicago', escrow: 'Funded · releases on delivery', note: 'A revised bilingual nutrition label is required before this shipment can move. Upload it in Documents and freight releases automatically.', freight: 2650, fee: 603 },
    'AP-2038': { goods: 'Honey jars, 800 cases', route: 'Toronto → Rotterdam', partner: 'De Markt BV, Rotterdam', value: 31600, status: 'In transit', step: 2, hs: '0409.00', weight: '9,600 kg', incoterm: 'DAP Rotterdam', escrow: 'Funded · releases on delivery', note: 'On the water, arriving Rotterdam November 28. Documents pre-lodged with EU customs.', freight: 2210, fee: 395 },
    'AP-2035': { goods: 'Pantry gift sets, 450 units', route: 'Montreal → London', partner: 'Borough Pantry, London', value: 22900, status: 'Delivered', step: 4, hs: 'Mixed (by component)', weight: '2,850 kg', incoterm: 'DAP London', escrow: 'Releasing November 18', note: 'Cleared UK customs November 16 and delivered the same day. Escrow releases November 18.', freight: 1740, fee: 286 },
    'AP-2031': { goods: 'Maple syrup, 900 cases', route: 'Toronto → Detroit', partner: 'Great Lakes Grocery, Detroit DC', value: 36400, status: 'Delivered', step: 4, hs: '1702.20', weight: '10,800 kg', incoterm: 'DAP Detroit', escrow: 'Paid out November 10', note: 'Delivered and paid. Full audit trail retained for seven years.', freight: 1980, fee: 455 },
    'AP-2027': { goods: 'Skincare gift sets (trial)', route: 'Toronto → Hamburg', partner: 'Alpine Pantry GmbH, Munich', value: 14750, status: 'Delivered', step: 4, hs: '3304.99', weight: '1,120 kg', incoterm: 'DAP Hamburg', escrow: 'Paid out October 31', note: 'Trial shipment delivered October 29 and paid October 31.', freight: 1290, fee: 184 }
  };
  function money(n) { return '$' + n.toLocaleString('en-CA'); }
  window.openShipment = function (id) {
    var s = SHIPMENTS[id];
    if (!s) { toast('Shipment ' + id + ' is not part of this demo data set.'); return; }
    document.getElementById('sh-title').textContent = 'Shipment ' + id;
    document.getElementById('sh-sub').textContent = s.goods + ' · ' + s.route;
    document.getElementById('sh-status').innerHTML = '<span class="status ' + (s.step >= 4 ? 'st-green' : (s.status === 'Action needed' ? 'st-amber' : 'st-blue')) + '">' + s.status + '</span>';
    document.getElementById('sh-steps').innerHTML = STEPS.map(function (label, i) {
      return '<div class="apx-step' + (i <= s.step ? ' done' : '') + '"><i></i><span>' + label + '</span></div>';
    }).join('<div class="apx-link"></div>');
    document.getElementById('sh-note').textContent = s.note;
    document.getElementById('sh-fields').innerHTML =
      '<div class="ana-line"><span>Buyer</span><b>' + s.partner + '</b></div>' +
      '<div class="ana-line"><span>Route</span><b>' + s.route + '</b></div>' +
      '<div class="ana-line"><span>HS code</span><b class="mono">' + s.hs + '</b></div>' +
      '<div class="ana-line"><span>Gross weight</span><b>' + s.weight + '</b></div>' +
      '<div class="ana-line"><span>Incoterm</span><b>' + s.incoterm + '</b></div>' +
      '<div class="ana-line"><span>Escrow</span><b>' + s.escrow + '</b></div>';
    document.getElementById('sh-costs').innerHTML =
      '<div><span>Goods</span><b>' + money(s.value) + '</b></div>' +
      '<div><span>Freight</span><b>' + money(s.freight) + '</b></div>' +
      '<div><span>Apertra fee (1.25%)</span><b>' + money(s.fee) + '</b></div>' +
      '<div><span>Landed total</span><b>' + money(s.value + s.freight + s.fee) + '</b></div>';
    go('shipment');
  };

  /* ---------------- Product add / edit ---------------- */
  var editingRow = null;
  window.openProductForm = function (row) {
    editingRow = row || null;
    document.getElementById('pf-title').textContent = row ? 'Edit product' : 'Add product';
    document.getElementById('pf-name').value = row ? row.querySelector('td b').textContent : '';
    document.getElementById('pf-desc').value = row ? (row.querySelector('td small') ? row.querySelector('td small').textContent : '') : '';
    document.getElementById('pf-hs').value = row ? row.querySelector('td.mono').textContent.replace('Mixed', '') : '';
    var av = row ? row.querySelector('.prod-avail') : null;
    var qm = av ? av.textContent.match(/[\d,]+/) : null;
    document.getElementById('pf-qty').value = qm ? qm[0].replace(/,/g, '') : '';
    if (window._pfPhotoReset) window._pfPhotoReset();
    var ex = row ? row.querySelector('.prod-thumb') : null;
    if (ex) { var pi = document.getElementById('pf-photo-preview'); pi.src = ex.src; pi.hidden = false; }
    document.getElementById('pf-hs-note').textContent = row ? 'Classification on file, with its reasoning kept for audit.' : 'Leave the HS code blank and Apertra will suggest one from the name and description for your review. Nothing is filed without your approval.';
    go('product-form');
  };
  document.addEventListener('click', function (e) {
    var sh = e.target.closest('[data-shipment]');
    if (sh) { openShipment(sh.getAttribute('data-shipment')); return; }
    var pe = e.target.closest('[data-product-edit]');
    if (pe) { openProductForm(pe.closest('tr')); return; }
    var pn = e.target.closest('[data-product-new]');
    if (pn) { openProductForm(null); return; }
    var doc = e.target.closest('[data-doc]');
    if (doc) { openDoc(doc.getAttribute('data-doc')); return; }
    var cor = e.target.closest('[data-corridor]');
    if (cor) { openCorridor(cor); return; }
    if (e.target.closest('[data-invite-open]')) { document.getElementById('invite-modal').classList.add('open'); return; }
    if (e.target.closest('[data-modal-close]')) { e.target.closest('.ship-modal').classList.remove('open'); return; }
  });
  var pfSave = document.getElementById('pf-save');
  if (pfSave) pfSave.addEventListener('click', function () {
    var name = document.getElementById('pf-name').value.trim();
    if (!name) { toast('Give the product a name first.'); return; }
    var hs = document.getElementById('pf-hs').value.trim();
    if (editingRow) {
      editingRow.querySelector('td b').textContent = name;
      var sm = editingRow.querySelector('td small');
      if (sm) sm.textContent = document.getElementById('pf-desc').value;
      if (hs) editingRow.querySelector('td.mono').textContent = hs;
      var qv = document.getElementById('pf-qty').value;
      var avc = editingRow.querySelector('.prod-avail');
      if (avc && qv !== '') avc.textContent = Number(qv).toLocaleString('en-CA') + ' ' + document.getElementById('pf-unit').value.toLowerCase();
      var pd = window._pfPhoto ? window._pfPhoto() : null;
      if (pd) {
        var cell = editingRow.querySelector('td');
        var th = cell.querySelector('.prod-thumb');
        if (!th) { th = document.createElement('img'); th.className = 'prod-thumb'; th.alt = ''; cell.insertBefore(th, cell.firstChild); }
        th.src = pd;
      }
      toast('Product saved. ' + name + ' is updated in your catalogue.');
    } else {
      var tb = document.querySelector('#pane-products tbody');
      var tr = document.createElement('tr');
      var qv2 = document.getElementById('pf-qty').value;
      var pd2 = window._pfPhoto ? window._pfPhoto() : null;
      tr.innerHTML = '<td>' + (pd2 ? '<img class="prod-thumb" alt="" src="' + pd2 + '">' : '') + '<b>' + esc(name) + '</b><br><small style="color:var(--muted)">' + esc(document.getElementById('pf-desc').value) + '</small></td><td class="mono">' + (hs ? esc(hs) : 'Classifying') + '</td><td>To confirm</td><td>To confirm</td><td>To confirm</td><td class="prod-avail">' + (qv2 !== '' ? Number(qv2).toLocaleString('en-CA') + ' ' + document.getElementById('pf-unit').value.toLowerCase() : 'Ask') + '</td><td><span class="status st-blue">Classifying</span></td><td><button type="button" class="dl" data-product-edit>Edit</button></td>';
      tb.insertBefore(tr, tb.firstChild);
      toast(hs ? 'Product added with HS code ' + hs + '.' : 'Product added. Apertra is suggesting an HS code for your review.');
    }
    go('products');
  });

  /* ---------------- Document viewer ---------------- */
  var DOCS = {
    invoice: { title: 'Commercial invoice · AP-2041', body: '<div class="doc-row"><b>Northwind Foods Co.</b><span>Toronto, Canada · Exporter</span></div><div class="doc-row"><b>Great Lakes Grocery</b><span>Chicago, United States · Importer</span></div><table class="doc-table"><tr><th>Description</th><th>HS</th><th>Qty</th><th class="num">Amount</th></tr><tr><td>Maple syrup, 500 ml bottles, 1,200 cases</td><td class="mono">1702.20</td><td>1,200</td><td class="num">$48,200</td></tr></table><p class="doc-total">Total: $48,200 CAD · Incoterm DAP Chicago · Country of origin: Canada</p><p class="doc-sign">Signed electronically, November 20, 2026 · Apertra audit ref AP-2041-INV</p>' },
    cert: { title: 'CUSMA certificate of origin · AP-2041', body: '<p>I certify that the goods described below are originating goods under the Canada-United States-Mexico Agreement (CUSMA).</p><table class="doc-table"><tr><th>Description</th><th>HS</th><th>Origin criterion</th></tr><tr><td>Maple syrup, 500 ml bottles</td><td class="mono">1702.20</td><td>Wholly obtained in Canada</td></tr></table><p>Blanket period: November 1, 2026 to October 31, 2027 · Exporter: Northwind Foods Co., Toronto</p><p class="doc-sign">Certifier signature on file · Apertra audit ref AP-2041-CUSMA</p>' },
    packing: { title: 'Packing list · AP-2041', body: '<table class="doc-table"><tr><th>Package</th><th>Contents</th><th class="num">Gross weight</th></tr><tr><td>40 pallets</td><td>Maple syrup, 500 ml, 30 cases per pallet</td><td class="num">14,400 kg</td></tr><tr><td>Total</td><td>1,200 cases</td><td class="num">14,400 kg</td></tr></table><p>Marks: NWF-CHI-2041 · Handling: keep upright, food grade</p><p class="doc-sign">Prepared November 20, 2026 · Apertra audit ref AP-2041-PKL</p>' },
    fda: { title: 'FDA prior notice · 26-8841', body: '<p>Prior notice of imported food, submitted to the U.S. Food and Drug Administration before arrival.</p><table class="doc-table"><tr><th>Field</th><th>Detail</th></tr><tr><td>Confirmation</td><td class="mono">26-8841</td></tr><tr><td>Article</td><td>Maple syrup, 500 ml bottles</td></tr><tr><td>Facility</td><td>Northwind Foods Co., Toronto (registration on file)</td></tr><tr><td>Arrival</td><td>Chicago, by road, on clearance of AP-2041</td></tr></table><p class="doc-sign">Submitted November 21, 2026 · Status: accepted</p>' }
  };
  window.openDoc = function (key) {
    var d = DOCS[key];
    if (!d) return;
    document.getElementById('doc-title').textContent = d.title;
    document.getElementById('doc-paper').innerHTML = d.body;
    document.getElementById('doc-modal').classList.add('open');
  };

  /* ---------------- Corridor detail ---------------- */
  var CORRIDORS = {
    'Canada to United States': { duty: '0% under CUSMA for most food and farm goods', transit: '2 to 6 days, road and rail', volume: '$231,000 in November', count: '14 shipments this quarter', reqs: ['CUSMA certificate of origin', 'FDA prior notice for food shipments', 'Bilingual labels for retail goods'] },
    'Canada to Europe': { duty: '0% under CETA for most food and farm goods', transit: '9 to 14 days, ocean', volume: '$118,000 in November', count: '11 shipments this quarter', reqs: ['CETA origin declaration', 'EU importer of record', 'Phytosanitary certificate for plant products'] },
    'Canada to Australia': { duty: '0% under CPTPP for most food and farm goods', transit: '14 to 21 days, ocean', volume: 'No volume yet this quarter', count: 'New corridor for Northwind', reqs: ['CPTPP origin declaration', 'Australian importer of record and ABN', 'Biosecurity inspection on arrival for food products'] }
  };
  window.openCorridor = function (btn) {
    var row = btn.closest('.wsr-row');
    var title = row.querySelector('b').textContent;
    var agree = row.querySelector('.wsr-agree').textContent;
    var c = CORRIDORS[title] || { duty: 'Preferential rate under ' + agree + ' for qualifying goods', transit: 'Varies by mode', volume: 'No volume yet this quarter', count: 'New corridor for Northwind', reqs: ['Origin declaration under ' + agree, 'Importer of record in the destination', 'Product classification review before first shipment'] };
    document.getElementById('co-title').textContent = title;
    document.getElementById('co-agree').textContent = agree;
    document.getElementById('co-summary').innerHTML =
      '<div><b>' + c.duty.split(' for ')[0] + '</b><span>' + c.duty + '</span></div>' +
      '<div><b>' + c.transit.split(',')[0] + '</b><span>typical transit, ' + c.transit + '</span></div>' +
      '<div><b>' + c.volume.split(' in ')[0] + '</b><span>your volume ' + (c.volume.split(' in ')[1] ? 'in ' + c.volume.split(' in ')[1] : 'this quarter') + '</span></div>' +
      '<div><b>' + c.count.split(' ')[0] + '</b><span>' + c.count + '</span></div>';
    document.getElementById('co-reqs').innerHTML = c.reqs.map(function (r) { return '<div class="ana-line"><span>' + r + '</span><span class="status st-green">On file</span></div>'; }).join('');
    go('corridor');
  };

  /* ---------------- Notifications ---------------- */
  var markAll = document.getElementById('notif-mark-all');
  if (markAll) markAll.addEventListener('click', function () {
    document.querySelectorAll('#pane-notifications .notif-row.unread').forEach(function (r) { r.classList.remove('unread'); });
    document.querySelectorAll('#pane-notifications .notif-dot').forEach(function (d) { d.style.visibility = 'hidden'; });
    var b = document.getElementById('notif-badge'); if (b) b.style.display = 'none';
    var tb = document.getElementById('topbar-notif'); if (tb) tb.textContent = 'Notifications';
    toast('All notifications marked as read.');
  });

  /* ---------------- Reports ---------------- */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  var REPORTS = {
    trade: function () { return 'Shipment,Route,Goods,Value CAD,Status\nAP-2041,Toronto to Chicago,"Maple syrup, 1,200 cases",48200,Action needed\nAP-2038,Toronto to Rotterdam,"Honey jars, 800 cases",31600,In transit\nAP-2035,Montreal to London,"Pantry gift sets, 450 units",22900,Delivered\nAP-2031,Toronto to Detroit,"Maple syrup, 900 cases",36400,Delivered\nAP-2027,Toronto to Hamburg,"Skincare gift sets (trial)",14750,Delivered\n'; },
    fees: function () { return 'Invoice,Period,Membership,Transaction fees,Credit applied,Total paid\nINV-2026-11,November 2026,749,2914,-749,2914\nINV-2026-10,October 2026,749,2952,-749,2952\nINV-2026-09,September 2026,749,2613,-749,2613\nINV-2026-08,August 2026,749,2161,-749,2161\n'; },
    corridors: function () { return 'Corridor,Agreement,Volume November CAD,Shipments this quarter\nCanada to United States,CUSMA,231000,14\nCanada to Netherlands,CETA,74500,6\nCanada to United Kingdom,Canada-UK TCA,63800,5\n'; },
    compliance: function () { return 'Document,Shipment,Type,Status\nAP-2041 commercial invoice,AP-2041,Commercial invoice,Signed\nAP-2041 CUSMA certificate,AP-2041,Certificate of origin,Signed\nAP-2041 packing list,AP-2041,Packing list,Signed\nFDA prior notice 26-8841,AP-2041,FDA prior notice,Accepted\n'; }
  };
  document.querySelectorAll('[data-report]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-report');
      download('apertra-' + k + '-report.csv', REPORTS[k]());
      toast('Report downloaded as a CSV file.');
    });
  });
  var expAll = document.getElementById('export-all');
  if (expAll) expAll.addEventListener('click', function () {
    download('apertra-export.json', JSON.stringify({ company: 'Northwind Foods Co.', plan: 'Scale', shipments: Object.keys(SHIPMENTS).length, exported: '2026-11-23' }, null, 2), 'application/json');
    toast('Your data export has downloaded as JSON.');
  });

  /* ---------------- Help, invite, security ---------------- */
  var hs = document.getElementById('help-send');
  if (hs) hs.addEventListener('click', function () {
    var msg = document.getElementById('help-msg');
    if (!msg.value.trim()) { toast('Write a few words about what you need and we will pick it up.'); return; }
    msg.value = '';
    toast('Message sent. Support replies within one business day, usually much faster.');
  });
  var inv = document.getElementById('invite-send');
  if (inv) inv.addEventListener('click', function () {
    var email = document.getElementById('invite-email');
    if (!email.value.trim() || email.value.indexOf('@') < 0) { toast('Enter a work email to send the invite.'); return; }
    var role = document.getElementById('invite-role').value;
    var body = document.querySelector('[data-invite-open]').closest('.panel-body');
    var line = document.createElement('div');
    line.className = 'ana-line';
    line.innerHTML = '<span><b>' + esc(email.value.trim()) + '</b> · Invited</span><span class="status st-amber">' + esc(role) + ' · Pending</span>';
    body.insertBefore(line, body.querySelector('[data-invite-open]'));
    email.value = '';
    document.getElementById('invite-modal').classList.remove('open');
    toast('Invite sent. They will get an email to join Northwind Foods Co. on Apertra.');
  });
  var pinv = document.getElementById('pinv-send');
  if (pinv) pinv.addEventListener('click', function () {
    var name = document.getElementById('pinv-name');
    var email = document.getElementById('pinv-email');
    if (!name.value.trim()) { toast('Add the business name first.'); return; }
    if (!email.value.trim() || email.value.indexOf('@') < 0) { toast('Enter the contact email for the invite.'); return; }
    var country = document.getElementById('pinv-country').value;
    var roleSel = document.getElementById('pinv-role');
    var role = roleSel.value;
    var roleLabel = role === 'buyer' ? 'Buyer' : (role === 'importer' ? 'Importer' : 'Exporter');
    var roleClass = role === 'buyer' ? 'amber' : (role === 'importer' ? 'blue' : 'green');
    var grid = document.getElementById('net-grid');
    if (grid) {
      var card = document.createElement('div');
      card.className = 'net-card';
      card.setAttribute('data-role', role);
      card.setAttribute('data-connected', '0');
      card.setAttribute('data-search', (name.value.trim() + ' ' + country + ' ' + roleLabel + ' invite pending').toLowerCase());
      card.innerHTML = '<img class="net-thumb" src="assets/img-01.jpg" alt="Photo representing ' + esc(name.value.trim()) + ', invited to Apertra">' +
        '<div><span class="tag ' + roleClass + '">' + roleLabel + '</span> <span class="tag">Invite sent</span></div>' +
        '<h3>' + esc(name.value.trim()) + '</h3>' +
        '<p class="net-meta">' + esc(country) + ' · Invited by email</p>' +
        '<p>Invitation sent to ' + esc(email.value.trim()) + '. When they join Apertra and complete verification, they become a connection and you can trade on shared shipment records.</p>' +
        '<div class="net-foot"><span class="match-score">INVITE PENDING</span></div>';
      grid.insertBefore(card, grid.firstChild);
    }
    document.getElementById('pinvite-modal').classList.remove('open');
    toast('Invite sent to ' + name.value.trim() + '. They appear in your network as a pending invite.');
    name.value = ''; email.value = ''; document.getElementById('pinv-note').value = '';
  });
  var pw = document.getElementById('pw-save');
  if (pw) pw.addEventListener('click', function () {
    var n = document.getElementById('pw-new').value, c = document.getElementById('pw-confirm').value;
    if (!document.getElementById('pw-current').value) { toast('Enter your current password first.'); return; }
    if (n.length < 10) { toast('Use at least 10 characters for the new password.'); return; }
    if (n !== c) { toast('The new passwords do not match.'); return; }
    document.getElementById('pw-current').value = ''; document.getElementById('pw-new').value = ''; document.getElementById('pw-confirm').value = '';
    toast('Password updated. Other sessions stay signed in for 24 hours, then re-check.');
  });
  document.querySelectorAll('[data-revoke]').forEach(function (b) {
    b.addEventListener('click', function () {
      b.closest('.ana-line').style.opacity = '.45';
      b.textContent = 'Revoked'; b.disabled = true;
      toast('Session revoked. That device will need to sign in again.');
    });
  });
})();

  /* Search: placeholder follows the chosen category */
  var PLACEHOLDERS = { shipments: 'Search by ID, goods or route', partners: 'Search partners by name, city or product', corridors: 'Search corridors, e.g. rotterdam or CETA' };
  document.querySelectorAll('.ws-cat').forEach(function (b) {
    b.addEventListener('click', function () {
      var q = document.getElementById('ws-q');
      if (q) { q.placeholder = PLACEHOLDERS[b.getAttribute('data-cat')] || PLACEHOLDERS.shipments; q.focus(); }
    });
  });
  var seg = document.getElementById('ws-seg-shipments');
  if (seg) seg.addEventListener('click', function () {
    var q = document.getElementById('ws-q');
    if (q) q.placeholder = PLACEHOLDERS.shipments;
  });

  /* Product photo picker */
  var pfPhotoData = null;
  var pfPhoto = document.getElementById('pf-photo');
  if (pfPhoto) pfPhoto.addEventListener('change', function () {
    var f = pfPhoto.files && pfPhoto.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      pfPhotoData = r.result;
      var img = document.getElementById('pf-photo-preview');
      img.src = pfPhotoData; img.hidden = false;
    };
    r.readAsDataURL(f);
  });
  window._pfPhoto = function () { return pfPhotoData; };
  window._pfPhotoReset = function () {
    pfPhotoData = null;
    var img = document.getElementById('pf-photo-preview');
    if (img) { img.hidden = true; img.removeAttribute('src'); }
    if (pfPhoto) pfPhoto.value = '';
  };

  /* Company media: photos + hosted video embed */
  var coInput = document.getElementById('co-photo-input');
  if (coInput) coInput.addEventListener('change', function () {
    var grid = document.getElementById('co-photos');
    Array.prototype.forEach.call(coInput.files || [], function (f) {
      var r = new FileReader();
      r.onload = function () {
        var fig = document.createElement('figure');
        fig.innerHTML = '<img alt="Company photo"><figcaption>New photo</figcaption>';
        fig.querySelector('img').src = r.result;
        grid.appendChild(fig);
      };
      r.readAsDataURL(f);
    });
    if (coInput.files && coInput.files.length) toast('Photos added to your company profile.');
  });
  var coAdd = document.getElementById('co-video-add');
  if (coAdd) coAdd.addEventListener('click', function () {
    var url = document.getElementById('co-video-url').value.trim();
    var embed = null;
    var my = url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/);
    var mv = url.match(/vimeo\.com\/(\d+)/);
    if (my) embed = 'https://www.youtube.com/embed/' + my[1];
    else if (mv) embed = 'https://player.vimeo.com/video/' + mv[1];
    if (!embed) { toast('Paste a YouTube or Vimeo link and the video will embed here.'); return; }
    document.getElementById('co-video-frame').src = embed;
    document.getElementById('co-video-wrap').hidden = false;
    toast('Video added. It plays from its host, nothing is stored on Apertra.');
  });
