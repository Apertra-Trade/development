/* Apertra workspace: Request to Buy flow (buy, import, pay into escrow).
   Demo logic with in-memory state, mirroring the New Shipment wizard. */
(function () {
  var SUPPLIERS = {
    prairie: {
      name: 'Prairie Grains Co.', loc: 'Saskatoon, Canada', corridor: 'Domestic Canada',
      route: 'Saskatoon to Toronto · Domestic Canada · 3 to 5 days by road · No border crossing',
      freightRate: 0.055, freightMin: 160, taxRate: 0,
      dutyNote: 'Domestic movement inside Canada, so there is no customs duty and no border entry. Taxes are handled on the supplier invoice as usual.',
      note: 'Verified exporter · Identity, banking and two trade references checked · Typically confirms requests the same business day',
      products: {
        oats:   { label: 'Rolled oats, 25 kg bags', unit: 18.40, unitLabel: 'per bag', hs: '1104.12' },
        barley: { label: 'Barley flour, 20 kg bags', unit: 15.20, unitLabel: 'per bag', hs: '1102.90' },
        wheat:  { label: 'Hard red wheat, 25 kg bags', unit: 16.75, unitLabel: 'per bag', hs: '1001.99' }
      }
    },
    coastal: {
      name: 'Coastal Catch Seafood', loc: 'Halifax, Canada', corridor: 'Domestic Canada',
      route: 'Halifax to Toronto · Domestic Canada · 4 to 6 days refrigerated road · No border crossing',
      freightRate: 0.07, freightMin: 220, taxRate: 0,
      dutyNote: 'Domestic movement inside Canada, so there is no customs duty and no border entry. Cold chain is tracked end to end.',
      note: 'Verified exporter · Identity, banking and CFIA facility checks on file · Typically confirms within 1 business day',
      products: {
        salmon:   { label: 'Atlantic salmon portions, 10 kg cases', unit: 189.00, unitLabel: 'per case', hs: '0304.41' },
        haddock:  { label: 'Haddock fillets, 10 kg cases', unit: 142.00, unitLabel: 'per case', hs: '0304.72' },
        scallops: { label: 'Sea scallops, 5 kg cases', unit: 268.00, unitLabel: 'per case', hs: '0307.22' }
      }
    },
    alpine: {
      name: 'Alpine Pantry GmbH', loc: 'Munich, Europe', corridor: 'Europe to Canada · CETA',
      route: 'Munich to Toronto · Europe to Canada corridor · CETA · 12 to 16 days ocean and rail · Customs entry pre-lodged by Apertra',
      freightRate: 0.115, freightMin: 340, taxRate: 0.05,
      dutyNote: 'CETA gives 0% duty on these lines into Canada. The 5% GST shown is collected at entry and is recoverable as an input tax credit, so it is a cash-flow item, not a cost.',
      note: 'Verified exporter · Identity, banking and EU export record checked · Typically confirms within 1 business day',
      products: {
        cheese: { label: 'Alpine cheese selection, 12 kg cases', unit: 236.00, unitLabel: 'per case', hs: '0406.90' },
        meats:  { label: 'Cured meats assortment, 10 kg cases', unit: 198.00, unitLabel: 'per case', hs: '0210.19' },
        choc:   { label: 'Swiss-style chocolate, 8 kg cases', unit: 164.00, unitLabel: 'per case', hs: '1806.32' }
      }
    }
  };
  var WIN_MULT = { flex: 1, '2w': 1.08, '1w': 1.22 };
  var step = 1, nextId = 1042, submitted = false;

  function el(id) { return document.getElementById(id); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }
  function supplier() { return SUPPLIERS[el('buy-supplier').value]; }
  function product() { return supplier().products[el('buy-product').value]; }

  function fillProducts() {
    var s = supplier(), sel = el('buy-product'), html = '';
    Object.keys(s.products).forEach(function (k) {
      var pr = s.products[k];
      html += '<option value="' + k + '">' + pr.label + ' · ' + money(pr.unit) + ' ' + pr.unitLabel + '</option>';
    });
    sel.innerHTML = html;
    updateStep1();
  }
  function updateStep1() {
    var pr = product();
    el('buy-unit-box').innerHTML = '<b>' + money(pr.unit) + '</b> ' + pr.unitLabel + ' · HS ' + pr.hs;
    el('buy-supplier-note').textContent = supplier().note;
  }
  function totals() {
    var s = supplier(), pr = product();
    var qty = Math.max(1, parseInt(el('buy-qty').value, 10) || 0);
    var goods = qty * pr.unit;
    var win = el('buy-window') ? el('buy-window').value : 'flex';
    var freight = Math.max(goods * s.freightRate, s.freightMin) * (WIN_MULT[win] || 1);
    var tax = goods * (s.taxRate || 0);
    var ddp = !el('buy-terms') || el('buy-terms').value === 'ddp';
    var insurance = goods * 0.004;
    var fee = goods * 0.0125;
    var total = goods + freight + insurance + fee + (ddp ? tax : 0);
    return { qty: qty, goods: goods, freight: freight, tax: tax, ddp: ddp, insurance: insurance, fee: fee, total: total };
  }
  function costRows(t, forPay) {
    var s = supplier(), pr = product();
    var rows = '<div><span>Goods · ' + pr.label + ' × ' + t.qty.toLocaleString('en-CA') + '</span><span>' + money(t.goods) + '</span></div>' +
      '<div><span>Freight · ' + s.corridor + '</span><span>' + money(t.freight) + '</span></div>' +
      '<div><span>Duty</span><span>$0 · ' + (s.taxRate ? 'CETA 0%' : 'Domestic') + '</span></div>';
    if (s.taxRate) rows += '<div><span>Border GST 5% (recoverable)' + (t.ddp ? '' : ' · paid by you at entry') + '</span><span>' + money(t.tax) + '</span></div>';
    rows += '<div><span>Cargo insurance</span><span>' + money(t.insurance) + '</span></div>' +
      '<div><span>Apertra transaction fee (1.25%)</span><span>' + money(t.fee) + '</span></div>' +
      '<div><span>' + (forPay ? 'Due into escrow today' : 'Total landed cost') + '</span><span>' + money(t.total) + '</span></div>';
    return rows;
  }
  function renderStep3() {
    var t = totals();
    el('buy-cost-table').innerHTML = costRows(t, false);
    el('buy-duty-note').textContent = supplier().dutyNote;
    el('buy-route-box').textContent = supplier().route;
  }
  function renderStep4() {
    var t = totals();
    el('buy-pay-table').innerHTML = costRows(t, true);
    el('buy-next').textContent = 'Pay ' + money(t.total) + ' into escrow';
  }
  function go(n) {
    step = n;
    document.querySelectorAll('[data-buy-panel]').forEach(function (pn) {
      pn.classList.toggle('active', parseInt(pn.getAttribute('data-buy-panel'), 10) === n);
    });
    document.querySelectorAll('[data-bdot]').forEach(function (d) {
      var k = parseInt(d.getAttribute('data-bdot'), 10);
      d.classList.toggle('active', k === n);
      d.classList.toggle('done', k < n);
    });
    el('buy-back').style.visibility = n === 1 ? 'hidden' : 'visible';
    el('buy-nav').classList.toggle('hide', n === 5);
    el('buy-next').textContent = n === 4 ? '' : (n === 3 ? 'Continue to payment' : 'Continue');
    if (n === 3) renderStep3();
    if (n === 4) renderStep4();
    var body = document.querySelector('#buy-modal .ship-modal-body');
    if (body) body.scrollTop = 0;
  }
  function openBuy() {
    var m = el('buy-modal');
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (!submitted) go(1);
  }
  function closeBuy() {
    var m = el('buy-modal');
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function submit() {
    var t = totals(), s = supplier(), pr = product();
    var id = 'RB-' + (nextId++);
    var btn = el('buy-next');
    btn.disabled = true; btn.textContent = 'Funding escrow…';
    setTimeout(function () {
      btn.disabled = false;
      submitted = true;
      el('buy-success-id').textContent = id;
      el('buy-success-line').textContent = money(t.total) + ' is now held in escrow for ' + pr.label + ' × ' + t.qty.toLocaleString('en-CA') + ' from ' + s.name + '. What happens next: ' + s.name + ' confirms the request and creates the shipment for it. It appears in your Shipments with documents and tracking, and escrow releases to them only after the goods clear customs and are delivered to you.';
      var tb = el('buy-req-tbody');
      if (tb) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td class="mono">' + id + '</td><td>' + s.name + ' · ' + s.loc.split(',')[0] + '</td><td>' + pr.label + ', ' + t.qty.toLocaleString('en-CA') + '</td><td class="num">' + Math.round(t.total).toLocaleString('en-CA') + '</td><td><span class="status st-amber">Sent to supplier · escrow funded</span></td>';
        tb.insertBefore(tr, tb.firstChild);
      }
      go(5);
    }, 900);
  }

  document.querySelectorAll('[data-buy-open]').forEach(function (b) {
    b.addEventListener('click', function (ev) { ev.preventDefault(); submitted = false; openBuy(); });
  });
  document.querySelectorAll('[data-close-buy]').forEach(function (b) {
    b.addEventListener('click', function (ev) { ev.preventDefault(); closeBuy(); });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && el('buy-modal').classList.contains('open')) closeBuy();
  });
  el('buy-supplier').addEventListener('change', fillProducts);
  el('buy-product').addEventListener('change', updateStep1);
  el('buy-qty').addEventListener('input', updateStep1);
  el('buy-back').addEventListener('click', function () { if (step > 1) go(step - 1); });
  el('buy-next').addEventListener('click', function () {
    if (step === 4) { submit(); return; }
    if (step < 4) go(step + 1);
  });
  el('buy-view-requests').addEventListener('click', function () {
    closeBuy();
    showPaneById('shipments');
    var panel = el('buy-requests-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  fillProducts();
  go(1);
})();
