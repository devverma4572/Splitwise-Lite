# AI_CONTEXT.md

# Splitwise Lite – AI Context Document

## Project Overview

Splitwise Lite is a full-stack expense-sharing application inspired by Splitwise.

The application allows users to create groups, add members, record expenses, split bills using multiple methods, track balances, settle debts, communicate through expense-based chats, receive notifications, and participate in direct messaging conversations.

The project was built as part of an internship assignment focused on reverse engineering an existing product, documenting engineering decisions, and using AI-assisted software development.

---

# Product Understanding

## Problem Statement

Managing shared expenses among friends, roommates, or teams is often difficult.

Users struggle to:

* Track who paid for what
* Calculate individual shares
* Determine who owes whom
* Record repayments
* Maintain communication around expenses

Splitwise Lite addresses these challenges by providing a centralized platform for expense tracking and settlements.

---

# Product Scope

## Included Features

### Authentication

* User Registration
* User Login
* Protected Routes

### Group Management

* Create Groups
* Add Members
* Remove Members
* View Group Details

### Expense Management

* Create Expense
* View Expense
* Track Expense History

### Expense Split Types

* Equal Split
* Unequal Split
* Percentage Split
* Share-Based Split

### Balance Tracking

* Group Balances
* Individual Balances

### Settlements

* Record Payments
* Update Debt Status

### Communication

* Expense Messages
* Direct Messaging Between Users

### Notifications

* Expense Notifications
* Settlement Notifications
* Group Activity Notifications

---

## Out of Scope

The following features were intentionally excluded:

* Multi-currency support
* Recurring expenses
* Email notifications
* Payment gateway integration
* Receipt scanning
* OCR support
* Push notifications

---

# User Personas

## Friends Sharing Trip Expenses

Users creating temporary groups for travel expenses.

Examples:

* Goa Trip
* Manali Trip
* College Tour

---

## Roommates

Users tracking rent, food, and utility expenses.

---

## Small Teams

Users sharing project-related expenses.

---

# Technology Stack

## Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes

## Database

* PostgreSQL (Neon)

## ORM

* Prisma ORM

## Authentication

* JWT-based authentication

## Hosting

* Vercel

---

# Project Folder Structure

```text
src/

├── app/
│   ├── (main)
│   ├── api
│   ├── login
│   ├── register
│
├── components/
├── lib/
├── services/
├── types/

prisma/
├── schema.prisma
├── migrations/

public/
```

## Folder Descriptions

### app/

Contains pages, routes, layouts, and API endpoints.

### components/

Reusable UI components.

### lib/

Database utilities, helper functions, authentication helpers.

### services/

Business logic and API abstraction layer.

### types/

Shared TypeScript interfaces and types.

### prisma/

Database schema and migrations.

---

# Core Workflows

## Authentication Workflow

Register

↓

Login

↓

Generate Session

↓

Access Dashboard

---

## Group Workflow

Create Group

↓

Add Members

↓

View Expenses

↓

Track Balances

---

## Expense Workflow

Create Expense

↓

Select Split Type

↓

Assign Participants

↓

Calculate Shares

↓

Store Expense Splits

↓

Update Balances

---

## Settlement Workflow

View Outstanding Balance

↓

Record Settlement

↓

Update Balances

---

## Expense Chat Workflow

Open Expense

↓

View Messages

↓

Send Message

↓

Store Message

---

## Direct Messaging Workflow

Create Conversation

↓

Add Participants

↓

Exchange Messages

↓

Update Read Status

---

# Database Schema

## User

Purpose:

Stores registered users.

Fields:

* id
* name
* email
* password
* createdAt

Relationships:

* Group Memberships
* Expense Splits
* Messages
* Notifications
* Conversations
* Paid Expenses
* Settlements

---

## Group

Purpose:

Stores expense-sharing groups.

Fields:

* id
* name
* createdById
* createdAt

Relationships:

* Members
* Expenses
* Settlements

---

## GroupMember

Purpose:

Handles many-to-many relationship between users and groups.

Fields:

* id
* groupId
* userId

---

## Expense

Purpose:

Stores expense information.

Fields:

* id
* title
* amount
* paidById
* groupId
* splitType
* createdAt

Relationships:

* Payer
* Group
* Expense Splits
* Expense Messages

---

## ExpenseSplit

Purpose:

Stores expense allocation information.

Fields:

* id
* expenseId
* userId
* amount

Each record represents how much a participant owes for a specific expense.

---

## Message

Purpose:

Stores messages associated with expenses.

Fields:

* id
* expenseId
* userId
* content
* createdAt

---

## Settlement

Purpose:

Stores debt repayment records.

Fields:

* id
* fromUserId
* toUserId
* amount
* groupId
* createdAt

---

## Notification

Purpose:

Stores user notifications.

Fields:

* id
* userId
* title
* message
* type
* isRead
* createdAt

---

## Conversation

Purpose:

Stores direct messaging conversations.

Fields:

* id
* createdAt

---

## ConversationParticipant

Purpose:

Links users to conversations.

Fields:

* id
* conversationId
* userId

---

## ChatMessage

Purpose:

Stores direct chat messages.

Fields:

* id
* conversationId
* senderId
* content
* isRead
* createdAt

---

# Balance Calculation Logic

The system does not store balances directly.

Balances are derived from:

1. Expenses
2. Expense Splits
3. Settlements

Formula:

Net Balance =
Amount Paid
−
Amount Owed
−
Settlements Sent
+
Settlements Received

Positive Balance:

User should receive money.

Negative Balance:

User owes money.

---

# API Design

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

---

## Groups

GET /api/groups

POST /api/groups

GET /api/groups/:id

POST /api/groups/:id/members

DELETE /api/groups/:id/members

---

## Expenses

POST /api/expenses

GET /api/expenses/:id

PUT /api/expenses/:id

DELETE /api/expenses/:id

---

## Settlements

POST /api/settlements

GET /api/settlements

---

## Notifications

GET /api/notifications

PATCH /api/notifications/:id

---

## Messaging

POST /api/messages

GET /api/messages

POST /api/conversations

GET /api/conversations

---

# Frontend Structure

## Public Pages

/login

/register

---

## Protected Pages

/dashboard

/groups

/groups/[id]

/expenses/[id]

/notifications

/messages

/profile

---

# Deployment Plan

## Source Control

GitHub

Repository:

https://github.com/devverma4572/Splitwise-Lite

## Frontend Hosting

Vercel

## Database Hosting

Neon PostgreSQL

## Environment Variables

DATABASE_URL

JWT_SECRET

NEXTAUTH_SECRET

NEXTAUTH_URL

---

# Testing Plan

## Authentication Testing

* Register User
* Login User
* Logout User

## Group Testing

* Create Group
* Add Member
* Remove Member

## Expense Testing

* Create Expense
* Verify Split Logic

## Settlement Testing

* Record Settlement
* Verify Balance Updates

## Messaging Testing

* Expense Messages
* Direct Messages

## Notification Testing

* Create Notification
* Mark As Read

---

# AI Collaboration Process

## AI Tools Used

* ChatGPT
* Cursor AI
* GitHub Copilot / Codex

## AI Responsibilities

* Product Research
* Database Design
* API Design
* UI Planning
* Debugging
* Documentation

## Human Responsibilities

* Requirement Validation
* Architecture Decisions
* Testing
* Deployment
* Final Code Review

---

# Changes During Development

Version 1

* Authentication
* Groups

Version 2

* Expense Management
* Expense Splits

Version 3

* Settlements

Version 4

* Notifications

Version 5

* Expense Messaging

Version 6

* Direct Messaging System

---

# Tradeoffs

To meet the assignment timeline:

* Polling used instead of WebSockets
* Simplified notifications
* No multi-currency support
* No recurring expenses
* No payment gateway integration

---

# Known Limitations

* No real-time WebSocket chat
* No email notifications
* No push notifications
* No receipt uploads
* No recurring expenses
* No multi-currency support

---

# Future Improvements

* WebSocket-based chat
* Real-time notifications
* Mobile application
* AI spending insights
* Recurring expenses
* Debt simplification algorithms
* Multi-currency support

---

# Reproduction Instructions

A developer should be able to recreate this application by:

1. Setting up Next.js App Router.
2. Creating the Prisma schema described above.
3. Configuring PostgreSQL using Neon.
4. Implementing authentication.
5. Implementing group management.
6. Implementing expense tracking.
7. Implementing split calculations.
8. Implementing settlements.
9. Implementing notifications.
10. Implementing messaging features.
11. Deploying to Vercel.

This document serves as the source of truth for recreating the application architecture and functionality.
