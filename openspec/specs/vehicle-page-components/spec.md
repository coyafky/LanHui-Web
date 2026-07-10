# vehicle-page-components Specification

## Purpose
TBD - created by archiving change shared-vehicle-page-components. Update Purpose after archive.
## Requirements
### Requirement: VehiclePageConfig schema
The system SHALL provide a Zod-validated `VehiclePageConfig` type that defines the complete data structure for a vehicle product page. Each vehicle MUST provide a single config object conforming to this schema.

#### Scenario: Config defines theme
- **WHEN** a vehicle config sets `theme: "orange"`
- **THEN** the rendered page uses orange accent colors for buttons, badges, and links

#### Scenario: Config defines all sections
- **WHEN** a vehicle config includes hero, projects, scenarios, serviceFlow, faq, and bundles
- **THEN** `VehiclePageRenderer` renders all six sections in order

#### Scenario: Config omits optional section
- **WHEN** a vehicle config does not include bundles
- **THEN** the BundleList section is not rendered

### Requirement: Shared VehicleHero component
The system SHALL provide a `VehicleHero` component that renders from hero config data. It MUST support theme-aware styling and responsive layout.

#### Scenario: Theme-aware hero
- **WHEN** `VehicleHero` receives `theme: "cyan"` with hero config
- **THEN** the hero section uses cyan accent colors for badges and decorative elements

### Requirement: Shared service sections
The system SHALL provide `ProjectGrid`, `ScenarioMatrix`, `ServiceFlow`, `FaqSection`, and `BundleList` components, each driven by their respective config arrays. Each MUST accept `theme` for consistent styling.

#### Scenario: ProjectGrid renders all upgrade projects
- **WHEN** ProjectGrid receives 10 project items
- **THEN** it renders 10 project cards in the configured layout

### Requirement: VehiclePageRenderer composition
The system SHALL provide a `VehiclePageRenderer` that accepts a `VehiclePageConfig` and composes all sections with consistent spacing and theming. It MUST be usable as a single component in a vehicle page route.

#### Scenario: Single component entry
- **WHEN** a page imports `<VehiclePageRenderer config={xiaomiYu7Config} />`
- **THEN** it renders the complete Xiaomi YU7 page with hero, grid, flow, FAQ, and bundles

### Requirement: Pilot migration
The system SHALL migrate at least 2 existing vehicle pages to use the shared component system as proof of concept.

#### Scenario: Xiaomi YU7 migrated
- **WHEN** the xiaomi-yu7 page is rendered through VehiclePageRenderer
- **THEN** the visual output matches the pre-migration page

#### Scenario: ZEEKR 9X migrated
- **WHEN** the zeekr-9x page is rendered through VehiclePageRenderer  
- **THEN** the visual output matches the pre-migration page

