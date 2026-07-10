# admin-shared-components Specification

## Purpose
TBD - created by archiving change split-admin-articles-and-forms. Update Purpose after archive.
## Requirements
### Requirement: PaginationBar SHALL be a reusable shared component

The `PaginationBar` component SHALL provide a consistent pagination UI for both articles and stores list pages. It SHALL accept `page`, `totalPages`, `onPrev`, and `onNext` props. The component MUST use the existing visual style (border-zinc-800, bg-zinc-900, disabled states).

#### Scenario: PaginationBar renders current page and navigation buttons
- **WHEN** the component receives `page=2`, `totalPages=5`
- **THEN** it SHALL display "第 2 / 5 页" and enable both prev/next buttons

#### Scenario: Previous button disabled on first page
- **WHEN** the component receives `page=1`
- **THEN** the "上一页" button SHALL be disabled

#### Scenario: Next button disabled on last page
- **WHEN** the component receives `page=5`, `totalPages=5`
- **THEN** the "下一页" button SHALL be disabled

### Requirement: EmptyState SHALL be a reusable shared component

The `EmptyState` component SHALL provide a consistent empty state display for admin list pages. It SHALL accept `icon` (Lucide icon component), `title`, and `description` props.

#### Scenario: EmptyState renders with custom content
- **WHEN** the component receives `title="暂无文章"` and `description="点击上方按钮创建第一篇文章"`
- **THEN** it SHALL render the title and description with a default icon

