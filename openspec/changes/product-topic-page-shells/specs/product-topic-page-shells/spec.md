## ADDED Requirements

### Requirement: Shared topic page shells
The system SHALL provide shared page shells for product topic pages. The shells MUST support first-level topic pages and model-level topic pages without requiring each route file to copy page chrome, common section ordering, structured-data scripts, CTA sections, and compliance notes.

#### Scenario: First-level topic page uses shell
- **WHEN** a first-level topic route such as `/product/xiaomi`, `/product/wenjie`, `/product/zeekr`, or `/product/flooring` is migrated
- **THEN** the route can render through `TopicPageShell`

#### Scenario: Model-level topic page uses shell
- **WHEN** a model-level route such as `/product/xiaomi/su7` or `/product/wenjie/m7` is migrated
- **THEN** the route can render through `ModelTopicShell`

#### Scenario: Shell renders accessible main region
- **WHEN** a migrated page renders through a shell
- **THEN** the shell renders a `main` region with `id="main-content"` and keyboard-focus support equivalent to existing pages

### Requirement: Typed shell configuration
The system SHALL define strict TypeScript configuration types for product topic shells. The configuration MUST cover route identity, accent token, hero content, stats, service flow, CTA, compliance copy, structured-data settings, and extension sections without using `any`.

#### Scenario: Missing required shell fields fail typecheck
- **WHEN** a page config omits required fields such as route path, hero title, or structured-data identity
- **THEN** TypeScript reports an error before runtime

#### Scenario: Unsupported accent fails typecheck
- **WHEN** a page config uses an accent token outside the supported map
- **THEN** TypeScript rejects the config or a development assertion fails

#### Scenario: Page-specific sections remain possible
- **WHEN** a page needs a gallery, feature grid, submodel grid, or bespoke product group section
- **THEN** the shell accepts children or slots that render those page-specific sections

### Requirement: Shared structured-data helpers
The system SHALL provide shared pure helpers for product topic JSON-LD. The helpers MUST support breadcrumb schema, `ItemList` schema, and `CollectionPage` schema used by current topic pages.

#### Scenario: Breadcrumb JSON-LD generated
- **WHEN** a migrated page provides a product route path with breadcrumb data
- **THEN** the shell renders breadcrumb JSON-LD equivalent to the current product breadcrumb schema

#### Scenario: ItemList JSON-LD generated
- **WHEN** a migrated brand topic page provides project items
- **THEN** the shell renders `ItemList` JSON-LD with stable item positions, names, and URLs

#### Scenario: CollectionPage JSON-LD generated
- **WHEN** a migrated category topic page such as flooring provides product groups
- **THEN** the shell renders `CollectionPage` JSON-LD with an embedded `ItemList`

#### Scenario: JSON-LD serialization is safe
- **WHEN** JSON-LD data is rendered into script tags
- **THEN** the serializer produces valid JSON and avoids hand-written string concatenation in route files

### Requirement: Shared service flow section
The system SHALL provide a shared service flow section for product topic pages. The section MUST support the existing four-step and six-step flows used by current topic pages.

#### Scenario: Four-step service flow
- **WHEN** a page config provides four service steps
- **THEN** the shell renders all four steps in order with stable step labels

#### Scenario: Six-step service flow
- **WHEN** a page config provides six service steps
- **THEN** the shell renders all six steps in order without layout overflow at mobile, tablet, or desktop widths

#### Scenario: Service flow disclaimer
- **WHEN** a page config provides a service flow note
- **THEN** the shell renders the note near the service flow section

### Requirement: Shared CTA and compliance sections
The system SHALL provide shared bottom CTA and compliance/disclaimer sections for product topic pages.

#### Scenario: Bottom CTA rendered
- **WHEN** a migrated page config provides CTA title, description, and links
- **THEN** the shell renders the bottom CTA with the configured content and links

#### Scenario: Compliance note rendered
- **WHEN** a migrated page config provides compliance copy
- **THEN** the shell renders the compliance note using consistent muted styling

#### Scenario: CTA target remains stable
- **WHEN** a migrated page currently links back to `/product` or another existing CTA target
- **THEN** the migrated page preserves that CTA target unless the config explicitly changes it

### Requirement: Pilot migrations
The system SHALL migrate at least two representative product topic pages to the shared shell system before the change is complete.

#### Scenario: Brand series pilot migrated
- **WHEN** implementation is complete
- **THEN** at least one brand series page such as `/product/xiaomi` or `/product/wenjie` uses `TopicPageShell`

#### Scenario: Service category pilot migrated
- **WHEN** implementation is complete
- **THEN** at least one service/category page such as `/product/flooring` uses `TopicPageShell`

#### Scenario: Pilot routes remain stable
- **WHEN** migrated pilot pages are loaded
- **THEN** their route paths, metadata title/description, primary headings, visible section content, and CTA links remain available

### Requirement: Compatibility with shared topic component system
The shell system SHALL remain compatible with the existing shared product topic component system. The shell MUST compose shared module components where available and MUST allow legacy topic components as slots during migration.

#### Scenario: Shell accepts shared components
- **WHEN** a page has migrated project grid, scenario matrix, service flow, or FAQ components from the shared product topic component library
- **THEN** those components can be rendered inside the shell

#### Scenario: Shell accepts legacy components during migration
- **WHEN** a page has not yet migrated all module components
- **THEN** existing legacy components can be passed through shell slots without changing their public output

### Requirement: Duplicate page shell prevention
The system SHALL include a check or documented guard against introducing new hand-written product topic page shells.

#### Scenario: New hand-written shell is flagged
- **WHEN** a new product topic route repeats hero, JSON-LD, service flow, CTA, and compliance sections directly in `page.tsx`
- **THEN** the guard reports that `TopicPageShell` or `ModelTopicShell` should be used

#### Scenario: Existing legacy pages remain allowed during migration
- **WHEN** the guard scans legacy pages that are not part of the pilot migration
- **THEN** it does not fail solely because historical repeated page structure remains

### Requirement: Verification coverage
The system SHALL include tests and browser checks for shell behavior and migrated pilot pages.

#### Scenario: JSON-LD helper tests
- **WHEN** JSON-LD helper tests run
- **THEN** they verify breadcrumb, `ItemList`, and `CollectionPage` output shapes

#### Scenario: Shell render tests
- **WHEN** shell component tests render sample configs
- **THEN** they verify hero, service flow, CTA, compliance, and JSON-LD scripts render from config

#### Scenario: Pilot browser checks
- **WHEN** migrated pilot pages are checked at 390px, 768px, and 1440px
- **THEN** they render primary content without hydration errors, horizontal overflow, or missing structured-data scripts
