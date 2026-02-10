# Candidate Management System

## Context

You've inherited a candidate management system for a recruiting platform. The basic CRUD operations work (list, create, update), but the application has **critical issues**:

- **Missing business rule validations** - Status transitions and input validation are not enforced
- **Poor architecture** - No separation of concerns, business logic mixed with API routes
- **Code quality issues** - Weak typing, poor error handling, code duplication, etc

The previous developer built this as a quick prototype. Your job is to make it production-ready by implementing the missing validations and refactoring the code to follow software engineering best practices.

## Your Mission

Transform this prototype into production-quality code:

1. **Implement missing validations** - Enforce all business rules (status transitions, reason length, input validation)
2. **Apply proper architecture** - Implement clean, layered architecture with clear separation of concerns
3. **Improve code quality** - Fix TypeScript usage, error handling, and code organization
4. **Enhance the frontend** - Improve component structure, state management, and user experience

## What We're Evaluating

- **Architecture & Design**: Can you design and implement a clean, maintainable structure?
- **Domain-Driven Design**: Understanding of domain modeling, encapsulation, and business logic separation
- **Code Quality**: TypeScript best practices, validation, error handling, and clean code principles
- **Full-Stack Skills**: Both backend and frontend improvements
- **Problem-Solving**: How you identify and prioritize issues
- **Tool Usage**: Effective use of development tools and AI assistance

## Business Rules (MUST BE ENFORCED)
- Cannot `SHORTLIST` a `REJECTED` candidate
- Cannot `REJECT` a `SHORTLISTED` candidate
- `reason` must be at least 10 characters
- These rules are currently **NOT** enforced - you need to implement them!


## Technical Expectations

### Architecture
- Clean layered architecture
- Separation of concerns
- Domain logic separate from infrastructure
- Proper error handling with appropriate HTTP codes

### Code Quality
- Strong TypeScript typing
- SOLID principles
- Encapsulation and immutability where appropriate
- Well-structured, maintainable code

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000/live-session

## Notes

- You need to identify flaws in terms of architecture, functionality, UX/UI, and code quality and solve them.
- You can restructure folders and files as needed
- You can add new files, utilities, or patterns
- Focus on the most impactful improvements first
- All existing functionality must continue to work
- Add a README file to explain your approach, assumptions, and decisions [IMPORTANT]
- Add tests and explain the strategy for testing in README
