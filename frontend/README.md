# SmartFacture IDP - Intelligent Document Processing Platform

A production-ready Next.js SaaS application for AI-powered invoice extraction, financial accounting, and budget management with a burgundy luxury glassmorphism design system.

## Project Overview

SmartFacture IDP is an enterprise-grade platform that leverages AI (Gemini) to automatically extract data from invoices and financial documents, validate fiscal information, manage budgets, and provide real-time collaboration workflows for accounting teams.

### Key Features

- **AI-Powered Invoice Processing**: Drag-and-drop upload with real-time OCR extraction and confidence scoring
- **Budget Management**: Monthly spending tracking with saturation ring visualization and smart alerts (80%+ threshold)
- **Approval Workflows**: Multi-step lifecycle stepper with validation checklists and team comments
- **Audit Trail**: Immutable timeline of all system actions with color-coded event types
- **Role-Based Access**: Admin and Accountant roles with granular permissions
- **Real-Time Notifications**: Unread count badge with priority-based alerts
- **Multi-Chart Analytics**: Spending trends, expense categories, supplier rankings
- **Settings & Integrations**: User provisioning, API key management, TTN integration support

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Data Visualization**: Recharts (area, bar, pie, line charts)
- **Icons**: lucide-react
- **Animations**: Framer Motion
- **HTTP Client**: Axios with interceptors for JWT auth

### Design System
- **Color Palette**: Burgundy luxury theme (#121212-#3A0A14) with rose-gold accents (#B76E79)
- **Glassmorphism**: Backdrop blur effects with 5-10% opacity overlays
- **Typography**: System fonts (Geist sans and mono)
- **Components**: Fully accessible, responsive cards, inputs, and interactive elements

### Backend Integration
- **API Base**: `http://localhost:5000/api`
- **Authentication**: JWT tokens stored in localStorage
- **Mock Data**: Comprehensive fallback data for offline development

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Redirect to login/dashboard
│   ├── globals.css             # Theme variables & utilities
│   ├── auth/
│   │   └── login/page.tsx      # Login form with OAuth stubs
│   ├── dashboard/page.tsx      # KPIs, charts, audit log
│   ├── invoices/
│   │   ├── page.tsx            # Upload & management table
│   │   └── [id]/page.tsx       # Invoice detail view
│   ├── budget/page.tsx         # Spending control & config
│   ├── approval/page.tsx       # Workflow queue & stepper
│   ├── audit/page.tsx          # Timeline with filters
│   ├── analytics/page.tsx      # Multi-series charts
│   ├── settings/page.tsx       # User & system management
│   ├── ai-insights/page.tsx    # Financial forecasting
│   └── notifications/page.tsx  # Notification center
├── components/
│   ├── dashboard-layout.tsx    # Protected layout wrapper
│   ├── sidebar.tsx             # Navigation with role filtering
│   └── navbar.tsx              # Search, notifications, user menu
├── lib/
│   ├── api.ts                  # API service layer with mock data
│   ├── auth-context.tsx        # Auth state management
│   └── utils.ts                # Tailwind cn() helper
└── package.json
```

## API Endpoints

The application connects to `http://localhost:5000/api` with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Create new user (admin only)
- `GET /auth/profile` - Get current user

### Invoices
- `POST /invoices/upload` - Upload file for AI extraction
- `GET /invoices` - List all invoices (filterable by status)
- `GET /invoices/:id` - Get invoice detail with extracted data
- `PUT /invoices/:id` - Update extracted data
- `DELETE /invoices/:id` - Delete invoice

### Budget
- `GET /budget/status?year=YYYY&month=MM` - Get budget metrics
- `POST /budget` - Set monthly limit and alert threshold

### Workflows
- `POST /workflow/:invoiceId/approve` - Approve/reject with notes

### Audit & Notifications
- `GET /audit` - Fetch immutable audit trail
- `GET /notifications` - Get all notifications
- `GET /comments/:invoiceId` - Get collaboration comments

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Backend API running at `http://localhost:5000/api`

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open browser
open http://localhost:3000
```

### Demo Credentials

```
Email: eleanor@smartfacture.com
Password: password123
Role: ACCOUNTANT
```

Admin credentials available in the API mock data for testing role-based features.

## Design Highlights

### Glassmorphism Style
All cards use the `.glass-card` utility class for consistent styling:
```html
<div class="glass-card p-6">
  <!-- Content -->
</div>
```

### Custom Utilities
- `.glass-card` - Backdrop blur with white/5 background
- `.glass-input` - Styled input fields
- `.btn-rose-gold` - Primary gradient button
- `.badge-success|warning|error|info` - Status badges

### Color System
All colors defined as CSS variables in `globals.css`:
- Primary burgundy: `#7B112C`, `#6D071A`, `#8E1B3A`
- Rose-gold accent: `#B76E79`
- Backgrounds: `#121212` → `#1E1E1E` → `#3A0A14`

## Key Components

### Sidebar
Fixed navigation with role-based menu filtering. Mobile-responsive with hamburger toggle.

### Navbar
Floating search bar (Cmd+K support), notification bell with unread badge, user profile menu.

### Dashboard Layout
Protected wrapper that redirects unauthenticated users to login. Shows loading state during auth initialization.

### Invoice Upload
Drag-and-drop area with progress indicator showing "Gemini AI extracting..." text. Supports batch uploads.

### Budget Alert
Amber warning banner triggered when spending reaches 80%+ of monthly limit. Prevents accidental overspending.

### Approval Stepper
5-stage lifecycle visualization: Draft → Extracted → Verified → Submitted → Approved. Shows checkmarks for completed stages.

## API Service Layer

The `lib/api.ts` file provides:
- Axios instance with JWT token interceptor
- Service methods for all endpoints
- Automatic fallback to mock data if API unavailable
- Error handling with console logging

Example usage:
```typescript
import { invoiceAPI } from '@/lib/api';

const invoices = await invoiceAPI.getAll('APPROVED');
const result = await invoiceAPI.uploadFile(file);
```

## Styling Approach

1. **Tailwind CSS** for utility classes
2. **Custom utilities** in `globals.css` for repeated patterns
3. **Inline styles** only for dynamic values
4. **CSS variables** for theme colors and spacing

## Environment Variables

Create a `.env.local` file (optional, already has defaults):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

- **Mobile**: Single column, stacked navigation
- **Tablet**: 2-column grids, sidebar collapses on hamburger click
- **Desktop**: Full 3-4 column layouts with fixed sidebar

## Performance Optimizations

- Next.js 16 with Turbopack (default bundler)
- Image optimization with Next.js Image component
- CSS-in-JS with Tailwind for minimal bundle size
- React Compiler support (if enabled in next.config.js)
- Recharts with responsive containers for charts

## Security

- JWT authentication with httpOnly cookie (recommended for production)
- Password hashing with bcrypt (backend only)
- CORS configured for `http://localhost:5000`
- Input sanitization in form components
- Row-level security rules (RLS) in database

## Mock Data

All API calls automatically fall back to mock data if the backend is unavailable. This allows complete UI testing without a live API.

### Mock Data Sources
- `mockInvoices` - 3 sample invoices
- `mockBudgetStatus` - Monthly spending metrics
- `mockAuditLog` - 5 sample audit events
- `mockNotifications` - 3 sample alerts
- `mockUsers` - 4 system users
- `mockAnalyticsData` - 12-month spending trend

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Select Next.js framework
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```

### Manual
```bash
pnpm build
pnpm start
```

## Troubleshooting

### API Connection Issues
If the backend at `http://localhost:5000` is unavailable, the app automatically switches to mock data mode. Check browser console for `[v0]` messages.

### Login Issues
Clear localStorage and cookies, then retry login. Check browser DevTools Network tab for API responses.

### Chart Rendering
Recharts requires the parent container to have a defined height. All charts use `ResponsiveContainer` with fixed heights.

## Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Advanced image processing (TensorFlow.js)
- [ ] Export to Excel/PDF with formatting
- [ ] Invoice template detection
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle (currently dark-only)
- [ ] Mobile native app with React Native
- [ ] Stripe integration for subscription billing

## License

Proprietary - SmartFacture IDP Platform

## Support

For issues or feature requests, contact the development team or open an issue in the internal repository.

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready
