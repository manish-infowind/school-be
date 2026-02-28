# College List & College Details – Consumer API Integration

This document describes how to integrate with the **public** College List and College Details APIs. No authentication is required.

**Base URL (example):** `https://your-api-host.com/api`  
**Content-Type:** `application/json` (responses).

---

## 1. College List API

**Purpose:** Fetch a paginated list of colleges with optional filters, text search, and sorting. Only active colleges (`isActive: true`) are returned.

### Request

- **Method:** `GET`
- **Path:** `/api/colleges`
- **Query parameters (all optional):**

| Parameter   | Type    | Default | Description |
|------------|---------|---------|-------------|
| `page`     | number  | `1`     | Page number (1-based). Invalid or missing → 1. |
| `limit`    | number  | `12`    | Items per page (min 1, max 50). Invalid → 12. |
| `category` | string  | —       | Filter by course category. Use `All` or omit for no category filter. |
| `state`    | string  | —       | Filter by state: slug (e.g. `maharashtra`) or name (e.g. `Maharashtra`). |
| `stateId`  | string  | —       | Filter by state ObjectId (24-char hex). If set, overrides `state`. |
| `city`     | string  | —       | Filter by city: slug or name. |
| `cityId`   | string  | —       | Filter by city ObjectId. If set, overrides `city`. |
| `courseId` | string  | —       | Filter by course ObjectId (24-char hex). Returns colleges that offer this course. Use `_id` from `GET /api/courses`. |
| `search`   | string  | —       | Keyword search (name, location, state, city, courses, etc.). Trimmed; empty = no search. |
| `sort`     | string  | `name_asc` | Sort order (see table below). Invalid → `name_asc`. |
| `verified` | boolean | —       | Filter by verification: `true` = only verified, `false` = only unverified. Omit = both. |

**Sort options:**

| Value        | Description              |
|--------------|--------------------------|
| `name_asc`   | Name A–Z                 |
| `name_desc`  | Name Z–A                 |
| `fee_asc`    | Fee low to high          |
| `fee_desc`   | Fee high to low          |
| `rating_desc`| Highest rating first     |
| `nirf_asc`   | NIRF rank (best first)   |
| `newest`     | Newest first             |
| `relevance`  | Relevance (with search); otherwise same as name_asc |

All provided filters are combined with **AND**.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "colleges": [
      {
        "id": "iit-bombay",
        "name": "IIT Bombay",
        "shortName": "IITB",
        "location": "Mumbai, Maharashtra",
        "state": "Maharashtra",
        "city": "Mumbai",
        "stateId": "507f1f77bcf86cd799439011",
        "cityId": "507f1f77bcf86cd799439012",
        "category": "Engineering",
        "courses": ["B.Tech", "M.Tech", "MBA"],
        "fee": "₹2.5L/yr",
        "badge": "NIRF #1",
        "description": "Short or full description...",
        "logoUrl": "https://...",
        "coverImageUrl": "https://...",
        "isVerified": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

- **`id`** is the college **slug**; use it for links and for the details API (`GET /api/colleges/:id`).
- **`location`** is a display string (e.g. `cityName + ", " + stateName`).
- List items do **not** include: `highlights`, `eligibility`, `facilities`, `website`, `phone`, `email`, `address`, `galleryUrls`, `rating`, `nirfRank`, `placementRate`, `avgPackage` (use the details API for those).

### Validation errors (400)

Invalid `stateId` or `cityId` (e.g. not 24-char hex):

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "stateId", "message": "Invalid stateId format (24-char hex)" }
  ]
}
```

---

## 2. College Details API

**Purpose:** Fetch full details of a single college by its slug (e.g. for the college detail page).

### Request

- **Method:** `GET`
- **Path:** `/api/colleges/:slug`
- **Path parameter:** `slug` (required) – URL-safe college identifier (e.g. `iit-bombay`).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "iit-bombay",
    "slug": "iit-bombay",
    "name": "IIT Bombay",
    "shortName": "IITB",
    "location": "Mumbai, Maharashtra",
    "state": "Maharashtra",
    "city": "Mumbai",
    "stateId": "507f1f77bcf86cd799439011",
    "cityId": "507f1f77bcf86cd799439012",
    "category": "Engineering",
    "courses": ["B.Tech", "M.Tech", "MBA", "PhD"],
    "courseFees": [
      { "course": "MBA", "fee": "₹1.2L/yr" },
      { "course": "B.Tech", "fee": "₹1.5L/yr" }
    ],
    "fee": "₹2.5L/yr",
    "feeAmount": 250000,
    "feePeriod": "year",
    "badge": "NIRF #1",
    "description": "Full description...",
    "highlights": ["NIRF Rank #1 in Engineering", "..."],
    "eligibility": "JEE Advanced qualified...",
    "facilities": ["Hostel", "Library", "Labs", "Sports"],
    "website": "https://www.iitb.ac.in",
    "phone": "+91-22-2572-2545",
    "email": "info@iitb.ac.in",
    "address": "Powai, Mumbai, Maharashtra 400076",
    "pinCode": "400076",
    "logoUrl": "https://...",
    "coverImageUrl": "https://...",
    "galleryUrls": ["https://..."],
    "rating": 4.9,
    "nirfRank": 1,
    "placementRate": 98,
    "avgPackage": "₹18 LPA",
    "isVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-06-01T12:00:00.000Z"
  }
}
```

Fields not stored in the database may be `null` or omitted.

### Not found (404)

When no active college exists for the given slug:

**Status:** `404 Not Found`

```json
{
  "success": false,
  "error": "College not found",
  "code": "COLLEGE_NOT_FOUND"
}
```

Use `code` for programmatic handling (e.g. show “College not found” page).

---

## 3. Errors & status codes

| Status | When | Body |
|--------|------|------|
| 200 | List or details success | `{ success: true, data: { ... } }` |
| 400 | Invalid query (e.g. invalid stateId/cityId) | `{ success: false, error: "Validation failed", errors: [{ field, message }] }` |
| 404 | Details: college not found or inactive | `{ success: false, error: "College not found", code: "COLLEGE_NOT_FOUND" }` |
| 500 | Server error | `{ success: false, error: "Internal server error" }` |

---

## 4. Integration examples

### List – default (first page, 12 items)

```http
GET /api/colleges?page=1&limit=12
Accept: application/json
```

### List – filter by category and state, sort by fee

```http
GET /api/colleges?category=Engineering&state=maharashtra&sort=fee_asc&page=1&limit=10
```

### List – filter by city and search

```http
GET /api/colleges?city=mumbai&search=tech&sort=relevance
```

### List – filter by state and city IDs

```http
GET /api/colleges?stateId=507f1f77bcf86cd799439011&cityId=507f1f77bcf86cd799439012&limit=20
```

### Details – by slug

```http
GET /api/colleges/iit-bombay
Accept: application/json
```

### cURL examples

```bash
# List (default)
curl -X GET "http://localhost:5000/api/colleges?page=1&limit=12"

# List with filters and sort
curl -X GET "http://localhost:5000/api/colleges?category=MBA&state=delhi&sort=name_asc&page=1&limit=10"

# Search
curl -X GET "http://localhost:5000/api/colleges?search=iit&limit=5"

# Details
curl -X GET "http://localhost:5000/api/colleges/iit-bombay"
```

---

## 5. Quick reference

| API            | Method | Path                   | Main params | Purpose |
|----------------|--------|------------------------|-------------|---------|
| College list   | GET    | `/api/colleges`        | page, limit, category, state, stateId, city, cityId, search, sort, verified | Paginated list with filters, search, sort |
| College details| GET    | `/api/colleges/:slug`  | slug (path) | Full college for detail page |

Use the list API to build listing/search pages; use the details API with `data.id` or `data.slug` from the list to load the full college page.

---

## 6. Related documentation

- **[Admin College API](./ADMIN_COLLEGE_API.md)** – For the admin panel: list, create, edit, status toggle, and delete colleges. Requires authentication.
- **[Course API](./COURSE_API.md)** – Consumer dropdown: `GET /api/courses`. Admin: list, add, edit, delete courses at `/api/admin/courses`.
- **[Consumer: Courses & select colleges by course](./CONSUMER_COURSES_AND_COLLEGES.md)** – Courses list for dropdown and filtering colleges by **course ID** (not plain text).
