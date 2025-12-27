# The Last Caretaker - State of the Game Survey

A multi-branching survey platform built with React, Vite, and Cloudflare D1 for data storage. Hosted on Cloudflare Pages with a Notion-inspired zero-friction user experience.

## Quick Links

- **[Documentation Wiki](https://github.com/TLC-Community-Survey/Survey/wiki)** - Complete setup guides, architecture details, and troubleshooting
- **[Database Schema](https://github.com/TLC-Community-Survey/Survey/tree/main/migrations)** - View migration files and schema evolution
- **[Source Code](https://github.com/TLC-Community-Survey/Survey)** - Browse the repository

## Features

- **Notion-like UI**: Clean, minimal design with Inter font, dark mode, and smooth animations
- **Multi-step Survey**: 4-step form with branching logic
- **Cloudflare D1 Storage**: Cost-effective SQLite database for storing survey responses
- **Dual Database Architecture**: Staging database for raw submissions, production database for sanitized data
- **Rate Limiting**: Built-in protection against spam and abuse
- **Admin Panel**: Secure dashboard for viewing statistics and managing submissions (separate module at `/admin/*`)
- **Zero Trust Authentication**: GitHub-based authentication for admin access (TLC-Community-Survey/Admins team)
- **Audit Logging**: All admin actions logged with user info and timestamps

## Architecture

```
User submits form → Cloudflare Pages Function → Rate limiting → D1 Staging DB
                                                      ↓
                                            Sanitization Process
                                                      ↓
                                            D1 Production DB → Dashboard
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/TLC-Community-Survey/Survey.git
   cd Survey
   npm install
   ```

2. **Set up Cloudflare D1 databases**
   ```bash
   wrangler d1 create tlc-survey-db-staging
   wrangler d1 create tlc-survey-db-prod
   ```

3. **Configure environment**
   - Update `wrangler.toml` with your database IDs
   - Set environment variables in Cloudflare Pages dashboard

4. **Deploy**
   - Connect repository to Cloudflare Pages
   - Configure build settings and environment variables

For detailed setup instructions, see the [Documentation Wiki](https://github.com/TLC-Community-Survey/Survey/wiki).

## Development

```bash
# Development server (frontend only)
npm run dev

# Full development server with API endpoints
npm run dev:full
```

## Project Structure

```
/
├── admin/              # Admin module (separate, isolated)
│   ├── components/      # Admin React components
│   ├── routes/         # Admin route definitions
│   ├── services/       # Admin API service layer
│   └── utils/          # Admin utilities
├── functions/          # Cloudflare Pages Functions (API endpoints)
│   ├── submit.js       # Public survey submission endpoint (/submit)
│   ├── admin/          # Admin API endpoints (/admin/api/*)
│   │   ├── _middleware.js  # Zero Trust middleware
│   │   ├── index.js    # Admin API handlers
│   │   └── utils/      # Admin server-side utilities
│   ├── api/            # Protected API endpoints (/api/*)
│   │   ├── dashboard.js
│   │   ├── sanitize.js
│   │   └── ...
│   └── utils/          # Shared utilities for functions
├── migrations/         # D1 database migrations
├── public/             # Static assets
└── src/                # React application
    ├── components/     # UI components
    ├── services/       # API clients
    └── utils/          # Utilities and helpers
```

## Documentation

All detailed documentation is available in the [GitHub Wiki](https://github.com/TLC-Community-Survey/Survey/wiki), including:

- Setup and installation guides
- Database schema documentation
- Deployment instructions
- API reference
- Troubleshooting guides
- Security and authentication setup

## License

This is a community project. Use as you see fit.

## Credits

Created for The Last Caretaker community survey.
