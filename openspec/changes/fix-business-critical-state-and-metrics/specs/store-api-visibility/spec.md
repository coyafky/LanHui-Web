## ADDED Requirements

### Requirement: Public store list exposes active stores only
The store list API SHALL return only active public stores to unauthenticated callers and non-admin authenticated callers.

#### Scenario: Public caller requests inactive stores
- **WHEN** an unauthenticated caller requests `GET /api/stores?isActive=false`
- **THEN** the response contains no pending, suspended, terminated, or otherwise non-public stores

#### Scenario: Public caller requests non-active status
- **WHEN** an unauthenticated caller requests `GET /api/stores?status=pending`
- **THEN** the response contains no pending stores

#### Scenario: Non-admin caller requests all stores
- **WHEN** an authenticated non-admin caller requests `GET /api/stores?all=true`
- **THEN** the response is still constrained to active public stores

### Requirement: Admin store list supports operational filters
The store list API SHALL allow authenticated admins using `all=true` to filter by operational visibility fields.

#### Scenario: Admin requests inactive stores
- **WHEN** an authenticated admin requests `GET /api/stores?all=true&isActive=false`
- **THEN** the response may include non-active stores matching the requested filter

#### Scenario: Admin requests non-active status
- **WHEN** an authenticated admin requests `GET /api/stores?all=true&status=suspended`
- **THEN** the response may include suspended stores matching the requested filter

### Requirement: Store visibility tests protect the public boundary
The system SHALL include API tests proving public callers cannot retrieve non-active stores through legacy or status filters.

#### Scenario: Insecure legacy expectation is removed
- **WHEN** the store API test suite runs
- **THEN** no test expects unauthenticated `isActive=false` requests to return inactive store records
