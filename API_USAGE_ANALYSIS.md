# API Endpoints, Procedures, Functions & Triggers - Usage Analysis

## 📌 Backend API Endpoints

### 🟢 **AUTHENTICATION ENDPOINTS** (auth.js)

| Endpoint | Method | Protected | Status | Used In Frontend |
|----------|--------|-----------|--------|------------------|
| `/api/auth/register` | POST | ❌ No | ✅ **USED** | `pages/signup.js` |
| `/api/auth/login` | POST | ❌ No | ✅ **USED** | `pages/login.js` |

---

### 🟢 **MOVIES ENDPOINTS** (movies.js)

| Endpoint | Method | Protected | Status | Used In Frontend |
|----------|--------|-----------|--------|------------------|
| `/api/movies` | GET | ❌ No | ✅ **USED** | `pages/movies.js`, `pages/index.js`, `pages/reports.js` |
| `/api/movies/:id` | GET | ❌ No | ✅ **USED** | `pages/movies/[id].js` |
| `/api/movies` | POST | ❌ No | ⚠️ **NOT USED** | *Not used in frontend* |
| `/api/movies/:id` | PUT | ❌ No | ⚠️ **NOT USED** | *Not used in frontend* |
| `/api/movies/:id` | DELETE | ❌ No | ⚠️ **NOT USED** | *Not used in frontend* |
| `/api/movies/:id/rating` | GET | ❌ No | ⚠️ **NOT USED** | *Superseded by triggers* |
| `/api/movies/stats/aggregate` | GET | ❌ No | ✅ **USED** | `pages/reports.js` |
| `/api/movies/profit/:movieName` | GET | ❌ No | ✅ **USED** | `pages/reports.js` (calls stored procedure) |

**Summary:**
- ✅ 5 endpoints actively used
- ⚠️ 4 endpoints not used (CRUD operations for admin features)

---

### 🟢 **RATINGS ENDPOINTS** (ratings.js)

| Endpoint | Method | Protected | Status | Used In Frontend |
|----------|--------|-----------|--------|------------------|
| `/api/ratings` | POST | ✅ Yes (JWT) | ✅ **USED** | `pages/movies/[id].js` - Add rating |
| `/api/ratings/movie/:movieId` | GET | ❌ No | ✅ **USED** | `pages/movies/[id].js` - Fetch all ratings for a movie |
| `/api/ratings/user` | GET | ✅ Yes (JWT) | ⚠️ **NOT USED** | *Could be used for user profile page* |
| `/api/ratings/:id` | PUT | ✅ Yes (JWT) | ✅ **USED** | `pages/movies/[id].js` - Edit own rating |
| `/api/ratings/:id` | DELETE | ✅ Yes (JWT) | ✅ **USED** | `pages/movies/[id].js` - Delete own rating |

**Summary:**
- ✅ 4 endpoints actively used
- ⚠️ 1 endpoint not used (GET user ratings - could be useful for user profile)

---

### 🟢 **PERSONS ENDPOINTS** (persons.js)

| Endpoint | Method | Protected | Status | Used In Frontend |
|----------|--------|-----------|--------|------------------|
| `/api/persons` | GET | ❌ No | ⚠️ **NOT USED** | *Was used temporarily, now replaced* |
| `/api/persons/:id` | GET | ❌ No | ✅ **USED** | `pages/persons/[id].js` |
| `/api/persons/age/:personId` | GET | ❌ No | ⚠️ **REDUNDANT** | *Age is included in `/api/persons/:id` response* |
| `/api/persons/movie-role` | POST | ❌ No | ⚠️ **NOT USED** | *Admin feature - not implemented in frontend* |
| `/api/persons/movie-role` | DELETE | ❌ No | ⚠️ **NOT USED** | *Admin feature - not implemented in frontend* |

**Summary:**
- ✅ 1 endpoint actively used
- ⚠️ 3 endpoints not used (admin features)
- ⚠️ 1 redundant endpoint (age is already in person details)

---

## 🗄️ Database Procedures, Functions & Triggers

### 🟢 **STORED PROCEDURES**

| Procedure Name | Purpose | Status | Used In |
|----------------|---------|--------|---------|
| `GetMovieProfit(movieName)` | Calculate profit/loss for a movie from Revenue table | ✅ **USED** | Backend: `/api/movies/profit/:movieName`<br>Frontend: `pages/reports.js` |

**SQL:**
```sql
CALL GetMovieProfit('Inception')
-- Returns: movie_name, investment, outcome_revenue, profit_loss
```

---

### 🟢 **FUNCTIONS**

| Function Name | Purpose | Status | Used In |
|---------------|---------|--------|---------|
| `GetPersonAge(person_id)` | Calculate person's age from date_of_birth | ✅ **USED** | Backend: `/api/persons/:id` (embedded in query)<br>Frontend: `pages/persons/[id].js` displays the age |

**SQL:**
```sql
SELECT GetPersonAge(1) AS age
-- Returns: person's age in years
```

---

### 🟢 **TRIGGERS**

| Trigger Name | Event | Purpose | Status | Effect Visible In |
|--------------|-------|---------|--------|-------------------|
| `trg_UpdateMovieAvgRating_AFTER_INSERT` | AFTER INSERT on Rating | Recalculates avg_rating when new rating added | ✅ **ACTIVE** | Movie details page - avg_rating updates after add |
| `trg_UpdateMovieAvgRating_AFTER_UPDATE` | AFTER UPDATE on Rating | Recalculates avg_rating when rating modified | ✅ **ACTIVE** | Movie details page - avg_rating updates after edit |
| `trg_UpdateMovieAvgRating_AFTER_DELETE` | AFTER DELETE on Rating | Recalculates avg_rating when rating removed | ✅ **ACTIVE** | Movie details page - avg_rating updates after delete |

**SQL Logic:**
```sql
UPDATE Movie 
SET avg_rating = (
  SELECT AVG(numeric_rating) 
  FROM Rating 
  WHERE movie_id = NEW.movie_id
)
WHERE movie_id = NEW.movie_id
```

**Demonstration:**
1. User submits rating → INSERT trigger fires → avg_rating recalculated
2. User edits rating → UPDATE trigger fires → avg_rating recalculated
3. User deletes rating → DELETE trigger fires → avg_rating recalculated
4. Frontend refetches movie data → Updated avg_rating displayed

---

## 📊 Usage Summary

### ✅ **FULLY IMPLEMENTED & USED**

**Endpoints (9):**
- ✅ POST `/api/auth/register`
- ✅ POST `/api/auth/login`
- ✅ GET `/api/movies`
- ✅ GET `/api/movies/:id`
- ✅ GET `/api/movies/stats/aggregate`
- ✅ GET `/api/movies/profit/:movieName` → calls **GetMovieProfit** procedure
- ✅ POST `/api/ratings`
- ✅ GET `/api/ratings/movie/:movieId`
- ✅ PUT `/api/ratings/:id`
- ✅ DELETE `/api/ratings/:id`
- ✅ GET `/api/persons/:id` → uses **GetPersonAge** function

**Database Features (5):**
- ✅ Stored Procedure: `GetMovieProfit`
- ✅ Function: `GetPersonAge`
- ✅ Trigger: `trg_UpdateMovieAvgRating_AFTER_INSERT`
- ✅ Trigger: `trg_UpdateMovieAvgRating_AFTER_UPDATE`
- ✅ Trigger: `trg_UpdateMovieAvgRating_AFTER_DELETE`

---

### ⚠️ **IMPLEMENTED BUT NOT USED** (Admin Features - Could be useful)

**Endpoints (7):**
- ⚠️ POST `/api/movies` - Add new movie
- ⚠️ PUT `/api/movies/:id` - Edit movie details
- ⚠️ DELETE `/api/movies/:id` - Delete movie
- ⚠️ GET `/api/ratings/user` - Get logged-in user's all ratings (could be used for profile page)
- ⚠️ POST `/api/persons/movie-role` - Add person to movie with role
- ⚠️ DELETE `/api/persons/movie-role` - Remove person from movie role
- ⚠️ GET `/api/persons` - List all persons

---

### 🔴 **REDUNDANT ENDPOINTS** (Can be removed or consolidated)

- 🔴 GET `/api/movies/:id/rating` - This endpoint manually calculates avg_rating, but we now have triggers that maintain it automatically
- 🔴 GET `/api/persons/age/:personId` - Age is already included in the main `/api/persons/:id` response

---

## 🎯 Recommendations

### For Project Completion:
1. ✅ **All required features are working:**
   - Authentication ✅
   - Movie CRUD (Read operations) ✅
   - Rating CRUD (Full CRUD) ✅
   - Triggers (All 3 working) ✅
   - Stored Procedure (GetMovieProfit working) ✅
   - Function (GetPersonAge working) ✅

### For Future Enhancement:
1. **Admin Panel** - Use the unused endpoints:
   - Movie management (POST, PUT, DELETE)
   - Person-role management
   
2. **User Profile Page** - Use:
   - GET `/api/ratings/user` to show user's rating history

3. **Code Cleanup** - Remove or deprecate:
   - GET `/api/movies/:id/rating` (redundant with triggers)
   - GET `/api/persons/age/:personId` (redundant, age in main endpoint)

---

## 📝 Database Feature Demonstration

All required database features are demonstrated in the application:

1. **Triggers** → Movie details page shows dynamic avg_rating updates
2. **Stored Procedure** → Reports page "Movie Profit Calculator" section
3. **Function** → Person details page shows calculated age
4. **Aggregate Queries** → Reports page statistics section (COUNT, AVG, SUM)
5. **Joins** → Movie details shows cast/crew, person details shows movies
6. **CRUD Operations** → Ratings can be created, read, updated, deleted

---

**Last Updated:** November 1, 2025
