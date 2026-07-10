## ADDED Requirements

### Requirement: Shared product topic component library
The system SHALL provide a shared product topic component library for vehicle topic pages. The library MUST render common topic modules through reusable components instead of requiring each brand or vehicle page to copy its own `Hero`, `Faq`, `ServiceFlow`, `ScenarioMatrix`, `ProjectGrid`, and `TopicViewTrack` implementation.

#### Scenario: Shared components are available
- **WHEN** a developer builds a vehicle topic page
- **THEN** the developer can import shared topic components from `src/components/product-topic`

#### Scenario: Existing brand data remains owned by brand modules
- **WHEN** a vehicle topic page uses the shared components
- **THEN** the page can keep its existing brand-specific source data files and pass adapted data into the shared components

### Requirement: Typed product topic contract
The system SHALL define a strict TypeScript contract for product topic configuration. The contract MUST cover topic identity, accent token, hero copy, categories, projects, scenarios, service flow, FAQ items, and tracking keys without using `any`.

#### Scenario: Topic configuration is type checked
- **WHEN** a topic config omits required fields such as `id`, `title`, `accent`, `projects`, or `categories`
- **THEN** TypeScript reports an error before runtime

#### Scenario: Brand-specific category strings remain supported
- **WHEN** a topic has category keys that differ from another brand
- **THEN** the shared contract accepts the category keys through generics or literal string unions

### Requirement: Controlled accent theming
The system SHALL use a controlled accent token map for shared topic components. Components MUST NOT rely on unbounded dynamic Tailwind class names for brand colors.

#### Scenario: Supported accent renders stable classes
- **WHEN** a topic config sets an accent such as `orange`, `cyan`, `amber`, `emerald`, `violet`, `blue`, `teal`, `red`, `sky`, or `pink`
- **THEN** shared components render classes from a static theme map

#### Scenario: Unsupported accent is rejected
- **WHEN** a topic config uses an accent token outside the supported set
- **THEN** TypeScript rejects the config or the runtime assertion fails during development

### Requirement: Shared project grid behavior
The system SHALL provide a shared project grid component that supports category filtering, optional scenario filtering, project card expansion, image status labels, empty states, and click tracking.

#### Scenario: Category filtering
- **WHEN** the user selects a category tab
- **THEN** the grid shows only projects in that category and updates the selected tab state

#### Scenario: All category reset
- **WHEN** the user selects the all category tab
- **THEN** the grid shows all projects allowed by the active scenario filter

#### Scenario: Project card expansion
- **WHEN** the user activates a project card
- **THEN** the card expands or collapses without navigating away from the page

#### Scenario: Empty category state
- **WHEN** category and scenario filters produce no matching projects
- **THEN** the grid renders a clear empty state instead of an empty layout gap

#### Scenario: Image status labels
- **WHEN** a project has an image status such as `product-preview`, `matched`, `pending-review`, or `missing`
- **THEN** the grid renders the configured public-facing status label

### Requirement: Scenario hash compatibility
The system SHALL preserve existing scenario hash navigation semantics for migrated pages. Shared helpers MUST parse scenario hashes and project hashes through per-topic configuration so existing inbound links continue to work.

#### Scenario: Scenario hash opens filtered grid
- **WHEN** the page loads with a hash matching a configured scenario anchor
- **THEN** the shared project grid applies the scenario filter and scrolls the grid into view

#### Scenario: Project hash opens project detail
- **WHEN** the page loads with a hash matching a configured project anchor
- **THEN** the matching project card opens automatically

#### Scenario: Unknown hash is ignored
- **WHEN** the page loads with an unknown hash
- **THEN** the shared components render the default unfiltered state without throwing

### Requirement: Tracking compatibility
The system SHALL preserve existing topic tracking semantics for migrated pages. Shared components MUST accept explicit tracking event keys from topic configuration instead of generating new event names automatically.

#### Scenario: Project click tracking
- **WHEN** the user opens a project card on a migrated page
- **THEN** the analytics event uses the configured legacy-compatible project click event key

#### Scenario: Category filter tracking
- **WHEN** the user changes category filters on a migrated page
- **THEN** the analytics event uses the configured legacy-compatible category filter event key

#### Scenario: Topic view tracking
- **WHEN** a migrated topic page mounts in the browser
- **THEN** the shared topic view tracker emits the configured topic view event metadata

### Requirement: Pilot migration coverage
The system SHALL migrate at least two representative vehicle topic pages to the shared component system before the change is considered complete.

#### Scenario: Complex interaction pilot is migrated
- **WHEN** the implementation is complete
- **THEN** at least one complex topic page with project grid filtering, scenario filtering, hash parsing, expansion, and tracking uses the shared component system

#### Scenario: Repeated-series pilot is migrated
- **WHEN** the implementation is complete
- **THEN** at least one page from a repeated family such as `li-auto` uses the shared component system

#### Scenario: Pilot pages keep public behavior
- **WHEN** the migrated pilot pages are loaded at their existing public routes
- **THEN** their route paths, primary headings, CTA links, category tabs, scenario links, and FAQ content remain available

### Requirement: Extensibility slots
The system SHALL allow vehicle topic pages to keep page-specific sections outside the shared modules. The shared component system MUST NOT require every page to fit a single rigid template.

#### Scenario: Page-specific section remains possible
- **WHEN** a vehicle topic page needs a custom section that is not part of the shared component set
- **THEN** the page can render that section before, between, or after shared components

### Requirement: Clone prevention check
The system SHALL include a guard against adding new full-copy vehicle topic component sets. The guard MUST detect new directories that recreate the full `Hero`, `Faq`, `ServiceFlow`, `ScenarioMatrix`, and `ProjectGrid` pattern without using the shared component system or an explicit allowlist entry.

#### Scenario: New copied component set is rejected
- **WHEN** a new vehicle topic directory adds a full set of cloned topic components
- **THEN** the check script fails and explains that the shared product topic component system must be used

#### Scenario: Existing legacy directories remain allowed during migration
- **WHEN** the check script scans existing legacy directories
- **THEN** it does not fail solely because historical components still exist

### Requirement: Verification coverage
The system SHALL add tests for the shared component system and migrated pilot pages. Tests MUST cover shared data contracts, hash parsing, project grid filtering, and pilot page smoke behavior.

#### Scenario: Unit tests cover shared helpers
- **WHEN** the test suite runs shared helper tests
- **THEN** hash parsing, image status labels, accent token mapping, and assertion helpers are covered

#### Scenario: Component tests cover project grid
- **WHEN** the project grid component test renders sample topic data
- **THEN** category filtering, scenario clearing, expansion, and empty state behavior are verified

#### Scenario: Browser smoke tests cover pilot pages
- **WHEN** Playwright or the existing frontend smoke flow visits migrated pilot pages at 390px, 768px, and 1440px
- **THEN** the pages render without hydration errors, horizontal overflow, or missing primary content
