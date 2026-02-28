# Course API – Dropdown & Admin Management

This document covers **two** uses of courses:

1. **Consumer (public)** – List courses for filter dropdowns on the consumer site. No auth.
2. **Admin** – List, add, edit, and delete courses in the admin panel. Requires auth.

---

## Part 1: Consumer – Courses dropdown

Use this API to populate the **course filter dropdown** on the consumer (public) site.

### List courses (for dropdown)

**Purpose:** Return all **active** courses for dropdown/select. Only `isActive: true` courses are returned.

- **Method:** `GET`
- **Path:** `/api/courses`
- **Authentication:** None (public).
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

**Fields:**

| Field   | Type   | Description |
|--------|--------|-------------|
| `_id`   | string | Course ObjectId (24-char hex). Use for college list filter `courseId`. |
| `name`  | string | Display name (e.g. "B.Tech", "MBA"). |
| `slug`  | string | URL-safe identifier (e.g. "btech", "mba"). |

**Usage:** Call `GET /api/courses` once (e.g. on page load), then use `data` to fill the course dropdown. When the user selects a course, pass its **`_id`** as **`courseId`** in `GET /api/colleges` to filter colleges by that course. Use course ID only—do not filter by plain text. See [CONSUMER_COURSES_AND_COLLEGES.md](./CONSUMER_COURSES_AND_COLLEGES.md) for the full flow.

### Example (cURL)

```bash
curl -X GET "http://localhost:5000/api/courses"
```

---

## Part 2: Admin – Manage courses

All admin course endpoints are under `/api/admin` and require **authentication**.

**Base path:** `/api/admin`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

---

### 2.1 List courses (admin)

**Purpose:** List **all** courses (active and inactive) for admin management.

- **Method:** `GET`
- **Path:** `/api/admin/courses`
- **Auth:** Required.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "B.Tech",
      "slug": "btech",
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 2.2 Get course by ID

**Purpose:** Fetch a single course for the edit form.

- **Method:** `GET`
- **Path:** `/api/admin/courses/:id`
- **Path parameter:** `id` – Course ObjectId (24-char hex).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "B.Tech",
    "slug": "btech",
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

---

### 2.3 Create course

**Purpose:** Add a new course (e.g. B.Tech, MBA). Slug is auto-generated from the name.

- **Method:** `POST`
- **Path:** `/api/admin/courses`
- **Auth:** Required.
- **Body:** JSON.

| Field       | Type    | Required | Description |
|------------|---------|----------|-------------|
| `name`     | string  | Yes      | Course name (e.g. "B.Tech", "MBA"). Slug is derived from this. |
| `isActive` | boolean | No       | Default `true`. Set `false` to hide from consumer dropdown. |
| `sortOrder`| number  | No       | Order in list (lower = first). |

### Example body

```json
{
  "name": "B.Tech",
  "isActive": true,
  "sortOrder": 1
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "B.Tech",
    "slug": "btech",
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Validation error (400)

```json
{
  "success": false,
  "error": "name is required"
}
```

---

### 2.4 Update course

**Purpose:** Edit an existing course. Slug cannot be changed.

- **Method:** `PUT`
- **Path:** `/api/admin/courses/:id`
- **Path parameter:** `id` – Course ObjectId.
- **Auth:** Required.
- **Body:** JSON (partial OK). Do **not** send `slug` – it is ignored.

| Field       | Type    | Description |
|------------|---------|-------------|
| `name`     | string  | New display name. |
| `isActive` | boolean | Show/hide in consumer dropdown. |
| `sortOrder`| number  | Display order. |

### Example body

```json
{
  "name": "B.Tech (Bachelor of Technology)",
  "isActive": true,
  "sortOrder": 2
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "B.Tech (Bachelor of Technology)",
    "slug": "btech",
    "isActive": true,
    "sortOrder": 2,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

---

### 2.5 Delete course

**Purpose:** Permanently delete a course.

- **Method:** `DELETE`
- **Path:** `/api/admin/courses/:id`
- **Path parameter:** `id` – Course ObjectId.
- **Auth:** Required.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Course deleted"
}
```

### Not found (404)

```json
{
  "success": false,
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

---

## Quick reference

| Use            | Method | Path                      | Auth   | Purpose |
|----------------|--------|---------------------------|--------|---------|
| **Consumer**   | GET    | `/api/courses`            | No     | Dropdown list (active courses only). |
| **Admin list** | GET    | `/api/admin/courses`      | Yes    | List all courses for management. |
| **Admin get**  | GET    | `/api/admin/courses/:id`  | Yes    | Get one course for edit form. |
| **Admin create** | POST | `/api/admin/courses`       | Yes    | Add a new course. |
| **Admin update** | PUT  | `/api/admin/courses/:id`   | Yes    | Edit a course. |
| **Admin delete** | DELETE | `/api/admin/courses/:id`  | Yes    | Delete a course. |

---

## Notes for frontend

- **Consumer dropdown:** Call `GET /api/courses` and render `data` in a `<select>` or list. Use `_id` as value and `name` as label. When filtering colleges, use query param `courseId=<_id>` or `course=<name>` in `GET /api/colleges`.
- **Admin panel:** Use admin endpoints with Bearer token. List courses in a table; create (modal/form), edit (same form with prefilled data), delete (with confirm). Setting `isActive: false` hides the course from the consumer dropdown without deleting it.
