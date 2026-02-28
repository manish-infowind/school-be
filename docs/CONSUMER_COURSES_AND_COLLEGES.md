# Consumer: Courses List & Select Colleges by Course

This document describes how the **customer/consumer portal** can list courses and then **filter colleges by course using course ID** (not plain text). Use these APIs together for a course-based college selection flow.

**Base URL (example):** `https://your-api-host.com/api`  
**Authentication:** None (all public).

---

## Flow overview

1. **Get list of courses** → `GET /api/courses` (for dropdown).
2. **User selects a course** → use the course’s **`_id`** (course ID).
3. **Get colleges offering that course** → `GET /api/colleges?courseId=<courseId>`.

Always use **`courseId`** (24-char hex ObjectId) when filtering colleges. Do **not** rely on course name or plain text for filtering.

---

## 1. List courses (for dropdown)

**Purpose:** Load all active courses so the user can pick one in a dropdown. Use the returned **`_id`** as `courseId` when calling the college list API.

- **Method:** `GET`
- **Path:** `/api/courses`
- **Query parameters:** None.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "B.Tech",
      "slug": "btech"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "MBA",
      "slug": "mba"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "BBA",
      "slug": "bba"
    }
  ]
}
```

| Field  | Type   | Description |
|--------|--------|-------------|
| `_id`  | string | **Course ID** – use this as `courseId` in the college list API. |
| `name` | string | Display name for the dropdown label. |
| `slug` | string | URL-safe identifier. |

**UI:** Populate a dropdown with `data`: use `_id` as the option value and `name` as the label. When the user selects an option, pass that `_id` as `courseId` to the college list.

---

## 2. List colleges (filter by course ID)

**Purpose:** Get a paginated list of colleges that offer the selected course. Filter is applied by **course ID** only.

- **Method:** `GET`
- **Path:** `/api/colleges`
- **Query parameters:** Use **`courseId`** (and any other filters you need).

### Relevant query parameters

| Parameter   | Type   | Description |
|------------|--------|-------------|
| **`courseId`** | string | **Course ObjectId (24-char hex).** Colleges whose `courses` array includes this course’s name are returned. **Required for course-based selection.** Use the `_id` from `GET /api/courses`. |
| `page`     | number | Page number (default `1`). |
| `limit`    | number | Per page (default `12`, max `50`). |
| `stateId`  | string | Optional: filter by state ObjectId. |
| `cityId`   | string | Optional: filter by city ObjectId. |
| `category` | string | Optional: filter by category. |
| `search`   | string | Optional: text search. |
| `sort`     | string | Optional: e.g. `name_asc`, `fee_asc`. |

**Important:** Pass the course’s **`_id`** from the courses list as `courseId`. Do **not** send course name or other plain text as the course filter.

### Example: colleges offering B.Tech

User selected “B.Tech” in the dropdown; its `_id` from `GET /api/courses` is `507f1f77bcf86cd799439011`.

**Request:**

```http
GET /api/colleges?courseId=507f1f77bcf86cd799439011&page=1&limit=12
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "colleges": [
      {
        "id": "iit-bombay",
        "name": "IIT Bombay",
        "location": "Mumbai, Maharashtra",
        "state": "Maharashtra",
        "city": "Mumbai",
        "category": "Engineering",
        "courses": ["B.Tech", "M.Tech", "MBA"],
        "fee": "₹2.5L/yr",
        "badge": "NIRF #1",
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

### Invalid courseId (400)

If `courseId` is not a valid 24-char hex string:

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "courseId", "message": "Invalid courseId format (24-char hex)" }
  ]
}
```

---

## 3. Summary: use course ID, not plain text

| Step | API | What to use |
|------|-----|-------------|
| 1. Load courses | `GET /api/courses` | Use response `data[]._id` as course ID. |
| 2. User selects course | — | Store the selected option’s **value** = `_id`. |
| 3. Load colleges by course | `GET /api/colleges?courseId=<_id>` | Pass that **`_id`** as `courseId`. |

- **Do:** Use `courseId=<course _id>` when calling `/api/colleges`.
- **Do not:** Use course name or other plain text for the course filter; the API expects a valid course ObjectId in `courseId`.

---

## 4. cURL examples

```bash
# 1. Get courses for dropdown
curl -X GET "http://localhost:5000/api/courses"

# 2. Get colleges offering the course (replace COURSE_ID with _id from step 1)
curl -X GET "http://localhost:5000/api/colleges?courseId=COURSE_ID&page=1&limit=12"

# 3. Colleges by course + state
curl -X GET "http://localhost:5000/api/colleges?courseId=COURSE_ID&stateId=STATE_ID&page=1&limit=12"
```

---

## 5. Quick reference

| API | Method | Path | Purpose |
|-----|--------|------|---------|
| Courses list | GET | `/api/courses` | Get all courses for dropdown; use `_id` as courseId. |
| Colleges by course | GET | `/api/colleges?courseId=<id>` | Get colleges that offer the selected course (by **course ID**). |

For full college list parameters (pagination, sort, other filters), see [COLLEGE_API_INTEGRATION.md](./COLLEGE_API_INTEGRATION.md).
