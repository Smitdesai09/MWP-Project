# MyWealthPlanner — Frontend

A production-ready React frontend for the MyWealthPlanner personal investment portal.

## Tech Stack

- **React 18** + **React Router v6**
- **React Hook Form** — performant form management
- **Zod** + **@hookform/resolvers** — schema-based validation
- **Lucide React** — clean icon set
- **Tailwind CSS v3** — utility-first styling
- **Vite** — fast dev server & build tool

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Landing page with Navbar |
| `/login` | Login page (email + password, RHF + Zod) |
| `/register` | Register page (full name, email, password, confirm, terms) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Validation Rules (Zod Schemas)

### Login
- `email` — required, valid email format
- `password` — required, min 6 characters

### Register
- `fullName` — required, 2–60 characters
- `email` — required, valid email
- `password` — min 8 chars, 1 uppercase, 1 number
- `confirmPassword` — must match password
- `agreeTerms` — must be checked

## Project Structure

```
src/
├── main.jsx           # Entry point
├── App.jsx            # Router setup
├── index.css          # Global styles + Tailwind
├── lib/
│   └── schemas.js     # Zod validation schemas
├── components/
│   └── Navbar.jsx     # Responsive navbar
└── pages/
    ├── Home.jsx       # Landing page
    ├── Login.jsx      # Login form
    └── Register.jsx   # Registration form
```

## Notes

- Educational/prototype use only — not real financial advice
- Under guidance of Asst. Prof. Hitesh Parmar · MERN Stack Project
- Payments simulated; no real card data handled
- Fonts: Playfair Display (headings) + DM Sans (body) via Google Fonts
