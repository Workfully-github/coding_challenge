# Candidate Management System

A Next.js 14 application for managing candidate hiring decisions with enforced business rules.

## Approach

### Step 1: Diagnosis

Before writing any code, I audited the existing codebase and identified four categories of problems:

1. **Business rules not enforced** — The decision endpoint accepted any status transition (REJECTED→SHORTLISTED worked), ignored short reasons, and allowed empty candidate names. The `candidate!` non-null assertion masked a missing 404 check.

2. **Flat architecture** — Business logic lived directly in API route handlers, making it untestable in isolation and tightly coupled to HTTP concerns.

3. **Weak type safety** — `strict: false` in tsconfig, `as any` casts in routes, `saveCandidate(candidate: any)` in storage, and untyped status strings (`let newStatus` without a type).

4. **Monolithic frontend** — A single 288-line component with inline fetch calls, no loading states, no input validation, and no prevention of illegal actions in the UI.

### Step 2: Enable strict TypeScript

First change, highest leverage. Setting `strict: true` and `noImplicitAny: true` immediately surfaces every type hole. This forces all subsequent code to be properly typed from the start rather than retrofitting types later.

### Step 3: Domain layer (inside-out)

Built the core business logic first with zero dependencies on frameworks or infrastructure:

- **`domain/errors.ts`** — Typed error hierarchy (`ValidationError`, `InvalidStatusTransitionError`, `CandidateNotFoundError`) so the API layer can map each error to the correct HTTP status code.
- **`domain/candidate.ts`** — Immutable entity where `applyDecision()` returns a new instance instead of mutating state. The valid transition map (`NEW→SHORTLISTED`, `NEW→REJECTED`, everything else blocked) is a simple lookup table. Factory method `create()` validates name, `applyDecision()` validates reason length (>= 10 chars) and transition legality.

### Step 4: Infrastructure layer

**`infrastructure/candidate-repository.ts`** — Repository pattern wrapping the in-memory `Map`. Stores plain records and reconstitutes domain entities on read. This replaces the old `storage.ts` which had `any` typing and leaked domain objects into persistence.

### Step 5: Application layer

**`application/candidate-service.ts`** — Orchestrates the use cases: `listCandidates()`, `createCandidate()`, `applyDecision()`. Each method coordinates repository lookups with domain operations. The service is where the `CandidateNotFoundError` is thrown (domain entity doesn't know about persistence).

### Step 6: Thin API controllers

Rewrote both route handlers to only: parse the request body → call the service → map domain errors to HTTP status codes. No business logic remains in the routes. Error mapping: `ValidationError→400`, `CandidateNotFoundError→404`, `InvalidStatusTransitionError→409`.

### Step 7: Frontend decomposition

Split the monolithic page into five focused components:
- **`candidate-board.tsx`** — Grid display with loading state
- **`candidate-card.tsx`** — Individual card with status color mapping
- **`create-candidate-form.tsx`** — Creation form with disabled state while submitting
- **`decision-form.tsx`** — Decision form that hides options for terminal statuses (SHORTLISTED/REJECTED show "no further transitions available"), validates reason length client-side with character counter
- **`error-banner.tsx`** — Reusable error display

The page now uses the existing API client (`ui/api/candidates.ts`) instead of duplicating fetch calls inline.

### Step 8: Improved API client

Added `ApiError` class with typed `code` and `status` fields, and a generic `handleResponse<T>()` to centralize error handling for all endpoints.

### Step 9: Tests (domain-first)

Wrote 29 tests across three levels, prioritizing the domain layer where all business rules live.

### Step 10: Cleanup

Deleted the obsolete `src/models/candidate.ts` and `src/data/storage.ts` that were replaced by the new layers.

## Assumptions

- **In-memory storage is intentional** — The challenge is about architecture and business rules, not persistence. The repository pattern makes swapping to a real database a single-file change.
- **Status transitions are terminal** — Once SHORTLISTED or REJECTED, a candidate cannot change status. This matches the business rules displayed in the original UI.
- **Reason validation uses trimmed length** — Whitespace-only strings don't count. "          " (10 spaces) fails the 10-character minimum.
- **Next.js 14 params API** — Used `await params` in the decision route for forward compatibility with Next.js 15 where params becomes a Promise. Works in 14 because `await` on a non-thenable returns the value directly.

## Key Decisions

| Decision | Why |
|----------|-----|
| Immutable Candidate entity | Prevents the original bug where `candidate!.status = newStatus` mutated shared state. `applyDecision()` returns a new instance. |
| Typed error hierarchy | Enables precise HTTP status mapping in controllers. Generic `"Error"` messages replaced with actionable descriptions. |
| Transition map as data | `VALID_TRANSITIONS` is a `Record<Status, Status[]>` lookup — easy to read, easy to extend, impossible to forget a case. |
| `reconstitute()` factory | Separates creation (with validation) from hydration (from persistence). Repository reads don't re-validate existing data. |
| Repository stores plain records | Domain entities are reconstituted on read, not stored directly. This prevents the old pattern of mutating objects that live in the `Map`. |
| Client-side validation mirrors server | The `DecisionForm` disables illegal transitions and shows character count, but the server enforces all rules independently. UI is a convenience, not a gate. |
| Service receives repository via constructor | Enables mocking in tests without module-level patching. The API route tests use the real stack; service tests mock the repository. |

## Architecture

```
src/
├── domain/                    # Pure domain logic (no dependencies)
│   ├── candidate.ts           # Immutable Candidate entity with business rules
│   └── errors.ts              # Typed domain errors
├── application/               # Use case orchestration
│   └── candidate-service.ts   # Service layer coordinating domain + infrastructure
├── infrastructure/            # Persistence layer
│   └── candidate-repository.ts # Repository pattern over in-memory store
├── contracts/                 # Shared DTOs and types
│   └── candidate.ts
├── app/
│   ├── api/candidates/        # Thin API controllers (parse → delegate → respond)
│   └── live-session/          # UI with separated components
├── ui/api/                    # Client-side API layer with typed errors
└── __tests__/                 # Unit + integration tests
```

## Business Rules

- **NEW** candidates can be **SHORTLISTED** or **REJECTED**
- **SHORTLISTED** candidates cannot change status
- **REJECTED** candidates cannot change status
- Decision reason must be at least **10 characters** (trimmed)
- Candidate name cannot be empty (trimmed)

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Successful operation |
| 201  | Candidate created |
| 400  | Validation error (empty name, short reason) |
| 404  | Candidate not found |
| 409  | Invalid status transition |
| 500  | Internal server error |

## Testing Strategy

Tests are organized in three levels, prioritizing the domain layer where all business rules live:

| Level | What it tests | How | Location |
|-------|--------------|-----|----------|
| **Unit (domain)** | Candidate entity: creation validation, all valid/invalid transitions, reason length, immutability | Direct method calls, no mocks | `__tests__/domain/` |
| **Unit (service)** | Orchestration: correct delegation to repository, error propagation, persistence calls | Mocked repository via constructor injection | `__tests__/application/` |
| **Integration (API)** | Full HTTP flow: request parsing, service delegation, error-to-status mapping | Real Next.js route handlers with real storage | `__tests__/api/` |

**Why domain tests first:** The domain entity contains every business rule. If `Candidate.applyDecision()` correctly rejects `REJECTED→SHORTLISTED`, the API endpoint will too — the route handler just delegates. Testing the domain in isolation gives confidence without the overhead of HTTP.

**Why mock the repository in service tests:** The service's job is orchestration (find → apply → save). Mocking the repository verifies that the service calls the right methods in the right order, without coupling tests to the in-memory store's state.

**Why integration tests use real storage:** The API tests verify the full stack from HTTP request to response, including error-to-status-code mapping. This catches wiring issues that unit tests miss.

**29 total tests** covering: valid/invalid creation, all transition paths, reason validation, immutability, 404/400/409 error codes, and service orchestration.

## Running

```bash
npm install
npm run dev       # Development server at localhost:3000
npm test          # Run all tests (29 tests)
npm run build     # Production build with strict TypeScript
```
