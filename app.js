import {
  INTENTS,
  INTENT_LABELS,
  campaign,
  missingFields,
} from './engine.mjs';

const form = document.getElementById('brief');
const intentEl = document.getElementById('intent');
const cardsEl = document.getElementById('cards');
const hintEl = document.getElementById('hint');

for (const intent of INTENTS) {
  const opt = document.createElement('option');
  opt.value = intent;
  opt.textContent = INTENT_LABELS[intent];
  intentEl.append(opt);
}
intentEl.value = 'new_stock';

function readBrief() {
  const data = Object.fromEntries(new FormData(form));
  return {
    intent: data.intent,
    product: data.product,
    shop: data.shop,
    price: data.price,
    town: data.town,
    phone: data.phone,
    until: data.until,
    recipients: Number(data.recipients) || 1,
  };
}

function card(item) {
  const el = document.createElement('article');
  el.className = 'card';

  const head = document.createElement('div');
  head.className = 'card-head';

  const lang = document.createElement('span');
  lang.className = 'lang';
  lang.textContent = item.label;

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'copy';
  copy.textContent = 'Copy';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(item.text);
      copy.textContent = 'Copied';
      copy.classList.add('done');
      setTimeout(() => {
        copy.textContent = 'Copy';
        copy.classList.remove('done');
      }, 1400);
    } catch {
      copy.textContent = 'Select & copy';
    }
  });

  head.append(lang, copy);

  const msg = document.createElement('p');
  msg.className = 'msg';
  msg.textContent = item.text;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = [
    `SMS <b>${item.sms.segments}</b> segment${item.sms.segments === 1 ? '' : 's'} · ${item.sms.encoding}`,
    `<b>${item.sms.units}</b>/${item.sms.capacity} chars`,
    `<b>0.${String(Math.round(item.cost.bytes)).padStart(3, '0')} KB</b> per message`,
  ].join('<span aria-hidden="true">·</span>');

  el.append(head, msg, meta);
  return el;
}

function render() {
  const brief = readBrief();
  const missing = missingFields(brief);

  if (missing.length) {
    hintEl.textContent = `Still needed: ${missing.join(', ')}`;
  } else {
    hintEl.textContent = '';
  }

  cardsEl.replaceChildren(...campaign(brief, brief.recipients).map(card));

  if (missing.length) {
    hintEl.textContent = `Still needed: ${missing.join(', ')}`;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});

form.addEventListener('input', render);

render();
