# BUILD_PLAN.md

# Splitwise Lite – Build Plan

## 1. Project Overview

The goal of this project was to reverse engineer the core functionality of Splitwise and build a simplified but production-ready expense-sharing application within a limited development timeline.

The application enables users to:

* Register and authenticate
* Create and manage groups
* Add and manage expenses
* Split expenses using multiple methods
* Track balances between users
* Record settlements
* Communicate within expenses using chat
* Receive activity notifications

The project was developed using AI-assisted software engineering practices while maintaining complete understanding of the underlying implementation.

---

# 2. Product Research

## How Splitwise Was Studied

Before implementation, the Splitwise product was analyzed to understand its primary workflows and user experience.

The following areas were researched:

* Group creation flow
* Member management
* Expense creation flow
* Balance calculations
* Settlement workflows
* Expense splitting methods
* User interactions
* Notifications

The goal was not to clone every feature of Splitwise but to identify the minimum viable workflows required to provide a useful expense-sharing experience.

---

## Key Learnings

Several important concepts were identified during research:

### Groups are the primary unit

Users organize expenses inside groups such as:

* Trips
* Roommates
* Friends
* Office teams

### Expenses drive balances

Balances are not manually entered.

They are calculated from:

* Who paid
* Who participated
* How the expense was split

### Settlements reduce debt

A settlement is a payment recorded between users that reduces outstanding balances.

### Multiple splitting strategies are essential

Splitwise supports different methods because equal splitting is not always appropriate.

The assignment specifically required:

* Equal split
* Unequal split
* Percentage split
* Share-based split

---

## Core Workflows Identified

### Authentication Workflow

Register

↓

Login

↓

Access Dashboard

---

### Group Workflow

Create Group

↓

Add Members

↓

View Group Details

---

### Expense Workflow

Create Expense

↓

Select Split Type

↓

Assign Participants

↓

Calculate Shares

↓

Update Balances

---

### Settlement Workflow

View Outstanding Balance

↓

Record Settlement

↓

Update Balances

---

### Chat Workflow

Open Expense

↓

View Messages

↓

Send Message

---

## Product Assumptions

The following assumptions were made during implementation:

* Only authenticated users can access the application.
* Each expense belongs to exactly one group.
* A user can belong to multiple groups.
* Only group members can participate in group expenses.
* Balances are calculated dynamically from expenses and settlements.
* Expense creators can view all expense details.
* Settlement records are immutable after creation.

---

# 3. Architecture

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* ShadCN UI

### Backend

* Next.js API Routes

### Database

* PostgreSQL (Neon)

### ORM

* Prisma

### Authentication

* JWT / NextAuth

### Deployment

* Vercel

---

## Database Design

The system uses a relational database structure.

### User

Stores registered users.

Responsibilities:

* Authentication
* Group membership
* Expense participation

---

### Group

Represents an expense-sharing group.

Examples:

* Goa Trip
* Flatmates
* Office Team

---

### GroupMember

Handles many-to-many relationships between users and groups.

---

### Expense

Stores expense information.

Fields include:

* Title
* Description
* Amount
* Paid By
* Group

---

### ExpenseSplit

Stores calculated shares for each participant.

Supports:

* Equal
* Unequal
* Percentage
* Share-based splits

---

### Settlement

Records debt repayments between users.

---

### ChatMessage

Stores messages associated with expenses.

---

### Notification

Stores activity updates for users.

Examples:

* New expense added
* Settlement recorded
* Member added

---

## API Design

### Authentication APIs

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

---

### Group APIs

GET /api/groups

POST /api/groups

GET /api/groups/:id

POST /api/groups/:id/members

DELETE /api/groups/:id/members

---

### Expense APIs

POST /api/expenses

GET /api/expenses/:id

PUT /api/expenses/:id

DELETE /api/expenses/:id

---

### Settlement APIs

POST /api/settlements

GET /api/settlements

---

### Chat APIs

POST /api/chat

GET /api/chat/:expenseId

---

### Notification APIs

GET /api/notifications

---

## Frontend Structure

### Authentication

/login

/register

---

### Dashboard

/dashboard

Displays:

* User groups
* Summary information
* Quick actions

---

### Group Pages

/groups/create

/groups/[groupId]

Displays:

* Members
* Balances
* Expenses

---

### Expense Pages

/groups/[groupId]/expenses/create

/groups/[groupId]/expenses/[expenseId]

Displays:

* Expense details
* Splits
* Chat

---

### Settlement Components

Settlement forms and balance summaries.

---

## Deployment Strategy

### Source Control

GitHub

### Frontend Hosting

Vercel

### Database Hosting

Neon PostgreSQL

### Environment Variables

DATABASE_URL

JWT_SECRET

NEXTAUTH_SECRET

NEXTAUTH_URL

---

# 4. AI Collaboration Process

## AI Tools Used

The primary AI tools used during development were:

* ChatGPT
* Cursor AI
* GitHub Copilot / Codex

---

## How AI Was Instructed

The AI was treated as a junior engineering assistant rather than an autonomous developer.

Instructions included:

* Analyze Splitwise workflows
* Assist with database design
* Suggest API structures
* Help generate frontend components
* Assist with debugging
* Generate documentation

The final implementation decisions were reviewed and understood before integration.

---

## AI-Assisted Development Areas

### Product Research

AI helped summarize Splitwise workflows and identify essential MVP features.

---

### Database Design

AI assisted in designing:

* User relationships
* Group membership structure
* Expense splitting models
* Settlement tracking

---

### API Planning

AI helped define:

* Authentication APIs
* Group APIs
* Expense APIs
* Settlement APIs

---

### Frontend Development

AI assisted with:

* Page structures
* Component generation
* Form handling
* State management

---

### Debugging

AI helped troubleshoot:

* Prisma issues
* API errors
* Authentication issues
* Deployment issues

---

## Plan Evolution

### Version 1

Authentication

Groups

Basic Expenses

---

### Version 2

Balance Calculations

Split Logic

Settlement Tracking

---

### Version 3

Expense Chat

Notifications

---

### Version 4

UI Improvements

Deployment Preparation

Documentation

---

## AI_CONTEXT Maintenance

AI_CONTEXT.md was continuously updated whenever:

* Features changed
* Database schema changed
* APIs changed
* UI structure changed
* Tradeoffs were introduced

This ensured that the project could be recreated using the documented context.

---

# 5. Tradeoffs

Due to the limited assignment timeline, several tradeoffs were made.

## Simplified Features

### Notifications

Implemented as application notifications rather than push notifications.

---

### Chat

Implemented as database-backed chat instead of WebSocket-based real-time messaging.

---

### Balance Optimization

Used straightforward balance calculations instead of advanced debt simplification algorithms.

---

## Features Not Implemented

The following features were intentionally excluded from MVP scope:

* Multi-currency support
* Recurring expenses
* Email notifications
* Payment gateway integration
* Expense attachments
* OCR receipt scanning
* Advanced analytics

---

## Hardcoded Decisions

To accelerate development:

* Default notification categories were predefined.
* Basic user permissions were used.
* Notification templates were fixed.

---

# 6. Future Improvements

If additional development time were available, the following enhancements would be prioritized:

### Real-Time Features

* WebSocket chat
* Live balance updates

### User Experience

* Mobile application
* Push notifications
* Better onboarding

### Financial Features

* Multi-currency support
* Recurring expenses
* Debt simplification algorithms

### Productivity Features

* Expense reminders
* Monthly reports
* AI-generated spending insights

---

# 7. Conclusion

This project successfully implements the core functionality of Splitwise in a simplified form while maintaining a clean architecture, relational database design, and scalable foundation.

The solution satisfies the assignment requirements by providing authentication, group management, expense tracking, multiple split strategies, settlements, balances, and AI-assisted development documentation.
