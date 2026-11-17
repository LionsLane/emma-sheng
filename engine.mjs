/**
 * EMMA Sheng — zero-token campaign localizer engine.
 *
 * One campaign brief in, three sendable WhatsApp/SMS messages out
 * (English, Kiswahili, Sheng) plus the real cost signals a Kenyan duka
 * owner cares about: SMS segments and data spend.
 *
 * No model call, no network, no dependencies. Runs in the browser and in Node.
 */

export const LOCALES = /** @type {const} */ (['en', 'sw', 'sheng']);

export const LOCALE_LABELS = {
  en: 'English',
  sw: 'Kiswahili',
  sheng: 'Sheng',
};

export const INTENTS = /** @type {const} */ (
  ['new_stock', 'discount', 'closing_soon', 'free_delivery', 'restock', 'thank_you']
);

export const INTENT_LABELS = {
  new_stock: 'New stock in',
  discount: 'Discount / offer',
  closing_soon: 'Almost sold out',
  free_delivery: 'Free delivery',
  restock: 'Back in stock',
  thank_you: 'Thank a customer',
};

/** Two hand-written variants per intent per locale — no generation, no tokens. */
const BANK = {
  new_stock: {
    en: [
      'New at {shop}: {product} is in stock right now at {price}. Call {phone} to reserve yours before they finish.',
      '{shop} has just received {product}. Price is {price}. Reserve on {phone} — they move fast.',
    ],
    sw: [
      'Mpya {shop}: {product} imeingia sasa hivi kwa {price}. Piga {phone} kuhifadhi yako kabla hazijaisha.',
      '{shop} imepokea {product} mpya. Bei ni {price}. Hifadhi kwa {phone} haraka.',
    ],
    sheng: [
      'Msee, {shop} kuna stock mpya: {product}. Bei ni {price} tu. Piga {phone} ureserve yako kabla ziishe.',
      '{product} zimeingia {shop} leo. Bei ni fit — {price}. Cheki {phone} upate zako mapema.',
    ],
  },
  discount: {
    en: [
      'Offer at {shop}: {product} is now {price}. This price ends {until}. Call {phone}.',
      '{shop} has cut the price of {product} to {price}. Ends {until} — call {phone}.',
    ],
    sw: [
      'Ofa {shop}: {product} sasa ni {price}. Ofa inaisha {until}. Piga {phone}.',
      'Punguzo {shop}: {product} imeshuka mpaka {price}. Inaisha {until}. Piga {phone}.',
    ],
    sheng: [
      'Donge {shop}! {product} imeshuka mpaka {price}. Hii ofa inaenda {until} — cheki na {phone}.',
      'Bei ni poa {shop}: {product} sasa {price}. Inaisha {until}. Piga {phone} haraka.',
    ],
  },
  closing_soon: {
    en: [
      '{product} at {shop} is almost gone. {price} each. Call {phone} today.',
      'Last few pieces of {product} at {shop} — {price}. Call {phone} before they finish.',
    ],
    sw: [
      '{product} {shop} imebaki kidogo. {price} kila moja. Piga {phone} leo.',
      'Mabaki ya mwisho ya {product} {shop} — {price}. Piga {phone} kabla ya kuisha.',
    ],
    sheng: [
      'Wasee, {product} za {shop} zimebaki chache. {price} tu. Piga {phone} leo kabla ziishe.',
      '{product} {shop} zinaenda haraka — {price}. Piga {phone} saa hii usibaki.',
    ],
  },
  free_delivery: {
    en: [
      'Free delivery in {town} this week from {shop}. Order {product} at {price}. Call {phone}.',
      '{shop} delivers free anywhere in {town} this week. {product} for {price} — call {phone}.',
    ],
    sw: [
      'Usafirishaji bure {town} wiki hii kwa {shop}. Agiza {product} kwa {price}. Piga {phone}.',
      '{shop} inaleta bure {town} wiki hii. {product} kwa {price} — piga {phone}.',
    ],
    sheng: [
      'Delivery ni free {town} mzima wiki hii. Agiza {product} kwa {price} kwa {shop}. Piga {phone}.',
      'Usijali mzigo — {shop} inaleta free {town} wiki hii. {product} ni {price}. Piga {phone}.',
    ],
  },
  restock: {
    en: [
      '{product} is back at {shop}. Same price: {price}. Call {phone}.',
      'Restocked: {product} at {shop} for {price}. Reserve on {phone}.',
    ],
    sw: [
      '{product} imerudi {shop}. Bei ni ile ile: {price}. Piga {phone}.',
      'Tumepokea tena {product} {shop} kwa {price}. Hifadhi kwa {phone}.',
    ],
    sheng: [
      '{product} zimerudi {shop}! Bei ni ile ile ya {price}. Piga {phone} upate zako.',
      'Stock imerudi {shop} — {product} ni {price}. Piga {phone} ukamue mapema.',
    ],
  },
  thank_you: {
    en: [
      'Asante for buying at {shop}. {product} is {price} whenever you need it again — {phone}.',
      'Thank you for choosing {shop}. Need {product} again? It is {price} on {phone}.',
    ],
    sw: [
      'Asante kwa kununua {shop}. {product} ipo kwa {price} wakati wowote — {phone}.',
      'Tunakushukuru kwa kuchagua {shop}. {product} ni {price}, piga {phone}.',
    ],
    sheng: [
      'Asante sana msee kwa kusupport {shop}. {product} ziko {price} time yoyote — {phone}.',
      'Shukran kwa kuunga {shop} mkono. {product} ni {price} ukipiga {phone}.',
    ],
  },
};

const DEFAULT_UNTIL = { en: 'this week', sw: 'wiki hii', sheng: 'wiki hii' };

/** KES formatting: 1250 -> "KES 1,250". */
export function formatKes(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'KES 0';
  return `KES ${Math.round(n).toLocaleString('en-KE')}`;
}

/**
 * Normalise a Kenyan mobile number to 07XX XXX XXX.
 * Accepts 0712345678, 712345678, 254712345678, +254 712 345 678.
 */
export function formatPhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('254')) local = local.slice(3);
  if (local.length === 9) local = `0${local}`;
  if (local.length !== 10) return String(raw ?? '').trim();
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

// --- SMS cost model -------------------------------------------------------
// Operators bill per segment. GSM-7: 160 chars alone, 153 each when split.
// One character outside GSM-7 (a curly quote, an emoji) flips the whole
// message to UCS-2: 70 chars alone, 67 each when split. That flip is the
// single most common way a Kenyan SME pays double for the same campaign.

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = '^{}\\[~]|€';

const GSM7_SET = new Set(GSM7_BASIC);
const GSM7_EXT_SET = new Set(GSM7_EXTENDED);

/** @returns {{encoding:'GSM-7'|'UCS-2', units:number, segments:number, capacity:number, perSegment:number, remaining:number}} */
export function segmentation(text) {
  const value = String(text ?? '');
  let units = 0;
  let gsm = true;

  for (const ch of value) {
    if (GSM7_SET.has(ch)) units += 1;
    else if (GSM7_EXT_SET.has(ch)) units += 2;
    else {
      gsm = false;
      break;
    }
  }

  if (gsm) {
    const segments = units === 0 ? 0 : units <= 160 ? 1 : Math.ceil(units / 153);
    const perSegment = segments <= 1 ? 160 : 153;
    return {
      encoding: 'GSM-7',
      units,
      segments,
      perSegment,
      capacity: segments * perSegment,
      remaining: segments === 0 ? 0 : segments * perSegment - units,
    };
  }

  const cps = [...value].length;
  const segments = cps === 0 ? 0 : cps <= 70 ? 1 : Math.ceil(cps / 67);
  const perSegment = segments <= 1 ? 70 : 67;
  return {
    encoding: 'UCS-2',
    units: cps,
    segments,
    perSegment,
    capacity: segments * perSegment,
    remaining: segments === 0 ? 0 : segments * perSegment - cps,
  };
}

/** Payload weight in bytes (UTF-8) — what the customer's bundle actually pays for. */
export function dataWeight(text) {
  const bytes = new TextEncoder().encode(String(text ?? '')).length;
  return { bytes, kb: bytes / 1024, mb: bytes / (1024 * 1024) };
}

/**
 * What one blast costs the shop in airtime money, at Kenyan retail rates.
 * A 1 GB bundle in Nairobi runs roughly KES 250, so ~KES 0.25 per MB.
 */
export const KES_PER_MB = 0.25;
/** Typical product photo the same shop would otherwise send. */
export const PHOTO_KB = 450;

export function campaignCost(text, recipients = 200) {
  const { bytes, mb } = dataWeight(text);
  const totalMb = mb * recipients;
  return {
    bytes,
    recipients,
    totalMb,
    kes: totalMb * KES_PER_MB,
    /** How many copies of this message fit in the data of one product photo. */
    copiesPerPhoto: bytes === 0 ? 0 : Math.floor((PHOTO_KB * 1024) / bytes),
  };
}

// --- Localisation ---------------------------------------------------------

export function fillSlots(template, slots) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = slots[key];
    return value === undefined || value === null || value === '' ? match : String(value);
  });
}

/**
 * Localise one campaign brief into one locale.
 * Unknown intent throws so a typo can never ship an empty message.
 */
export function localize(brief, locale, variantIndex = 0) {
  if (!LOCALES.includes(locale)) throw new Error(`Unknown locale: ${locale}`);
  const variants = BANK[brief.intent];
  if (!variants) throw new Error(`Unknown intent: ${brief.intent}`);

  const pool = variants[locale];
  const template = pool[variantIndex % pool.length];
  const slots = {
    product: brief.product?.trim(),
    shop: brief.shop?.trim(),
    price: brief.price ? formatKes(brief.price) : '',
    town: brief.town?.trim(),
    phone: formatPhone(brief.phone),
    until: brief.until?.trim() || DEFAULT_UNTIL[locale],
  };
  return fillSlots(template, slots);
}

/** Full brief -> three locales with cost signals attached. */
export function campaign(brief, recipients = 200) {
  return LOCALES.map((locale, i) => {
    const text = localize(brief, locale, i);
    return {
      locale,
      label: LOCALE_LABELS[locale],
      text,
      sms: segmentation(text),
      cost: campaignCost(text, recipients),
    };
  });
}

/** Guard for the UI + tests: what is missing before a message can be sent. */
export function missingFields(brief) {
  const required = {
    new_stock: ['product', 'shop', 'price', 'phone'],
    discount: ['product', 'shop', 'price', 'phone'],
    closing_soon: ['product', 'shop', 'price', 'phone'],
    free_delivery: ['product', 'shop', 'price', 'phone', 'town'],
    restock: ['product', 'shop', 'price', 'phone'],
    thank_you: ['product', 'shop', 'price', 'phone'],
  }[brief.intent] ?? [];
  return required.filter((field) => !String(brief[field] ?? '').trim());
}
