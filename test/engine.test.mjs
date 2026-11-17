import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCALES,
  formatKes,
  formatPhone,
  segmentation,
  dataWeight,
  campaignCost,
  localize,
  campaign,
  missingFields,
} from '../engine.mjs';

const brief = {
  intent: 'new_stock',
  product: 'Gas cooker 13kg',
  shop: 'Mama Njeri Stores',
  price: 4500,
  town: 'Nakuru',
  phone: '0712345678',
  until: 'Friday',
};

test('KES prices are grouped the way a receipt shows them', () => {
  assert.equal(formatKes(4500), 'KES 4,500');
  assert.equal(formatKes('1250000'), 'KES 1,250,000');
  assert.equal(formatKes(undefined), 'KES 0');
});

test('every Kenyan mobile format collapses to 07XX XXX XXX', () => {
  for (const input of ['0712345678', '712345678', '254712345678', '+254 712 345 678']) {
    assert.equal(formatPhone(input), '0712 345 678');
  }
  assert.equal(formatPhone('12345'), '12345');
});

test('plain Swahili stays GSM-7 and costs one segment', () => {
  const result = segmentation('Bei ni KES 4,500. Piga 0712 345 678.');
  assert.equal(result.encoding, 'GSM-7');
  assert.equal(result.segments, 1);
});

test('one non-GSM character flips the whole message to UCS-2 and doubles the price', () => {
  const plain = segmentation('a'.repeat(160));
  assert.equal(plain.encoding, 'GSM-7');
  assert.equal(plain.segments, 1);

  const curly = segmentation(`${'a'.repeat(159)}\u2019`);
  assert.equal(curly.encoding, 'UCS-2');
  assert.equal(curly.segments, 3, '160 UCS-2 characters need three segments');

  const emoji = segmentation('Ofa poa \u{1F525}');
  assert.equal(emoji.encoding, 'UCS-2');
});

test('multipart GSM-7 uses 153-character segments', () => {
  const result = segmentation('a'.repeat(161));
  assert.equal(result.segments, 2);
  assert.equal(result.perSegment, 153);
});

test('a brief localises into all three languages with every slot filled', () => {
  const out = campaign(brief, 200);
  assert.deepEqual(out.map((item) => item.locale), [...LOCALES]);
  for (const item of out) {
    assert.ok(item.text.length > 20, `${item.locale} message is too short`);
    assert.ok(!item.text.includes('{'), `${item.locale} has an unfilled slot`);
    assert.ok(item.text.includes('4,500'), `${item.locale} lost the price`);
    assert.ok(item.text.includes('0712 345 678'), `${item.locale} lost the phone`);
  }
});

test('Sheng and Kiswahili are genuinely different messages', () => {
  const sw = localize(brief, 'sw');
  const sheng = localize(brief, 'sheng');
  assert.notEqual(sw, sheng);
});

test('variant selection is deterministic and wraps', () => {
  assert.equal(localize(brief, 'en', 0), localize(brief, 'en', 2));
  assert.notEqual(localize(brief, 'en', 0), localize(brief, 'en', 1));
});

test('unknown locale or intent throws instead of shipping a blank message', () => {
  assert.throws(() => localize(brief, 'fr'), /Unknown locale/);
  assert.throws(() => localize({ ...brief, intent: 'nope' }, 'en'), /Unknown intent/);
});

test('a text campaign is far lighter than the product photo it replaces', () => {
  const { bytes } = dataWeight(localize(brief, 'sheng'));
  assert.ok(bytes < 400, `expected under 400 bytes, got ${bytes}`);

  const cost = campaignCost(localize(brief, 'sheng'), 200);
  assert.equal(cost.recipients, 200);
  assert.ok(cost.copiesPerPhoto > 900, 'one photo should equal many campaigns');
  assert.ok(cost.kes < 1, `a 200-person text blast should cost cents, got ${cost.kes}`);
});

test('missing fields are reported before a shop can send', () => {
  assert.deepEqual(missingFields(brief), []);
  assert.deepEqual(missingFields({ ...brief, phone: '' }), ['phone']);
  assert.deepEqual(missingFields({ ...brief, town: '  ' }), [], 'town is optional here');
  assert.deepEqual(
    missingFields({ ...brief, intent: 'free_delivery', town: '' }),
    ['town'],
  );
});
