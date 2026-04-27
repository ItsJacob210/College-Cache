# College Cache — User Stories

User stories grouped by persona with completion status and effort estimates.

> **Effort scale:** Story points using a Fibonacci sequence (1 = trivial, 2 = small, 3 = medium, 5 = significant, 8 = large, 13 = very large).
> **Total estimated effort:** 54 points across all stories.

---

## Persona 1: New User

A prospective campus community member (student, faculty, or staff) who does not yet have an account.

| # | User Story | Status | Points | % of Total |
|---|-----------|--------|--------|------------|
| 1.1 | As a new user, I want to register with my university `.edu` email so that only verified campus members can use the platform. | ✅ Complete | 3 | 5.6% |
| 1.2 | As a new user, I want to choose my campus role (Student / Faculty / Staff) during signup so that my identity is clear to other users. | ✅ Complete | 1 | 1.9% |
| 1.3 | As a new user, I want clear inline validation if my email is not a `.edu` address so that I understand why registration was rejected. | ✅ Complete | 2 | 3.7% |

**Subtotal: 6 points (11.1% of project)**

---

## Persona 2: Registered User (General)

Any authenticated campus member browsing the platform.

| # | User Story | Status | Points | % of Total |
|---|-----------|--------|--------|------------|
| 2.1 | As a registered user, I want to sign in with my email and password so that I can access my account. | ✅ Complete | 2 | 3.7% |
| 2.2 | As a registered user, I want to sign out and have my session cleared so that my account is secure on shared devices. | ✅ Complete | 1 | 1.9% |
| 2.3 | As a registered user, I want to see a dashboard feed of all active lost and found reports so that I can quickly scan what has been reported. | ✅ Complete | 3 | 5.6% |
| 2.4 | As a registered user, I want to filter the feed by Lost or Found so that I can focus on the type of reports I care about. | ✅ Complete | 2 | 3.7% |
| 2.5 | As a registered user, I want to receive in-app notifications for events related to my reports and claims so that I am kept up to date without checking manually. | ✅ Complete | 5 | 9.3% |
| 2.6 | As a registered user, I want to mark notifications as read so that my feed stays manageable. | ✅ Complete | 1 | 1.9% |
| 2.7 | As a registered user, I want to edit my profile or update my account details after signup. | ❌ Incomplete | — | — |
| 2.8 | As a registered user, I want to receive email notifications in addition to in-app alerts so that I am notified even when not logged in. | ❌ Incomplete | — | — |

**Subtotal (complete): 14 points (25.9% of project)**

---

## Persona 3: Item Seeker (Lost Something)

A registered user who has lost an item and is looking for it.

| # | User Story | Status | Points | % of Total |
|---|-----------|--------|--------|------------|
| 3.1 | As an item seeker, I want to submit a lost item report with a title, description, category, and general location so that the campus community knows what I am missing. | ✅ Complete | 5 | 9.3% |
| 3.2 | As an item seeker, I want to include an approximate time the item was lost so that finders can check if their timeline matches. | ✅ Complete | 2 | 3.7% |
| 3.3 | As an item seeker, I want to optionally add an image URL to my lost report so that finders can visually recognize the item. | ✅ Complete | 2 | 3.7% |
| 3.4 | As an item seeker, I want to search all active found reports by keyword, category, location, and date range so that I can find items that match what I lost. | ✅ Complete | 8 | 14.8% |
| 3.5 | As an item seeker, I want to view all reports I have submitted so that I can track which of my items are still active. | ✅ Complete | 3 | 5.6% |
| 3.6 | As an item seeker, I want to edit or delete a report I submitted if the situation changes. | ❌ Incomplete | — | — |

**Subtotal (complete): 20 points (37.0% of project)**

---

## Persona 4: Item Finder (Found Something)

A registered user who has found an item and wants to return it to its owner.

| # | User Story | Status | Points | % of Total |
|---|-----------|--------|--------|------------|
| 4.1 | As an item finder, I want to submit a found item report with a title, description, category, and general location so that the owner can be alerted. | ✅ Complete | 5 | 9.3% |
| 4.2 | As an item finder, I want to specify a drop-off method (original location, campus office, locker, or unknown) so that the claimant knows where to retrieve their item. | ✅ Complete | 2 | 3.7% |
| 4.3 | As an item finder, I want my found report to automatically hide exact location, pickup instructions, and the item image from the public so that only the verified owner can see them. | ✅ Complete | 5 | 9.3% |
| 4.4 | As an item finder, I want to review all ownership claims submitted for my found report so that I can judge which one is most convincing. | ✅ Complete | 3 | 5.6% |
| 4.5 | As an item finder, I want to manually approve or reject a pending claim so that I have final say over who receives the item. | ✅ Complete | 3 | 5.6% |
| 4.6 | As an item finder, I want to upload an actual image file for the found item rather than paste a URL. | ❌ Incomplete | — | — |

**Subtotal (complete): 18 points (33.3% of project)**

---

## Persona 5: Claimant (Proving Ownership)

A registered user who believes a found item belongs to them and is trying to claim it.

| # | User Story | Status | Points | % of Total |
|---|-----------|--------|--------|------------|
| 5.1 | As a claimant, I want to submit an ownership claim on a found item by describing identifying features, brand/model, contents, and my approximate loss time so that I can prove the item is mine. | ✅ Complete | 8 | 14.8% |
| 5.2 | As a claimant, I want the system to score my claim automatically based on how well my details match the report so that strong claims are resolved quickly without waiting for manual review. | ✅ Complete | 5 | 9.3% |
| 5.3 | As a claimant, I want to see my claim status (Pending / Approved / Rejected) so that I know where I stand. | ✅ Complete | 2 | 3.7% |
| 5.4 | As a claimant, I want to be shown the exact location, pickup instructions, and item image once my claim is approved so that I know how and where to collect my item. | ✅ Complete | 3 | 5.6% |
| 5.5 | As a claimant, I want to withdraw a claim I submitted if I no longer need it. | ❌ Incomplete | — | — |
| 5.6 | As a claimant, I want to upload supporting proof (receipt, photo) as an actual file attachment rather than pasting text. | ❌ Incomplete | — | — |

**Subtotal (complete): 18 points (33.3% of project)**

---

## Effort Summary

| Persona | Complete Points | Incomplete Stories |
|---------|----------------|--------------------|
| New User | 6 | 0 |
| Registered User (General) | 14 | 2 (profile editing, email notifications) |
| Item Seeker | 20 | 1 (edit/delete report) |
| Item Finder | 18 | 1 (file upload) |
| Claimant | 18 | 2 (claim withdrawal, file attachments) |
| **Total** | **54** | **6 incomplete stories** |

All core flows — signing up, logging in, submitting a lost item, submitting a found item, searching for items, proving ownership, and resolving an item — are implemented and functional. The incomplete stories represent secondary or production-readiness concerns (file uploads, profile editing, email delivery, claim withdrawal) that are out of scope for the current prototype.
