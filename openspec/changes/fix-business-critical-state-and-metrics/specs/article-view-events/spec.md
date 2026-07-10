## ADDED Requirements

### Requirement: Article GET is read-only
The article detail GET API SHALL NOT update `viewCount` or perform any other analytics write as a side effect of reading article data.

#### Scenario: Public GET does not increment view count
- **WHEN** a caller requests `GET /api/articles/{id}`
- **THEN** the API returns article data without writing a `viewCount` increment

#### Scenario: Admin GET does not increment view count
- **WHEN** the CMS loads an article for editing
- **THEN** the API returns article data without counting the CMS load as a public view

#### Scenario: Metadata or crawler GET does not increment view count
- **WHEN** metadata generation, crawlers, monitors, or tests request article data
- **THEN** those reads do not change article view metrics

### Requirement: Public article pages emit article view events
The public article detail page SHALL send a client-side `article_view` event after a real page exposure.

#### Scenario: Public article exposure sends event
- **WHEN** a visitor views a published article page in the browser
- **THEN** the client sends an `article_view` event containing the article identity and a session identity

#### Scenario: Admin edit page does not send event
- **WHEN** an admin opens an article in the CMS
- **THEN** the client does not send a public `article_view` event

### Requirement: Article view events are validated and deduplicated
The server SHALL validate article view events and deduplicate repeated events before updating view metrics.

#### Scenario: Event for unpublished article is rejected
- **WHEN** the server receives an `article_view` event for a draft, withdrawn, archived, or missing article
- **THEN** the event is rejected or ignored without incrementing public view metrics

#### Scenario: Duplicate event in window is ignored
- **WHEN** the same session sends multiple `article_view` events for the same article within the configured dedupe window
- **THEN** only one view is counted

#### Scenario: Valid event updates metrics asynchronously or transactionally
- **WHEN** a valid non-duplicate `article_view` event is accepted
- **THEN** the system records the event and updates article view metrics through a controlled aggregation path

### Requirement: Article view metrics are documented as public exposure metrics
The admin UI and code comments SHALL treat `viewCount` as a public article exposure metric, not as raw API read count.

#### Scenario: Metrics label avoids API-read wording
- **WHEN** admin UI displays article view counts
- **THEN** the label or surrounding code reflects that the number represents deduplicated public page exposure
