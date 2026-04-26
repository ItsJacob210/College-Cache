# College Cache

A campus lost-and-found platform for verified university users. Built on a vanilla
HTML/CSS/JS frontend with an Express + MongoDB (Mongoose) backend.

## Features

- University-email login (any `@*.edu` address)
- Dashboard feed with All / Lost / Found tabs
- Submit lost-item reports
- Submit found-item reports (sensitive details kept hidden until verification)
- Search and filter (keyword, type, category, area, date range)
- Item detail page with privacy-aware reveal
- Claim flow with mock verification and confidence score
- Manual approve / deny by the reporter
- Mark item as retrieved → resolves the report
- Notifications feed for report & claim events

## Privacy rules enforced server-side

- Public listings never include `exact_location`, `pickup_instructions`, or images
  for found items until a claim is approved.
- Sensitive fields are revealed only when:
  - the requester is the reporter, **or**
  - the requester has an `APPROVED` claim on that item.

## Prerequisites

- Node.js
- A MongoDB database (Atlas or a local instance)

## Setup

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Configure environment**

   Create `server/.env` in the `server` folder (this file is gitignored). The app reads it on startup.

   | Variable        | Required | Description |
   | --------------- | -------- | ----------- |
   | `MONGODB_URI`   | Yes*     | MongoDB connection string (e.g. Atlas `mongodb+srv://...`). Without it, the server starts but database calls will fail. |
   | `DB_NAME`       | No       | Database name. Defaults to `lab` if omitted. |
   | `PORT`          | No       | HTTP port. Defaults to `9000` if omitted. |

   Example:

   ```env
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/?appName=college-cache
   DB_NAME=college-cache
   PORT=9000
   ```

   Use a strong password in the URI and avoid committing `.env` to version control.

## Run

```bash
cd server
npm start
```

Open **http://localhost:9000** (or `http://localhost:<PORT>` if you set `PORT`). The root URL redirects to `login.html`.

## Pages

- `login.html`, `signup.html`
- `dashboard.html`
- `search.html`
- `report-lost.html`, `report-found.html`
- `item-detail.html`
- `claim.html` (verification form + result/pickup reveal)
- `my-reports.html` (profile, my reports, my claims, notifications)

## Data model

- `User` (firstName, lastName, email, password, role, campus)
- `ItemReport` (type, title, description, category, general_location, exact_location,
  radius, item_time, image_url, drop_off_method, pickup_instructions, status)
- `Claim` (item_report_id, claimant_user_id, identifying_features, brand_model,
  contents, approx_loss_time, additional_proof, confidence_score, status)
- `Notification` (user_id, item_report_id, claim_id, message, type, read_status)
