# WealthWatch

A premium desktop application for managing personal finances and tracking wealth with complete privacy and offline SQLite storage.

## Features

### ✅ Core Features
- **User Authentication**: Secure login/register with password hashing
- **Category Management**: Create and manage Daily/Big expense categories
- **Expense Tracking**: Add, edit, delete expenses with amount, date, and notes
- **Dashboard Analytics**: 
  - Today's/Monthly/Yearly expense summaries
  - Expense by category (Pie Chart)
  - Highest spending category
- **Reports**: Monthly expense trends with bar charts
  - ✅ **Category-wise filtering**: Filter reports by specific categories
  - ✅ **Date range selection**: Custom date ranges for targeted analysis
- **📊 Export Functionality**:
  - **Excel Export**: Export expenses to .xlsx format with detailed and summary sheets
  - **PDF Export**: Generate professional PDF reports with tables
- **💰 Budget Management**:
  - ✅ **Budget tracking**: Set monthly/yearly budgets per category
  - ✅ **Smart alerts**: Automatic warnings at 90% and exceeded budgets
  - ✅ **Visual status**: Color-coded budget health indicators
- **🔐 Data Security**:
  - ✅ **Backup**: Export all data to JSON format
  - ✅ **Restore**: Import data from backup files

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeORM
- **Database**: Better-SQLite3 (Local/Offline)
- **Desktop**: Electron
- **Charts**: Recharts
- **Export**: xlsx (Excel), jsPDF + autoTable (PDF)

## Installation

```bash
# Install dependencies
npm install

# This will automatically install dependencies for backend and frontend
```

## Running the Application

```bash
# Start the application (recommended)
npm start
```

This command will:
1. Start the NestJS backend server on port 3000
2. Start the React dev server on port 5173
3. Launch the Electron desktop window

## Using Export Features

### From Reports Page:
1. Navigate to **Reports** page
2. Click **Export Excel** to download:
   - Sheet 1: All expenses with details
   - Sheet 2: Monthly summary
3. Click **Export PDF** to download:
   - Monthly summary table
   - Detailed expenses table

### From Expenses Page:
1. Navigate to **Expenses** page
2. Click **Excel** button to export all expenses to Excel
3. Click **PDF** button to export expenses list to PDF

Both exports include:
- Date
- Category
- Amount
- Notes

Files are automatically downloaded with timestamp in filename.

## Database

**Location**: `backend/expense-manager.db`

The SQLite database contains:
- Users (with hashed passwords)
- Categories (Daily/Big types)
- Expenses (with relations to categories)

## Project Structure

```
Project/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── categories/  # Category management
│   │   └── expenses/    # Expense management
│   └── expense-manager.db  # SQLite database
├── frontend/         # React UI
│   └── src/
│       ├── pages/    # Dashboard, Expenses, Categories, Reports
│       ├── components/  # Layout, ProtectedRoute
│       ├── services/ # API client
│       └── context/  # Auth context
├── electron/         # Electron main process
└── package.json      # Root package with scripts

```

## Available Scripts

```bash
npm start              # Run the application
npm run build          # Build all components
npm run dist           # Build Windows executable (experimental)
```

## Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- Local-only data storage (no cloud sync)
- Secure offline database

## Future Enhancements

- [ ] Recurring expenses
- [ ] Multiple currency support with conversion rates
- [ ] Budget vs Actual comparison charts
- [ ] Category hierarchy (sub-categories)
- [ ] Expense tags and advanced filtering
- [ ] Mobile app version

## License

Personal Use Only

## Author

Built with Antigravity AI Assistant
