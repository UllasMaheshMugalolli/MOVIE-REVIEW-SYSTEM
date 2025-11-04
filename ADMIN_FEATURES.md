# Admin Features - Implementation Guide

## 🔐 Admin Setup Instructions

### Step 1: Update Database Schema
Run this SQL command to add admin role:
```sql
ALTER TABLE UserTable ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

### Step 2: Make a User Admin
```sql
-- Make specific user admin (replace with actual user_id or email)
UPDATE UserTable SET is_admin = TRUE WHERE user_id = 1;
-- OR
UPDATE UserTable SET is_admin = TRUE WHERE email = 'admin@example.com';
```

---

## 📋 Admin API Endpoints

### **Movies Management**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/movies` | POST | Admin | Add new movie |
| `PUT /api/movies/:id` | PUT | Admin | Update movie |
| `DELETE /api/movies/:id` | DELETE | Admin | Delete movie |

**Example - Add Movie:**
```json
POST /api/movies
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "title": "Inception",
  "release_date": "2010-07-16"
}
```

---

### **Persons Management**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/persons` | POST | Admin | Add new person |
| `PUT /api/persons/:id` | PUT | Admin | Update person |
| `DELETE /api/persons/:id` | DELETE | Admin | Delete person |

**Example - Add Person:**
```json
POST /api/persons
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "name": "Leonardo DiCaprio",
  "date_of_birth": "1974-11-11",
  "gender": "Male"
}
```

---

### **Cast & Crew Assignment**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/persons/movie-role` | POST | Admin | Assign person to movie |
| `DELETE /api/persons/movie-role` | DELETE | Admin | Remove person from movie |

**Example - Assign Actor:**
```json
POST /api/persons/movie-role
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "movie_id": 1,
  "person_id": 5,
  "role": "Actor"  // Options: "Actor", "Director", "Producer"
}
```

---

### **Genres Management**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/genres` | GET | Public | List all genres |
| `GET /api/genres/:movieId` | GET | Public | Get movie genres |
| `POST /api/genres` | POST | Admin | Add new genre |
| `POST /api/genres/movie` | POST | Admin | Assign genre to movie |
| `DELETE /api/genres/movie` | DELETE | Admin | Remove genre from movie |

**Example - Add Genre:**
```json
POST /api/genres
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "name": "Sci-Fi"
}
```

**Example - Assign Genre to Movie:**
```json
POST /api/genres/movie
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "movie_id": 1,
  "genre_id": 3
}
```

---

### **Revenue Management**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/revenue/:movieId` | GET | Public | Get movie revenue data |
| `POST /api/revenue` | POST | Admin | Add revenue data |
| `PUT /api/revenue/:movieId` | PUT | Admin | Update revenue data |

**Example - Add Revenue:**
```json
POST /api/revenue
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "movie_id": 1,
  "investment": 160000000,
  "outcome_revenue": 829895144,
  "location": "USA"
}
```

---

## 🔒 Authentication

### Admin Token
When an admin logs in, the JWT token includes `is_admin: true`:
```json
{
  "user_id": 1,
  "username": "admin",
  "is_admin": true
}
```

### Frontend Usage
```javascript
// Check if user is admin
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const isAdmin = payload.is_admin;

// Make admin request
fetch(`${apiUrl}/api/movies`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title: 'New Movie', release_date: '2025-01-01' })
})
```

---

## 🎨 Admin Frontend Pages

### Structure:
```
pages/
  admin/
    index.js          # Admin Dashboard Home
    movies.js         # Movies Management
    persons.js        # Persons Management
    cast-crew.js      # Cast & Crew Assignment
    genres.js         # Genres Management
    revenue.js        # Revenue Management
```

### Features for Each Page:

#### **1. Admin Dashboard (`/admin`)**
- Overview cards (total movies, persons, users)
- Quick action buttons
- Recent activity log

#### **2. Movies Management (`/admin/movies`)**
- Table view of all movies
- Add button → Modal with form
- Edit button → Inline or modal
- Delete button with confirmation
- Search/filter functionality

#### **3. Persons Management (`/admin/persons`)**
- Table view of all persons
- Add/Edit/Delete functionality
- Date picker for date_of_birth
- Gender dropdown

#### **4. Cast & Crew (`/admin/cast-crew`)**
- Movie selector dropdown
- Person selector dropdown
- Role selector (Actor/Director/Producer)
- Current assignments table
- Remove assignments

#### **5. Genres Management (`/admin/genres`)**
- List of all genres
- Add new genre
- Assign genres to movies
- Remove genre assignments

#### **6. Revenue Management (`/admin/revenue`)**
- Movie selector
- Form for investment and outcome_revenue
- Location field
- Profit/loss calculation display

---

## 🛡️ Security Notes

1. **All admin endpoints are protected** with `authenticateAdmin` middleware
2. **Non-admin users** get 403 Forbidden error
3. **Token verification** happens on every admin request
4. **Database constraints** prevent invalid data (foreign keys, unique constraints)

---

## 🚀 Next Steps

1. ✅ Backend endpoints created
2. ✅ Admin middleware implemented
3. ✅ Database schema updated (run SQL)
4. ⏳ Build admin frontend pages
5. ⏳ Add admin navigation in Navbar
6. ⏳ Create admin route protection in frontend

---

**Ready to build the admin frontend!**
