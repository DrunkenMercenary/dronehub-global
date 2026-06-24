# DroneHub - SOW Gap Analysis & UX Review

Date: 21 June 2026
Covers: how the current build maps to your Scope of Work, plus a review of wording,
layout, and colour.

---

## Part 1 - SOW gap analysis

Short version: the build is a strong Phase 1 foundation and the tech stack matches your
SOW's recommended architecture almost exactly (Next.js, Tailwind, Node/server actions,
PostgreSQL, S3 storage, role-based access). Interestingly it has already built part of your
**Phase 2** (the full job -> proposal -> award -> messaging loop), while a few **Phase 1**
discovery items are still missing (public browse, search/filters, ratings, regulatory info).

Legend: Covered / Partial / Missing

| SOW area | Status | Notes |
|---|---|---|
| 4.1 Multi-role accounts | Partial | Build has Client, Operator, Admin. SOW wants four roles (Pilot, Service Provider, End User, Admin). The build folds Pilot + Service Provider into one "Operator" with an Individual/Company type. Workable, not fully separated. |
| 4.1 Guided role-based onboarding | Covered | Separate operator and client registration flows. |
| 4.1 Identity & credential verification | Partial | Admin approve/reject works. Document upload now works, but the onboarding form does not yet collect licence/insurance files (it's only on job deliverables). |
| 4.2 Structured profile builder | Partial | Operator profile captures services, radius, description, company, fleet size. No richer structured fields yet. |
| 4.2 Portfolio media (photos/videos) | Missing | Upload system exists but is not wired to a profile portfolio gallery. |
| 4.2 Company profile pages | Missing | There are no public profile pages at all yet. |
| 4.3 Rules-based matching | Covered | Category + approved-status matching, with the taxonomy bug fixed. |
| 4.3 Location / geo matching | Partial | Schema stores lat/lng/radius; matching is category-only so far. |
| 4.4 Search & advanced filters | Missing | No search bar or filter UI (geography, certification, industry). |
| 4.4 Public browse / discovery | Missing | No public operator directory. |
| 4.5 Ratings & reviews | Missing | No review model or UI anywhere. |
| 4.6 Job posting | Covered | Full posting form. |
| 4.6 Proposal / quotation workflow | Covered | Operators bid, clients review. |
| 4.6 Acceptance / contract | Covered | Award flow, losing bids auto-rejected. |
| 4.6 Project tracking dashboard | Partial | Status is Open/Awarded; dashboards are basic. |
| 4.7 Payments & billing | Missing | Intentionally deferred (matches SOW Phase 2). Stack is ready for Stripe. |
| 4.8 Regulatory information module | Missing | Nothing yet. This is the one SOW Phase 1 item with no foundation. |
| 4.9 In-platform messaging | Covered | Per-job thread between client and awarded operator. |
| 4.9 Notifications (email + in-app) | Missing | No notifications of any kind yet. |
| 4.10 Admin moderation | Covered | Operator review queue. |
| 4.10 Content management (regulations) | Missing | No CMS. |
| 4.10 Analytics dashboard | Partial | Basic counts only (users, jobs, volume). |
| NFR: Cloud / scalable | Covered | Neon Postgres + Railway; horizontally scalable. |
| NFR: Security (RBAC, auth, encryption) | Partial | NextAuth, role guards, hashed passwords. Deeper identity/GDPR is later. |
| NFR: Mobile responsive | Mostly | Tailwind responsive; worth a dedicated mobile pass. |
| NFR: Multi-language | Missing | Future phase, as per SOW. |

### The six gaps that matter most to hit SOW Phase 1
1. **Public discovery** - browse operators + public profile pages + search/filter.
2. **Ratings & reviews** - the trust layer the SOW leans on heavily.
3. **Credential upload at onboarding** - wire the working upload into the operator sign-up and a documents vault.
4. **Regulatory info module** - even a simple country-filtered content library.
5. **Notifications** - at least in-app (new proposal, awarded, new message).
6. **Portfolio media** on profiles.

None of these are big unknowns. The hard plumbing (auth, DB, uploads, matching, deploy) is done.

---

## Part 2 - Wording & branding review

Your instinct is right. The military "Mission Command" theme is distinctive and has energy,
but for corporate buyers (real estate, solar, surveying, construction, agriculture, government)
it reads as costume rather than credibility, and in places it is genuinely confusing. The fix
is not to make it boring; it's to keep the sleek dark look and swap the cosplay vocabulary for
clear, confident, plain language. Clarity is what builds trust with a business client.

### "Commander Entry" - this one is actually a bug, not just tone
On the login page the demo box shows "Pilot Entry" (`pilot@`) and "Commander Entry"
(`commander@`). But `commander@` is the **Admin** account, and it's shown with a briefcase
(business) icon, and there's no client example at all. So the one label is mislabelled, the
icon implies the wrong thing, and a real client sees no relevant option. On top of that, the
heading "Demo Protocols (DB Offline Access)" is inaccurate (the database is online).

Recommendation: in production, remove the demo-credentials box entirely (it also exposes the
admin email publicly). For internal testing, relabel plainly: Admin / Operator / Client.

### Suggested copy changes (current -> clearer)

| Where | Current | Suggested |
|---|---|---|
| Login title | Command Login / Secure Authentication | Sign in |
| Login subtext | Establish a secure uplink to begin operations | Sign in to your account |
| Login button | Authorize Entry | Sign in |
| Register CTA | Enlist Here / Enlist in the Fleet | Create an account / Join as an operator |
| Operator submit | Initiate Onboarding / Transmitting Credentials | Submit profile / Submitting... |
| Operator bio field | Pilot Dossier | About you / Experience |
| Services field | Mission Specialties | Services offered |
| Radius field | Operational Radius | Service radius |
| Post job page | Deploy a New Mission | Post a job |
| Job description | Mission Briefing | Job description |
| Job button | Deploy Mission / Transmitting Briefing | Post job / Posting... |
| Messaging header | Mission Command - Secure Link / Mission Comms | Messages |
| Messaging subtext | End-to-end Encrypted Transmission | (remove, or "Messages about this job") |
| Proposal button | Authorize Bid Submission | Submit proposal |
| Role words | Commander / Pilot | Client / Operator (keep "Pilot" only where it literally means the drone pilot) |

You can still keep a light, confident edge ("operators", "jobs", a sharp tagline). The goal is
to remove anything a procurement manager would screenshot and laugh at.

---

## Part 3 - Formatting overlap

The most likely culprit (and the one visible in your screenshot of the "PENDING / Submitted On"
block) is on the job detail page. The status badge is absolutely positioned in the top-right
corner of the proposal card and sits on top of the "Submitted On" column, so on narrower widths
the badge overlaps the date. The same pattern appears on the client-side proposal cards.

Fix is small: make the badge part of the normal layout (a flex row at the top) instead of an
absolute overlay, or reserve top padding in that column. I can sweep the app for other overlaps
at the same time (a few of the all-caps, wide letter-spacing labels also clip on mobile).

---

## Part 4 - Colour & visual direction

Current palette: near-black background (#0a0d11), dark cards (#12171e), one teal-green accent
(#17ad96). It's moody and consistent, but a single neon accent plus heavy all-caps italics
leans "gaming" more than "trusted B2B marketplace".

Bringing in orange is a good call. Three directions (I'll show these visually next):

1. **Warm industrial** - keep the dark base, replace teal with a confident orange (#F97316)
   as the single accent. Energetic, drone/industrial feel, still bold.
2. **Dual-tone trust** (my recommendation) - dark slate base, orange for primary actions
   (buttons, key highlights), a cool steel-blue/teal as a calm secondary, neutral greys for
   text. Orange draws the eye to actions; the cool tones keep it credible.
3. **Light corporate** - white/very-light surfaces, charcoal text, orange accent. The most
   conventionally "trustworthy enterprise" look; furthest from the current vibe.

Visual improvements beyond colour, in priority order:
- Reduce ALL-CAPS + wide letter-spacing on body and labels; reserve it for small eyebrow labels only. It's currently hurting readability.
- Dial back the italics and the heaviest font weights; use them as accents, not defaults.
- Establish clear semantic colours: green = success/approved, amber = pending, red = rejected/error. (Right now pending uses the brand teal, which muddies meaning.)
- Add real trust signals the SOW wants: verified badge, star ratings, portfolio thumbnails.
- Tighten the spacing scale so cards and badges stop colliding.

---

## Suggested next build order

1. De-militarise the copy + fix "Commander Entry" + remove/relabel the demo box (fast, high impact).
2. Fix the overlap and do a mobile/readability pass.
3. Apply the chosen colour direction + semantic status colours.
4. Then the SOW Phase 1 gaps: public browse + profiles + search/filter, then ratings, then credential upload at onboarding, then regulatory content, then notifications.

Items 1-3 are quick wins that make it demo-ready for a corporate audience. Item 4 is the larger
roadmap to full SOW Phase 1.
