# PROMPTS_USED.md

# AI Prompts Used During Development

This document records the major prompts used throughout the development of Splitwise Lite.

The purpose of this document is to demonstrate the AI-assisted development process and provide transparency into how AI tools were used during the project lifecycle.

---

# Prompt 1 — Project Initialization

## Prompt

```text
Create a new Next.js project with Neon PostgreSQL database integration.
Use TypeScript, Prisma ORM, and App Router.
Configure the project structure for scalability.
```

## Purpose

Used to bootstrap the project structure and establish the initial technology stack.

## Outcome

Generated:

* Next.js App Router setup
* Prisma configuration
* Neon PostgreSQL connection
* TypeScript configuration
* Initial project structure

---

# Prompt 2 — Assignment Discovery Prompt

## Prompt

```text
You are a junior engineer helping me complete an internship assignment.

The assignment is to reverse engineer Splitwise, scope a realistic 3-day version,
and build a working deployed app.

Important instructions:

1. Do not assume product requirements.
2. Do not jump directly into implementation.
3. Ask me detailed questions about product scope, UX, workflows, edge cases, and engineering decisions.
4. Ask about every implementation detail needed to build the app.
5. After each answer I give, update a Markdown file called AI_CONTEXT.md.
6. AI_CONTEXT.md must become the source of truth for the entire project.
7. The final app must be buildable from AI_CONTEXT.md.
8. Another evaluator should be able to paste AI_CONTEXT.md into the same AI tool and recreate a similar app.
9. Before writing code, produce a build plan based only on the agreed context.
10. During implementation, keep updating AI_CONTEXT.md whenever requirements, architecture, schema, UI, or logic changes.
11. Do not recommend technical solutions. Your job is to let me think through the technical solution.

Start by interviewing me.
```

## Purpose

This was the official prompt provided as part of the internship assignment.

## Outcome

The AI conducted product discovery and requirement gathering before implementation began.

The following areas were explored:

* Product goals
* User personas
* Core workflows
* Data model
* Authentication
* Groups
* Expenses
* Settlements
* UI structure
* API design
* Deployment strategy

---

# Prompt 3 — Splitwise Product Research

## Prompt

```text
Analyze Splitwise and identify the minimum viable features required to build a simplified version within 1 day.
```

## Purpose

To identify essential functionality and reduce scope.

## Outcome

Identified:

* Authentication
* Groups
* Expense tracking
* Expense splitting
* Balance calculation
* Settlements

as the core MVP features.

---

# Prompt 4 — Database Schema Design

## Prompt

```text
Design a relational database schema for a Splitwise-like application using PostgreSQL and Prisma.

Support:

- Users
- Groups
- Group Members
- Expenses
- Expense Splits
- Settlements
- Notifications
- Messaging
```

## Purpose

To create the database structure.

## Outcome

Generated the core entities:

* User
* Group
* GroupMember
* Expense
* ExpenseSplit
* Settlement
* Notification
* Conversation
* ConversationParticipant
* ChatMessage

---

# Prompt 5 — Expense Split Logic

## Prompt

```text
Design the data model and business logic required to support:

- Equal split
- Unequal split
- Percentage split
- Share-based split
```

## Purpose

To support all expense split methods required by the assignment.

## Outcome

Implemented flexible expense split calculations using ExpenseSplit records.

---

# Prompt 6 — Authentication System

## Prompt

```text
Generate authentication architecture for a Next.js application using JWT authentication and protected routes.
```

## Purpose

To implement secure authentication.

## Outcome

Created:

* Registration flow
* Login flow
* Session management
* Protected pages

---

# Prompt 7 — API Design

## Prompt

```text
Design REST APIs for:

- Authentication
- Groups
- Expenses
- Settlements
- Notifications
- Messaging
```

## Purpose

To establish backend communication patterns.

## Outcome

Generated API structures and endpoint definitions.

---

# Prompt 8 — Frontend Architecture

## Prompt

```text
Design the frontend structure for a Splitwise-inspired application using Next.js App Router.

Include:

- Authentication pages
- Dashboard
- Group pages
- Expense pages
- Settlement pages
```

## Purpose

To organize the application UI.

## Outcome

Created the route and page hierarchy used throughout development.

---

# Prompt 9 — Messaging System

## Prompt

```text
Design a direct messaging system between users and an expense-based comment system.
```

## Purpose

To support communication features.

## Outcome

Generated:

* Conversation model
* ConversationParticipant model
* ChatMessage model
* Expense messaging structure

---

# Prompt 10 — Notification System

## Prompt

```text
Design a notification system for group activity, expenses, and settlements.
```

## Purpose

To improve user awareness of application events.

## Outcome

Created notification models and notification workflows.

---

# Prompt 11 — Deployment Guidance

## Prompt

```text
Provide deployment instructions for a Next.js application using Vercel and Neon PostgreSQL.
```

## Purpose

To deploy the application.

## Outcome

Generated deployment workflow including:

* Environment variables
* Database configuration
* Production deployment steps

---

# Prompt 12 — Documentation Generation

## Prompt

```text
Generate README.md, BUILD_PLAN.md, AI_CONTEXT.md, and supporting project documentation based on the implemented architecture.
```

## Purpose

To satisfy assignment deliverables.

## Outcome

Generated project documentation covering:

* Product understanding
* Architecture
* AI collaboration
* Database design
* API design
* Deployment
* Tradeoffs
* Limitations

---

# AI Tools Used

The following AI tools were used during development:

* ChatGPT
* Cursor AI
* Codex
* GitHub Copilot / Codex

---

# Role of AI in Development

AI was used as a software engineering assistant for:

* Product research
* Requirement analysis
* Database design
* API design
* Frontend architecture
* Debugging
* Documentation generation
* Deployment assistance

Final architectural decisions, implementation validation, testing, and deployment were performed manually.
