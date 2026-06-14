# Splitwise Lite

A full-stack expense sharing application inspired by Splitwise, built as part of an internship assignment.

## Project Overview

Splitwise Lite is a collaborative expense management platform that helps users track shared expenses, manage group finances, calculate balances, and record settlements.

The application enables users to create groups, add members, split expenses using different methods, track debts, and maintain a clear overview of who owes whom.

The goal of this project was to reverse engineer the core functionality of Splitwise and build a simplified but fully functional version using modern web technologies and AI-assisted development.

---

# Features

## Authentication

* User Registration
* User Login
* Secure Authentication
* Protected Routes

## Group Management

* Create Groups
* View Groups
* Add Members
* Remove Members
* Group Dashboard

## Expense Management

* Create Expenses
* View Expense History
* Track Expense Participants
* Manage Expense Details

## Expense Split Types

### Equal Split

Expense amount is divided equally among all selected members.

### Unequal Split

Users can specify exact amounts for each participant.

### Percentage Split

Users can specify percentage shares for participants.

### Share-Based Split

Expense amount is divided according to share units assigned to participants.

## Balance Management

* Group-wise Balance Summary
* Individual Balance Tracking
* Net Amount Owed
* Net Amount Receivable

## Expense Chat

* Discussion thread for each expense
* Expense-specific communication

## Settlement Tracking

* Record Payments
* Settle Debts
* Maintain Settlement History

## Notifications

* New Expense Notifications
* Group Activity Notifications
* Settlement Updates

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* ShadCN UI

## Backend

* Next.js API Routes

## Database

* PostgreSQL (Neon)

## ORM

* Prisma

## Authentication

* JWT / NextAuth

---

# System Architecture

Frontend (Next.js)

↓

API Routes

↓

Prisma ORM

↓

Neon PostgreSQL

---

# Database Design

Core entities used in the application:

* User
* Group
* GroupMember
* Expense
* ExpenseSplit
* Settlement
* ChatMessage
* Notification

These entities work together to support expense tracking, balance calculation, settlements, and communication.

---

# Project Structure

```text
app/
components/
lib/
prisma/
hooks/
types/
public/
```

### app/

Contains application routes and pages.

### components/

Reusable UI components.

### prisma/

Database schema and migrations.

### lib/

Utility functions and helper modules.

### hooks/

Custom React hooks.

### types/

Shared TypeScript definitions.

---

# Installation

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd splitwise-lite
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL=

JWT_SECRET=

NEXTAUTH_SECRET=

NEXTAUTH_URL=
```

## Run Development Server

```bash
npm run dev
```

Application will run on:

```text
http://localhost:3000
```

---

# API Overview

## Authentication

```http
POST /api/auth/register

POST /api/auth/login
```

## Groups

```http
GET /api/groups

POST /api/groups

GET /api/groups/:id
```

## Expenses

```http
POST /api/expenses

GET /api/expenses/:id
```

## Settlements

```http
POST /api/settlements
```

## Notifications

```http
GET /api/notifications
```

---

# Deployment

## Frontend

Deployed on Vercel.

## Database

Hosted on Neon PostgreSQL.

---

# AI Collaboration

This project was developed using AI-assisted software development practices.

### AI Tool Used

ChatGPT, Codex

### AI Assistance Areas

* Product Analysis
* Splitwise Research
* Database Schema Design
* API Design
* Frontend Architecture
* Backend Architecture
* Debugging
* Documentation Generation
* Deployment Guidance

The AI was treated as a junior engineering collaborator and was used to accelerate development while maintaining full understanding of the codebase and implementation decisions.

---

# Future Improvements

* Real-time WebSocket Chat
* Multi-Currency Support
* Recurring Expenses
* Email Notifications
* Push Notifications
* Debt Simplification Algorithm
* Mobile Application

---

# Known Limitations

* No multi-currency support
* No recurring expenses
* No email verification
* Simplified notification system
* Limited user roles and permissions

---

# Live Demo

Production URL:

```text
<DEPLOYED_APP_URL>
```

---

# GitHub Repository

Repository URL:

```text
https://github.com/devverma4572/Splitwise-Lite/tree/main
```

---

# Author

Developed as part of an internship assignment focused on product analysis, AI-assisted software development, and full-stack engineering.
