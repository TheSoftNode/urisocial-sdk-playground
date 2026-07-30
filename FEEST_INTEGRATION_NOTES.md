# Feest Social — Integration Alignment Notes

This maps Feest Social's integration brief to what this playground actually
demonstrates against the real, production `@urisocial/sdk`. Every row below
was verified by reading the live SDK resource files and the corresponding
`uri-social-backend` (`main` branch) endpoints — nothing here is aspirational.

Feest can copy this playground's patterns directly: one API key per vendor
platform, `sdk.setEndUserId(vendorId)` per vendor, isolating each vendor's
brand/content/drafts (see `lib/sdk/sdk-provider.tsx`).

## 1. Vendor onboarding / opt-in

| Feest need | Playground reference | Status |
|---|---|---|
| Vendor signs up, connects to platform | `components/access/get-access-gate.tsx` — first authenticated `client.brandProfile.get()` call triggers account creation for this end-user, scoped to your API key | ✅ Supported |
| Submit `business_name`, `category` | `app/dashboard/onboarding/page.tsx` → `client.brandProfile.update({ brand_name, industry, ... })` | ✅ Supported (industry ≈ category) |
| Submit `city` | Onboarding's new "City" field → `brandProfile.update({ region })` | ✅ Supported (mapped to `region`) |
| Submit `logo_url` | `components/dashboard/brand/LogoUpload.tsx` → `client.brandProfile.uploadLogo(file)` then `.update({ logo_url })` | ✅ Supported (separate step, not opt-in) |
| Submit `accent_color` | Onboarding's brand color picker → `brandProfile.update({ brand_colors })` | ✅ Supported (array of colors, not a single accent) |
| One-shot "provision vendor, get account ID back" | — | ❌ **Gap** — accounts resolve implicitly on first authenticated call; there is no dedicated endpoint that takes vendor metadata and returns an explicit account/workspace ID synchronously |

**Note on sequencing**: unlike Feest's brief (single opt-in call with all fields), this SDK's real flow is two calls — the Get Access gate creates the account, then onboarding submits business data. Business data isn't available at signup time, so the gate can't send it in the same call. Feest should call brand-profile update immediately after the first authenticated request rather than expecting a single combined "provision" call.

## 2. Connect social accounts

| Feest need | Playground reference | Status |
|---|---|---|
| OAuth-redirect-then-callback connect flow | `components/dashboard/connections/ConnectionsList.tsx` → `client.connections.initiate()`, `.getPending()`, `.finalize()` | ✅ Supported |
| List connected accounts | `client.connections.list()` | ✅ Supported |
| Disconnect an account | `client.connections.disconnect(accountId)` | ✅ Supported |

## 3. Custom Visual Guides

| Feest need | Playground reference | Status |
|---|---|---|
| Upload reference image, extract style | `app/dashboard/visual-guides/page.tsx` → `client.customGuides.uploadReferenceImage({ image_url, name })` | ✅ Supported (GPT-4o Vision aesthetic + typography extraction) |
| List / view guides | `client.customGuides.listGuides()`, `.getGuide(id)` | ✅ Supported |
| Attach a guide to a campaign | **Not per-request.** Guides attach via a persistent, brand-level selection — `brandProfile.update({ selected_custom_guides: [...] })` — read automatically by every future `content.generate()` call for that brand. See the "Select for brand" toggle on the Visual Guides page and the status banner on the Content Generator page. | ✅ Supported, different shape than Feest's `visual_guide_id`-per-campaign model |
| One-time style bypass without changing the brand's saved guides | `content.generate({ styleOverride: [...] })` | ⚠️ Supported by the API, but **not demoed** — there's no discoverable catalog of valid style slugs (no list-styles endpoint), so this playground can't populate a real picker for it without guessing values |
| Manual `style_preferences` (aesthetic/color_mood/text_style enums), `custom_instructions`, `negative_instructions`, shared template library by category | — | ❌ **Gap** — Custom Visual Guides only support photo-based style extraction today; there's no manual-preference input path or shared/library guide concept |

## 4. AI campaign generation

| Feest need | Playground reference | Status |
|---|---|---|
| Generate content from a seed/brief | `app/dashboard/content/page.tsx` → `client.content.generate({ seedContent, platforms, ... })` | ✅ Supported |
| `attached_product` | New "Attached product / service" field → sent as a one-time `brand_context: { key_products_services: [...] }` override (not saved to the brand profile) | ✅ Supported, different field name than Feest's brief |
| `objective`, `theme` | — | ❌ **Gap** — no dedicated fields; the real `ContentGenerationRequest`/`BrandContextRequest` only accepts `brand_name`, `brand_colors`, `brand_voice`, `target_audience`, `business_description`, `tagline`, `industry`, `key_products_services` as one-time overrides. Objective/theme would need to be folded into the seed content text itself today. |
| `visual_guide_id` per campaign | — | See Section 3 — attachment is persistent/brand-level, not per-campaign |
| Preview before publish | `components/dashboard/content/GeneratedPreview.tsx` renders drafts before any publish action | ✅ Supported |
| Regenerate | `components/dashboard/drafts/DraftCard.tsx` → `client.content.regenerate(draftId)` (new "Regenerate" button) | ✅ Supported |

## 5. Publish / schedule + webhooks

| Feest need | Playground reference | Status |
|---|---|---|
| Publish immediately | `client.publishing.approve({ draft_ids, schedule_option: 'immediate' })` | ✅ Supported |
| Schedule for later | `client.publishing.approve({ draft_ids, schedule_option: 'schedule', scheduled_datetime })` | ✅ Supported |
| Cancel a scheduled post | `client.publishing.cancelScheduled(id)` | ✅ Supported |
| Outbound `campaign.published` / `campaign.failed` webhooks | — | ❌ **Gap** — `SDKClientProfile.webhook_url` exists as a field in the backend but nothing dispatches to it. Zero outbound-webhook code exists anywhere in `uri-social-backend` today (only inbound payment/WhatsApp webhook receivers). Feest would need to poll `drafts.list()`/`publishing` status instead of relying on a push notification. |

## 6. Campaign history

| Feest need | Playground reference | Status |
|---|---|---|
| List past campaigns/drafts | `client.drafts.list()` | ✅ Supported |

## 7. Analytics

| Feest need | Playground reference | Status |
|---|---|---|
| Account-level performance | `client.analytics.getPerformance(startDate, endDate)` | ✅ Supported |
| Per-platform breakdown | `client.analytics.getByPlatform(startDate, endDate)` (now wired into the Analytics page) | ✅ Supported |
| Follower counts/growth per connected account | `client.analytics.getAccountMetrics()` | ✅ Supported |
| Trending topics / recommended hashtags | `client.analytics.getTrends(industry, region)` (now wired into the Analytics page) | ✅ Supported |
| Period-over-period deltas (`change`, `change_percent`) | — | ❌ **Gap** — no delta fields anywhere in the analytics responses |
| Audience demographics (age/gender/city breakdown) | — | ❌ **Gap** — no demographics endpoint exists |
| Time-series / day-by-day charts | — | ❌ **Gap** — no time-series endpoint; only aggregate totals over a date range |
| Single "best performing post" object with real engagement numbers (views/likes/comments) and a thumbnail | — | ⚠️ **Partial** — `getPerformance()` returns a `best_performing_post` object, but it only has `{platform, content, engagement_rate, post_id}` — no views/likes/comments/thumbnail, so it doesn't fit a "top post card" UI without fabricating numbers. Not surfaced in this playground for that reason. |
| Content-performance-by-objective/format | — | ❌ **Gap** — no objective/format dimension exists in any analytics response |

## Summary of genuine backend gaps (do not build around these with fake data)

1. **No outbound webhooks** — `webhook_url` field is stored but never dispatched to.
2. **No manual Visual Guide style input** — photo-upload extraction only; no `style_preferences`/`custom_instructions`/`negative_instructions`/shared template library.
3. **No analytics deltas, demographics, or time-series** — only aggregate totals per date range plus per-platform breakdown.
4. **No one-shot vendor-provisioning endpoint** — account creation is implicit on first authenticated call.
5. **No discoverable style-slug catalog** for `style_override` — the field works but can't be demoed with real options.

If Feest's launch requires any of these, they need to be built in `uri-social-backend` first — set that expectation before they start integrating against this pattern.
