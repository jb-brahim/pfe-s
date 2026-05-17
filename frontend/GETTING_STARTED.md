# Getting Started with SmartFacture IDP

Welcome to SmartFacture IDP - a production-ready SaaS platform for AI-powered invoice processing and financial accounting!

## Quick Start (2 Minutes)

### 1. Install & Run
```bash
cd /vercel/share/v0-project
pnpm install
pnpm dev
```

The app opens at **http://localhost:3000**

### 2. Login with Demo Credentials
```
Email: eleanor@smartfacture.com
Password: password123
```

### 3. Explore the Dashboard
You're now in the main dashboard with KPI cards, spending analytics, and recent activity.

---

## Project Structure Overview

The project is organized by pages (each representing a section of the application):

```
📁 app/
  ├── 📄 page.tsx                  # Root redirect
  ├── 📄 layout.tsx                # App layout with theme
  ├── 📁 auth/login/
  │   └── 📄 page.tsx              # Login form
  ├── 📁 dashboard/
  │   └── 📄 page.tsx              # Main dashboard
  ├── 📁 invoices/
  │   ├── 📄 page.tsx              # Invoice list & upload
  │   └── 📁 [id]/
  │       └── 📄 page.tsx          # Invoice detail view
  ├── 📁 budget/
  │   └── 📄 page.tsx              # Budget management
  ├── 📁 approval/
  │   └── 📄 page.tsx              # Approval workflows
  ├── 📁 audit/
  │   └── 📄 page.tsx              # Audit trail
  ├── 📁 analytics/
  │   └── 📄 page.tsx              # Analytics charts
  ├── 📁 settings/
  │   └── 📄 page.tsx              # User management
  ├── 📁 ai-insights/
  │   └── 📄 page.tsx              # AI predictions
  └── 📁 notifications/
      └── 📄 page.tsx              # Notification center
```

---

## Feature Guide

### 🏠 Dashboard (`/dashboard`)
**What you see**: Overview of all invoices, spending, and recent activity

**KPI Cards**:
- **Total Invoices**: 1,247 total documents processed
- **Active Suppliers**: 89 vendor accounts
- **Approved Invoices**: 1,089 (87%)
- **Avg Processing**: 2.3 minutes

**Charts**:
- 12-month spending trend (Area Chart)
- Invoice status breakdown (Donut: 87% Approved, 10% Pending, 3% Rejected)

**Recent Activity**: Last 5 audit log entries

---

### 📄 Invoices & Vision (`/invoices`)
**What you do**: Upload invoices, view AI extraction results

**Upload Section**:
1. Drag & drop PDFs/JPGs/PNGs
2. AI extracts invoice number, company, amount, date, tax ID, etc.
3. Confidence score shows how accurate the AI extraction is
4. Status changes: DRAFT → EXTRACTED → VERIFIED → SUBMITTED → APPROVED

**Invoice Table**:
- Filter by status (ALL, DRAFT, EXTRACTED, VERIFIED, SUBMITTED, APPROVED, REJECTED)
- Search by invoice number
- See AI confidence scores (98% HIGH CONFIDENCE means accurate extraction)
- View, edit, or delete invoices

**Upload History**:
- Shows recently uploaded files
- Quick reference for status

---

### 💰 Budget Control (`/budget`)
**What you do**: Monitor and control monthly spending

**Summary Cards**:
- **Monthly Limit**: $50,000 (set by admin)
- **Current Spending**: $43,750 (as of today)
- **Remaining**: $6,250 (12.5% available)

**Saturation Ring**:
- Visual donut showing 87.5% budget used
- Turns RED when >= 80%
- Shows warning banner: "Budget Capacity Nearing Exhaustion"

**Expense Breakdown**:
- Software & Subscriptions: $15,200
- Office Supplies: $8,500
- Professional Services: $12,050
- Utilities: $3,000
- Other: $5,000

**Configuration**:
- Update monthly limit
- Set alert threshold (default 80%)
- Save settings

---

### ✅ Approval Workflows (`/approval`)
**What you do**: Review and approve/reject pending invoices

**Review Queue**:
- Lists invoices with status SUBMITTED
- Click to select an invoice
- Highlighted when selected

**Selected Invoice Details**:
- Invoice number & company name
- Amount (appears as large text)
- Extracted by (Accountant name)

**Document Lifecycle Stepper**:
```
✓ Draft (completed)
✓ Extracted (completed)
✓ Verified (completed)
⦿ Submitted (active)
○ Approved (pending)
```

**Validation Checklist**:
- ✓ TVA calculation verified
- ✓ High confidence score (92%)
- ✓ No duplicate detected

**Actions**:
- **Green APPROVE**: Sends to final accounting system
- **Red REJECT**: Can optionally provide rejection reason

---

### 🔍 Audit Trail (`/audit`)
**What you see**: Immutable log of all system actions

**Timeline Format**:
- Color-coded by event type
- Shows who did what and when
- Sortable by date, action type, user

**Event Types** (color-coded):
- 🟢 APPROVE - Green (invoice approved)
- 🔴 REJECT - Red (invoice rejected)
- 🔵 UPLOAD - Blue (file uploaded)
- 🟣 EXTRACTION - Purple (AI extracted data)

**Filters**:
- Date range (Last 7 days, Month, Custom)
- Action type
- User name

---

### 📊 Analytics (`/analytics`)
**What you see**: Comprehensive financial analytics

**Spending vs Invoices**:
- Multi-line chart
- Left Y-axis: Spending amount
- Right Y-axis: Invoice count

**Top Suppliers**:
- Horizontal bar chart
- Shows vendor names and total amounts
- Click legend to show/hide vendors

**League Table** (Accountants):
- Rankings by submission count
- Approval rate percentage
- CSV export option

---

### ⚙️ Settings (`/settings`)
**What you do**: Manage users, roles, and integrations

**User Directory**:
- Table of all accountants and admins
- Filter by department or role
- See invoice submission count for each user

**Invite New User**:
- Add accountant or admin
- Assign department
- Optional note

**Approval Hierarchy**:
- Diagram showing approval chain
- Admin ← Accountants

**Integrations**:
- TTN Configuration
- API Keys management
- Webhook endpoints

---

### 🤖 AI Insights (`/ai-insights`)
**What you see**: AI-powered financial predictions (Bonus Feature)

**Business Growth**:
- Revenue trend
- Expense forecast
- Supplier count growth

**Financial Forecasting**:
- Next 3-month spending prediction
- Seasonal pattern analysis

**Tax Analytics**:
- Compliance score matrix
- Tax category breakdown
- Risk assessment

---

### 🔔 Notifications (`/notifications`)
**What you see**: Alerts and team activity (Bonus Feature)

**Tabs**:
- **All**: Everything
- **Approvals**: Pending approval requests
- **Warnings**: AI verification issues
- **Payments**: Payment reminders
- **Activity**: Team member actions

**Notification Types**:
- 🟡 Approval Request (yellow) - Action needed
- ⚠️ AI Warning (orange) - Confidence issue
- 💳 Payment Reminder (blue) - Due date approaching
- 👤 Activity (gray) - Team action

---

## Component Guide

### Sidebar (`components/sidebar.tsx`)
**Location**: Left side of dashboard
**Contents**:
- Logo with rose-gold gradient icon
- Navigation menu (Dashboard, Invoices, Budget, etc.)
- User profile section
- Logout button
- Mobile hamburger menu on smaller screens

### Navbar (`components/navbar.tsx`)
**Location**: Top of every page
**Contents**:
- Search bar (Cmd+K support)
- Bell icon with unread notification badge
- User profile with initials
- Logout button

---

## Styling Guide

### Color System
All colors are defined in `globals.css` as CSS variables:

```css
--background: #121212          /* Deep black */
--background-secondary: #1E1E1E /* Slightly lighter */
--background-tertiary: #3A0A14  /* Burgundy depth */
--primary: #B76E79              /* Rose-gold accent */
--primary-light: #D4969F        /* Light rose-gold */
--primary-dark: #8E1B3A         /* Dark burgundy */
```

### Common Classes

**Cards**:
```html
<div class="glass-card p-6">...</div>
```
- Glassmorphism effect
- Rounded corners
- White border with 10% opacity
- Backdrop blur

**Inputs**:
```html
<input class="glass-input w-full" />
```
- Same styling as cards
- Placeholder text with 40% opacity

**Buttons**:
```html
<button class="btn-rose-gold">Click me</button>
```
- Rose-gold gradient
- Hover shadow effect
- Full width with w-full

**Status Badges**:
```html
<span class="badge-success">Approved</span>
<span class="badge-warning">Pending</span>
<span class="badge-error">Rejected</span>
```

---

## API & Mock Data

### How It Works
1. **With Backend**: App makes HTTP requests to `http://localhost:5000/api`
2. **Without Backend**: App automatically uses mock data
3. **No setup required**: Works perfectly offline!

### Making API Calls
All API calls are in `lib/api.ts`:

```typescript
import { invoiceAPI, budgetAPI } from '@/lib/api';

// Get all invoices
const result = await invoiceAPI.getAll('APPROVED');

// Upload file
const data = await invoiceAPI.uploadFile(file);

// Get budget status
const budget = await budgetAPI.getStatus();
```

### Mock Data Examples
The app ships with realistic mock data:
- 3 sample invoices
- 12-month spending data
- 5 audit log entries
- 3 notifications
- 4 user accounts

---

## Common Tasks

### Change Demo User
Edit `lib/api.ts` and update the demo email:
```typescript
export const mockUsers = [
  { email: 'YOUR_EMAIL@example.com', password: 'password123', role: 'ACCOUNTANT' },
  // ...
];
```

### Update Color Theme
All colors are in `globals.css`. Change the CSS variables:
```css
:root {
  --primary: #NEW_COLOR;
  --background: #NEW_BG;
  /* etc */
}
```

### Add New Page
1. Create `app/new-page/page.tsx`
2. Import `DashboardLayout` for protection
3. Add navigation item in `components/sidebar.tsx`

### Connect to Real Backend
Set the API URL in `lib/api.ts`:
```typescript
const API_URL = 'https://your-api.com/api';
```

---

## Keyboard Shortcuts

- **Cmd/Ctrl + K**: Search invoices
- **Tab**: Navigate form fields
- **Enter**: Submit form
- **Escape**: Close dropdowns

---

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Login Not Working
- Check credentials: `eleanor@smartfacture.com` / `password123`
- Clear browser storage: DevTools → Application → Clear Storage
- Check browser console for errors

### Charts Not Showing
- Charts need a defined height
- Already handled in all pages
- If adding new chart, wrap in `<ResponsiveContainer width="100%" height={300}>`

### Styling Issues
- Hard refresh: Cmd/Ctrl + Shift + R
- Check Tailwind config in `tailwind.config.ts`
- Verify CSS variables in `globals.css`

---

## Next Steps

### For Developers
1. Read `README.md` for technical details
2. Check `IMPLEMENTATION_SUMMARY.md` for what was built
3. Explore component files in `components/`
4. Try modifying `lib/api.ts` to connect to your backend

### For Designers
1. Review color system in `globals.css`
2. Check responsive breakpoints in Tailwind config
3. Modify card styling in `.glass-card` utility
4. Update brand colors in color variables

### For Business
1. Create your backend API (spec in README.md)
2. Test approval workflows with your accountants
3. Customize user roles and permissions
4. Deploy to Vercel for live testing

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org

---

## Demo Workflow

Complete this workflow to see the app in action:

1. **Login** (1 minute)
   - Email: eleanor@smartfacture.com
   - Password: password123

2. **View Dashboard** (1 minute)
   - See KPI cards and spending trends
   - Review recent activity

3. **Upload Invoice** (2 minutes)
   - Go to Invoices page
   - Drag & drop a PDF (or click to browse)
   - See AI extract the data

4. **Check Budget** (1 minute)
   - Go to Budget page
   - See spending at 87.5%
   - Notice warning banner

5. **Review Approvals** (2 minutes)
   - Go to Approval Workflows
   - Click an invoice in the queue
   - See validation checklist
   - Click Approve

6. **Check Audit Trail** (1 minute)
   - Go to Audit page
   - See your approval action logged

**Total Time**: ~8 minutes to see the full workflow!

---

## What's Next?

After exploring the UI, you can:
- [ ] Build the backend API
- [ ] Connect real database (Supabase, Neon, etc.)
- [ ] Integrate Gemini AI for invoice extraction
- [ ] Set up email notifications
- [ ] Configure payment processing
- [ ] Deploy to production

---

**Happy exploring! 🚀**

Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS.
