# FieldOps Client API Integration Contract

> Generated from the supplied Postman collection. This document is intended for another LLM/developer agent to integrate the API into the existing frontend. It describes only what is present in the supplied collection; response schemas are not defined because the collection contains no saved example responses.

## 1. Integration Rules

- The API is multi-tenant.
- Each tenant has its own workspace/base URL, for example `https://demo.fieldops.africa`.
- Login must be performed against the correct tenant base URL.
- All `/agent/*` requests require `Authorization: Bearer <access_token>`.
- JSON requests use `Content-Type: application/json`.
- Requests involving files use `multipart/form-data`; do not manually set the multipart `Content-Type` header when using `FormData`.
- Preserve the existing frontend UI and navigation. Replace mock/static data and actions with API calls without redesigning screens unless the existing code requires it.
- Do not invent response fields. The Postman collection does not provide saved response examples.

## 2. Environment / Variables

| Variable | Default / Example | Purpose |
|---|---|---|
| `tenant_base_domain` | `fieldops.africa` | Tenant domain |
| `tenant_subdomain` | `demo` | Tenant/workspace subdomain |
| `tenant_id` | `{{tenant_subdomain}}` | Tenant ID sent during login |
| `base_url` | `https://{{tenant_subdomain}}.{{tenant_base_domain}}` | API base URL |
| `access_token` | empty | Bearer token returned by login |
| `campaign_id` | `12` | Active campaign |
| `lead_id` | `LEAD-00001` | Lead identifier |
| `opp_id` | `CRM-OPP-2026-00001` | Opportunity identifier |
| `survey_id` | `SUR-00001` | Survey identifier |
| `journey_map_id` | `1` | Journey map identifier |
| `sale_id` | `SALE-00001` | Sales order identifier |
| `inventory_id` | `FINV-00001` | Inventory identifier |
| `outlet_id` | `OUT-00001` | Outlet identifier |

### Base URL

Production-style tenant URL:
```text
https://<tenant_subdomain>.<tenant_base_domain>
```

Local development may use:
```text
http://localhost:8000
```

## 3. Authentication

### POST `/auth/login`

**Purpose:** Authenticate an agent against the selected tenant.

Headers:
```http
Accept: application/json
Content-Type: application/json
```

Request body:
```json
{"email":"agent1@example.com","password":"YOUR_PASSWORD_HERE","tenantID":"<tenant_id>"}
```

Frontend integration:
1. Send login credentials plus `tenantID`.
2. Read the token from one of the locations supported by the Postman test: `access_token`, `data.access_token`, or `message.access_token`.
3. Persist the token using the frontend's existing auth/token mechanism.
4. Attach `Authorization: Bearer <token>` to every `/agent/*` request.

## 4. API Endpoint Reference

### Campaigns

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/agent/campaigns` | Fetch all campaigns |
| `GET` | `/agent/campaigns/{campaign_id}` | Fetch a single campaign |
| `GET` | `/agent/campaigns/{campaign_id}/inventory` | Fetch campaign inventory |
| `GET` | `/agent/inventory/{inventory_id}` | Fetch single inventory detail |

### Leads

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/agent/campaigns/{campaign_id}/leads` | Create a campaign lead |
| `GET` | `/agent/campaigns/{campaign_id}/leads` | Fetch campaign leads |
| `GET` | `/agent/campaigns/{campaign_id}/leads/{lead_id}` | Fetch a single campaign lead |
| `GET` | `/agent/leads` | Fetch all leads belonging to the current agent |

#### `POST /agent/campaigns/{campaign_id}/leads`

Example request body:
```json
{"coordinates":{"lat":6.626099,"lng":3.348386},"first_name":"Michael","last_name":"Mac","email":"michael@example.com","phone":"09000000000"}
```

### Opportunities

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/agent/campaigns/{campaign_id}/opportunities` | Create an opportunity |
| `GET` | `/agent/campaigns/{campaign_id}/opportunities` | Fetch campaign opportunities |
| `POST` | `/agent/campaigns/{campaign_id}/opportunities/{opp_id}/status` | Update opportunity status |

#### `POST /agent/campaigns/{campaign_id}/opportunities`

Example request body:
```json
{"lead_id":"<lead_id>","offering_id":13,"stage_id":8,"data":{"name":"Babalola","email":"babs@g.com","phone":"09039948855","address":"My house"}}
```

#### `POST /agent/campaigns/{campaign_id}/opportunities/{opp_id}/status`

Example request body:
```json
{"stage_id":7}
```

### Surveys

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/agent/campaigns/{campaign_id}/surveys` | Fetch campaign surveys |
| `GET` | `/agent/surveys/{survey_id}` | Fetch survey detail including questions |
| `POST` | `/agent/campaigns/{campaign_id}/surveys/{survey_id}` | Submit survey response |

#### `POST /agent/campaigns/{campaign_id}/surveys/{survey_id}`

Example request body:
```json
{"first_name":"Babalola","last_name":"Tester","email":"babs@g.com","phone":"09039948855","lead_id":25,"data":{"q1":"Yes","q2":5},"coordinates":{"lat":"6.626099","lng":"3.348386"}}
```

### Sales Orders

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/agent/campaigns/{campaign_id}/sales-orders` | Create sales order |
| `GET` | `/agent/sales/{sale_id}` | Fetch single sale detail |
| `POST` | `/agent/campaigns/{campaign_id}/sales-orders` | Create secondary sales order |

#### `POST /agent/campaigns/{campaign_id}/sales-orders`

Example request body:
```json
{"coordinates":{"lat":6.626099,"lng":3.348386},"products":[{"product_id":1,"quantity":2}],"opportunity_id":null,"lead_id":null,"outlet_id":null,"client_order_id":"TEST-ORDER-001"}
```

#### `POST /agent/campaigns/{campaign_id}/sales-orders`

Example request body:
```json
{"coordinates":{"lat":6.626099,"lng":3.348386},"products":[{"product_id":1,"quantity":1}],"outlet_id":"<outlet_id>","client_order_id":"TEST-ORDER-SEC-001"}
```

### Journey Maps

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/agent/journey-maps` | Fetch journey maps |
| `GET` | `/agent/journey-maps/{journey_map_id}` | Fetch a single journey map |

### Attendance

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/agent/attendance/clock-in` | Clock in (multipart/form-data) |
| `POST` | `/agent/attendance/clock-out` | Clock out (multipart/form-data) |

#### `POST /agent/attendance/clock-in`

FormData: coordinates = JSON string {"lat":"28.537","lng":"76.256"}; image = optional file

#### `POST /agent/attendance/clock-out`

FormData: coordinates = JSON string {"lat":"28.537","lng":"76.256"}; image = optional file

### Outlet Utilities

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/agent/outlets/types` | Fetch outlet types |
| `GET` | `/agent/outlets/sub-types` | Fetch outlet sub-types |
| `GET` | `/agent/outlets/categories` | Fetch outlet categories |
| `GET` | `/agent/outlets/business-categories` | Fetch outlet business categories |

### Outlets

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/agent/outlets/{outlet_id}` | Fetch single outlet detail |
| `POST` | `/agent/outlets` | Create outlet (multipart/form-data) |

#### `POST /agent/outlets`

Example request body:
```json
See detailed form fields below
```

## 5. Outlet Creation FormData

`POST /agent/outlets` uses `multipart/form-data`.

| Field | Example | Type / Notes |
|---|---|---|
| `name` | `New outlet in area` | text |
| `type` | `Retail` | text |
| `category` | `1` | text |
| `business_category` | `1` | text |
| `coordinates[lat]` | `6.626099004121543` | text |
| `coordinates[lng]` | `3.3483865005651516` | text |
| `images[]` | `file` | file; multiple files supported |
| `address` | `2, Junior estate, In front of Ecobank.` | text |
| `city_id` | `1` | text |
| `state_id` | `1` | text |
| `country_id` | `1` | text |
| `phone` | `09022930044` | text |
| `email` | `new-business@gmail.com` | text |
| `regitration_number` | `SDSJ938328932` | text; preserve this exact API field spelling |
| `campaign_id` | `{campaign_id}` | text |
| `contact_person[name]` | `Johnson Ronaldo` | text |
| `contact_person[phone]` | `08022939944` | text |
| `contact_person[email]` | `jronaldo@gmail.com` | text |
| `zone_id` | `9` | text |
| `region_id` | `4` | text |
| `area_id` | `1` | text |

The Postman collection captures the created outlet ID from `data.outlet_id`, `data.data.outlet_id`, or `outlet_id` when available.

## 6. ID Capture / Data Flow

The Postman collection expects the frontend integration to maintain identifiers between related operations:

```text
Login
  -> access_token
  -> Fetch campaigns
  -> campaign_id
      -> Leads -> lead_id
      -> Opportunities -> opp_id
      -> Surveys -> survey_id
      -> Sales Orders -> sale_id
      -> Inventory -> inventory_id
      -> Outlets -> outlet_id
Fetch Journey Maps -> journey_map_id
```

For list endpoints, the Postman tests use the first item to populate an ID variable. Do not blindly copy that behavior into production UI if the frontend allows the user to select a specific campaign, lead, survey, inventory item, or journey map; use the user's selected record.

## 7. Frontend API Client Requirements

Implement a centralized API client/service rather than calling `fetch` directly throughout screens.

Recommended responsibilities:
- Resolve the tenant-specific `base_url`.
- Add the bearer token automatically for `/agent/*` requests.
- Serialize JSON bodies for JSON endpoints.
- Use `FormData` for attendance and outlet image uploads.
- Centralize HTTP error handling.
- Keep API types/interfaces separate from screen components.
- Expose domain methods such as `login()`, `getCampaigns()`, `getCampaign()`, `getLeads()`, `createLead()`, `getOpportunities()`, `createOpportunity()`, `updateOpportunityStatus()`, `getSurveys()`, `getSurvey()`, `submitSurvey()`, `createSalesOrder()`, `getSale()`, `getJourneyMaps()`, `getInventory()`, `clockIn()`, `clockOut()`, `getOutletTypes()`, `getOutletCategories()`, `getOutlet()`, and `createOutlet()`.

## 8. Authentication Header

For every protected request:
```http
Authorization: Bearer <access_token>
Accept: application/json
```

For JSON POST requests also use:
```http
Content-Type: application/json
```

For multipart requests, construct `FormData` and let the HTTP client/browser set the multipart boundary.

## 9. Important Unknowns

The supplied Postman collection contains request definitions and tests, but no saved response examples. Therefore the following are **not defined by the source** and must not be guessed:
- Complete response object schemas for campaigns, leads, opportunities, surveys, sales, inventory, journey maps, outlets, and attendance.
- Exact HTTP status codes for endpoints other than the login test, which explicitly expects HTTP 200.
- Pagination parameters or response pagination structure.
- Server-side validation/error response shape.
- Required/optional status values beyond the example request bodies.
- Whether numeric IDs are always numbers or can be strings.

If the backend/API documentation supplies these details later, update the frontend API types and validation from that documentation.

## 10. Integration Checklist

- [ ] Create a tenant-aware API base URL configuration.
- [ ] Implement login and token persistence.
- [ ] Add automatic bearer authentication to protected requests.
- [ ] Replace campaign mock data with `GET /agent/campaigns`.
- [ ] Connect campaign detail and campaign inventory.
- [ ] Connect lead list/detail/create flows.
- [ ] Connect opportunity list/create/status-update flows.
- [ ] Connect survey list/detail/submission flows.
- [ ] Connect sales-order creation and sale-detail flows.
- [ ] Connect journey-map list/detail flows.
- [ ] Connect attendance clock-in/clock-out with optional image upload.
- [ ] Connect outlet utility dropdowns.
- [ ] Connect outlet detail and outlet creation with multiple images.
- [ ] Keep loading, empty, error, and retry states in the existing UI.
- [ ] Do not invent response schemas where the contract is silent.

## Source

This integration contract was derived from the supplied Postman collection, `FieldOps_Client_API_Contract_Testing.postman_collection1.json`. The collection identifies itself as a client contract-testing collection for `/auth/*` and `/agent/*` routes and defines the tenant variables and bearer-token flow. fileciteturn0file0L2-L25
