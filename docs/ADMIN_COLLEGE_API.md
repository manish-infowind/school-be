# Admin College API – Integration Guide

This document describes the **admin** College APIs used by the admin panel to list, create, edit, and manage colleges. All endpoints require **authentication** (e.g. Bearer token).

**Base path:** `/api/admin`  
**Auth:** Send the admin JWT in the `Authorization` header, e.g. `Authorization: Bearer <token>`.

---

## 1. List colleges (admin)

**Purpose:** Paginated list of all colleges (including inactive) for admin panel. Supports filters.

### Request

- **Method:** `GET`
- **Path:** `/api/admin/colleges`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Query parameters (all optional):**

| Parameter   | Type   | Default | Description |
|------------|--------|---------|-------------|
| `page`     | number | `1`     | Page number (1-based). |
| `limit`    | number | `10`    | Items per page (1–100). |
| `category` | string | —       | Filter by course category. |
| `stateId`  | string | —       | Filter by state ObjectId (24-char hex). |
| `cityId`   | string | —       | Filter by city ObjectId. |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "colleges": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "slug": "iit-bombay",
        "name": "IIT Bombay",
        "shortName": "IITB",
        "countryId": "...",
        "stateId": "...",
        "cityId": "...",
        "stateName": "Maharashtra",
        "cityName": "Mumbai",
        "locationDisplay": "Mumbai, Maharashtra",
        "category": "Engineering",
        "courses": ["B.Tech", "M.Tech"],
        "fee": "₹2.5L/yr",
        "isActive": true,
        "isVerified": true,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

Each college object includes all stored fields (see College model). Use `_id` for get/update/status/delete.

---

## 2. Get college by ID

**Purpose:** Fetch a single college by MongoDB `_id` for the edit form.

### Request

- **Method:** `GET`
- **Path:** `/api/admin/colleges/:id`
- **Path parameter:** `id` – College document ObjectId (24-char hex).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "iit-bombay",
    "name": "IIT Bombay",
    "shortName": "IITB",
    "countryId": "...",
    "stateId": "...",
    "cityId": "...",
    "stateName": "Maharashtra",
    "cityName": "Mumbai",
    "address": "Powai, Mumbai 400076",
    "pinCode": "400076",
    "locationDisplay": "Mumbai, Maharashtra",
    "category": "Engineering",
    "courses": ["B.Tech", "M.Tech", "MBA"],
    "courseFees": [{ "courseName": "B.Tech", "fee": "₹2.5L/yr", "feeAmount": 250000, "feePeriod": "year" }],
    "badge": "NIRF #1",
    "fee": "₹2.5L/yr",
    "feeAmount": 250000,
    "feePeriod": "year",
    "rating": 4.9,
    "nirfRank": 1,
    "placementRate": 98,
    "avgPackage": "₹18 LPA",
    "description": "...",
    "highlights": ["..."],
    "eligibility": "...",
    "facilities": ["Hostel", "Library"],
    "website": "https://...",
    "phone": "...",
    "email": "...",
    "logoUrl": "...",
    "coverImageUrl": "...",
    "galleryUrls": ["..."],
    "isActive": true,
    "isVerified": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "College not found",
  "code": "COLLEGE_NOT_FOUND"
}
```

---

## 3. Create college

**Purpose:** Add a new college. Slug is auto-generated from name; optional auto-fill of `stateName`, `cityName`, and `locationDisplay` from `stateId`/`cityId`.

### Request

- **Method:** `POST`
- **Path:** `/api/admin/colleges`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:** JSON with college fields (see below).

**Required fields:**

| Field        | Type   | Description |
|--------------|--------|-------------|
| `name`       | string | College name (slug derived from this). |
| `countryId`  | string | Country ObjectId. If omitted, backend may default to India (code IN) when available. |
| `stateId`    | string | State ObjectId. |
| `cityId`    | string | City ObjectId. |
| `stateName`  | string | State name (or omit and send only stateId – backend can fill from State). |
| `cityName`   | string | City name (or omit when cityId sent – backend can fill from City). |
| `locationDisplay` | string | e.g. "Mumbai, Maharashtra" (or omit when stateId/cityId sent – backend can fill). |
| `category`   | string | One of: Engineering, MBA, Medical, Law, Design, Commerce, Pharmacy, Architecture, Data Science, MCA, Private, Autonomous, Government, Deemed, Aided, Other. |

**Optional fields:**  
`shortName`, `address`, `pinCode`, `courses` (string[]), `courseFees` (array of `{ courseName, fee?, feeAmount?, feePeriod? }` – if provided, `courses` is synced from `courseFees[].courseName`), `badge`, `fee`, `feeAmount`, `feePeriod` (year | semester), `rating`, `nirfRank`, `placementRate`, `avgPackage`, `description`, `highlights` (string[]), `eligibility`, `facilities` (string[]), `website`, `phone`, `email`, `logoUrl`, `coverImageUrl`, `galleryUrls` (string[]), `isActive` (default true), `isVerified` (default false).

**Auto-fill behavior:** If you send only `stateId` and `cityId` and omit `stateName`, `cityName`, or `locationDisplay`, the backend resolves names from State/City and sets them so the public API and search work correctly.

### Example body (minimal)

```json
{
  "name": "IIT Bombay",
  "countryId": "507f1f77bcf86cd799439000",
  "stateId": "507f1f77bcf86cd799439011",
  "cityId": "507f1f77bcf86cd799439012",
  "category": "Engineering",
  "courses": ["B.Tech", "M.Tech"]
}
```

Backend will set `stateName`, `cityName`, `locationDisplay` from State/City if not provided.

### Response (201 Created)

```json
{
  "success": true,
  "data": { ... full college document including _id, slug, ... }
}
```

### Validation error (400)

```json
{
  "success": false,
  "error": "name is required"
}
```

Or Mongoose validation message:

```json
{
  "success": false,
  "error": "Validation failed: stateId is required; ..."
}
```

---

## 4. Update college

**Purpose:** Update an existing college by ID. Slug cannot be updated. Sending `stateId`/`cityId` without `stateName`/`cityName`/`locationDisplay` will auto-fill those from State/City.

### Request

- **Method:** `PUT`
- **Path:** `/api/admin/colleges/:id`
- **Path parameter:** `id` – College ObjectId.
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:** JSON with fields to update (partial payload is fine). Do **not** send `slug` – it is ignored.

All create-body fields are allowed (except slug). Arrays: `courses`, `courseFees`, `highlights`, `facilities`, `galleryUrls` are normalized (e.g. empty arrays or trimmed strings).

### Response (200 OK)

```json
{
  "success": true,
  "data": { ... updated college document ... }
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "College not found",
  "code": "COLLEGE_NOT_FOUND"
}
```

### Validation error (400)

Same shape as create.

---

## 5. Update college status (active/inactive)

**Purpose:** Toggle whether the college is shown on the public list. Only active colleges appear in the consumer College List API.

### Request

- **Method:** `PATCH`
- **Path:** `/api/admin/colleges/:id/status`
- **Path parameter:** `id` – College ObjectId.
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**

```json
{
  "isActive": true
}
```

`isActive` must be boolean.

### Response (200 OK)

```json
{
  "success": true,
  "data": { ... college with updated isActive ... },
  "message": "College activated"
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "College not found",
  "code": "COLLEGE_NOT_FOUND"
}
```

### Bad request (400)

```json
{
  "success": false,
  "error": "isActive must be true or false"
}
```

---

## 6. Delete college

**Purpose:** Permanently delete a college.

### Request

- **Method:** `DELETE`
- **Path:** `/api/admin/colleges/:id`
- **Path parameter:** `id` – College ObjectId.

### Response (200 OK)

```json
{
  "success": true,
  "message": "College deleted"
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "College not found",
  "code": "COLLEGE_NOT_FOUND"
}
```

---

## 7. Upload college image (optional)

If your app supports image uploads for logo/cover/gallery:

- **Method:** `POST`
- **Path:** `/api/admin/upload`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body:** Form data with file field(s) as implemented in `adminUploadController`.

Use returned URL(s) in `logoUrl`, `coverImageUrl`, or `galleryUrls` when creating/updating a college.

---

## 8. Errors and status codes

| Status | When | Body |
|--------|------|------|
| 200 | Success (list, get, update, status, delete) | `{ success: true, data: ... }` (and optional `message`) |
| 201 | College created | `{ success: true, data: college }` |
| 400 | Validation / bad request | `{ success: false, error: "..." }` |
| 401 | Missing or invalid auth | As per your auth middleware |
| 404 | College not found (invalid id or deleted) | `{ success: false, error: "College not found", code: "COLLEGE_NOT_FOUND" }` |
| 500 | Server error | `{ success: false, error: "Internal server error" }` |

---

## 9. Quick reference

| Action       | Method | Path                          |
|-------------|--------|-------------------------------|
| List        | GET    | `/api/admin/colleges`         |
| Get by ID   | GET    | `/api/admin/colleges/:id`     |
| Create      | POST   | `/api/admin/colleges`         |
| Update      | PUT    | `/api/admin/colleges/:id`     |
| Toggle status | PATCH | `/api/admin/colleges/:id/status` |
| Delete      | DELETE | `/api/admin/colleges/:id`     |

Use **Consumer API** (`/api/colleges`, `/api/colleges/:slug`) for the public website; use this **Admin API** for the admin panel to manage data. For public-facing integration, see [COLLEGE_API_INTEGRATION.md](./COLLEGE_API_INTEGRATION.md). For **course dropdown** (consumer) and **course management** (admin), see [COURSE_API.md](./COURSE_API.md).
