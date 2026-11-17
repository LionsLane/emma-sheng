# EMMA Sheng

**One campaign brief in, three sendable WhatsApp/SMS messages out — English, Kiswahili and Sheng — with the SMS and data cost worked out before the shop hits send.**

A feature of [EMMA](https://emma.lionslane.co.ke), built for the Cape Code hackathon.

Live demo: **https://emma-sheng.vercel.app**

---

## The African problem

Kenya's small shops do not have a website problem. They have a **language and a bundle** problem.

- **The conversation is in code-switched Sheng, the tools are in English.** A duka owner in Nakuru selling to a customer in Kariobangi writes in a mix of English, Kiswahili and Sheng. Marketing tools that only generate formal English copy land with a shopkeeper's customers about as well as a bank notice.
- **Customers are on WhatsApp, not on a landing page.** The campaign is a message forwarded into a family group, not a click into a funnel.
- **Data is paid for per megabyte.** A 450 KB product photo blast to 200 customers is ~90 MB — real airtime money — while the same offer as text is under 0.4 KB per message.
- **SMS is billed per 160-character segment, and one curly apostrophe or emoji silently triples it**, because the message flips from GSM-7 to UCS-2 encoding. Nobody in a shop is counting that.

So EMMA Sheng does three things in one screen: localise the offer into the three languages customers actually read, keep it short enough to send cheaply, and show the segment and airtime cost *before* the blast goes out.

## What it does

1. Pick the campaign intent (new stock, discount, almost sold out, free delivery, restock, thank you).
2. Fill the brief: product, shop, price in KES, town, phone, offer end date, list size.
3. Get three ready-to-paste messages — English, Kiswahili, Sheng — each with its SMS segment count, encoding (GSM-7 vs UCS-2), character headroom, payload size and what the blast costs in airtime. **Open in WhatsApp** hands the finished message straight to the phone.

The cost model is the real one, not decoration:

| Encoding | Single message | Multipart |
| --- | --- | --- |
| GSM-7 | 160 chars | 153 chars per segment |
| UCS-2 (any emoji or curly quote) | 70 chars | 67 chars per segment |

Data spend is estimated at KES 0.25/MB (roughly a KES 250 / 1 GB Nairobi bundle) and the app tells you how many copies of your message fit inside the data of a single 450 KB product photo. That figure is a payload estimate, not an SMS tariff — operators bill per segment, which is why the segment count is shown next to every message.

## How to run

Requires Node 18+. **No dependencies, no build step, no API key, no database.**

```bash
# 1. clone
git clone https://github.com/LionsLane/emma-sheng.git
cd emma-sheng

# 2. run the tests
npm test

# 3. serve the app
npm run dev
# open http://127.0.0.1:5190
```

Deploying is equally boring: it is static HTML/CSS/JS plus one ES module, so any static host works (`vercel deploy --prod`, Netlify, GitHub Pages, Cloudflare Pages).

### Project layout

```
engine.mjs            localisation bank, SMS segmentation, KES/data cost maths
app.js                UI wiring (imports engine.mjs directly in the browser)
index.html            one screen: brief form + three output cards
styles.css            EMMA clay/saffron palette
test/engine.test.mjs  node:test suite for the engine
scripts/serve.mjs     15-line static server, zero deps
```

## How we kept tokens low

1. **Zero model calls at runtime.** The localiser is a hand-written phrase bank plus a slot-filling grammar — Kiswahili and Sheng copy was authored once, offline, and is now free to run forever. A campaign costs 0 tokens, so a shop on a KES 50 bundle can localise as many campaigns as it wants.
2. **The whole feature ran on one Copilot session, not a conversation.** One brief produced the engine, the 36 localised messages, the GSM-7/UCS-2 segmenter and the tests; the review pass cost **45,861 input / 3,359 output tokens (6 of 200 monthly AI credits)** — no prompt-rewriting loops, no re-generating copy.
3. **No dependencies and no build step.** No package graph to install, no framework boilerplate to generate, no bundler config to debug — the only generated code is the code that runs.

## Tests

`npm test` covers KES grouping, all four Kenyan phone formats, GSM-7 vs UCS-2 segment maths (including the 160-character UCS-2 triple and an emoji billed as two units), 153/67-character multipart splitting, slot filling across all three locales, Sheng and Kiswahili producing genuinely different copy, and payload cost versus a 450 KB product photo.

Copilot's review of the first version flagged that the UCS-2 counter read Unicode code points instead of UTF-16 units, which under-counted segments for any message with an emoji near a 70/67 boundary. That fix and its regression test are in `engine.mjs` and `test/engine.test.mjs`, alongside its Sheng rewrites ("Bei ni fit" → "Bei iko poa", "Donge" → "Ofa iko") and the Open in WhatsApp button it suggested.

## Credits

EMMA Sheng is part of **EMMA**, the marketing assistant from [Lions Lane](https://lionslane.co.ke). Built with GitHub Copilot.
