# Frontend Components

## Component Structure

### Components (`/components`)
Reusable UI components used across multiple pages.

- **`Navbar.js`** - Navigation bar with login/logout state
- **`Footer.js`** - Site footer with copyright info
- **`LandingHero.js`** - Landing page hero section with features
- **`AuthLayout.js`** - Wrapper for authentication pages (login/signup)

### Pages (`/pages`)
Next.js pages that map to routes.

- **`index.js`** - Landing page (/) - uses Navbar, Footer, and LandingHero
- **`login.js`** - Login page (/login) - uses AuthLayout
- **`signup.js`** - Signup page (/signup) - uses AuthLayout
- **`_app.js`** - Next.js app wrapper that loads global styles

### Styles (`/styles`)
- **`globals.css`** - Global CSS variables and styling

## Usage

Each page imports only the components it needs:

```javascript
// Example: index.js
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LandingHero from '../components/LandingHero'
```

This modular approach makes code:
- ✅ Easier to maintain
- ✅ Reusable across pages
- ✅ Testable in isolation
- ✅ More organized
