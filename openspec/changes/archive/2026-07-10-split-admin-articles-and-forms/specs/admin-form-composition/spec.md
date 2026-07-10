## ADDED Requirements

### Requirement: StoreForm SHALL be split into field group components

The `StoreForm` component SHALL be refactored into a thin container that composes field group sub-components: `StoreBasicInfoFields`, `StoreContactFields`, `StoreLevelSelect`, and `StoreImageUploader`. The form's external interface (props, onSubmit behavior) MUST remain identical.

#### Scenario: Create store form renders all field groups
- **WHEN** an admin navigates to `/admin/stores/new`
- **THEN** the form SHALL render StoreBasicInfoFields, StoreContactFields, StoreLevelSelect, and StoreImageUploader
- **AND** form submission behavior SHALL be unchanged

#### Scenario: Edit store form works with existing callers
- **WHEN** an admin navigates to `/admin/stores/[id]`
- **THEN** the form SHALL render with pre-populated field values from defaultValues
- **AND** the edit page's formId and onSubmit integration SHALL continue to work

### Requirement: ArticleForm SHALL be split into field group components

The `ArticleForm` component SHALL be refactored into a thin container that composes field group sub-components: `ArticleTitleSlugFields`, `ArticleContentEditor`, `ArticleMetaFields`, and `ArticleTagInput`. The form's external interface (props, onSubmit behavior) MUST remain identical.

#### Scenario: Create article form renders all field groups
- **WHEN** an admin navigates to `/admin/articles/new`
- **THEN** the form SHALL render ArticleTitleSlugFields, ArticleContentEditor, ArticleMetaFields, and ArticleTagInput
- **AND** title-to-slug auto-generation SHALL continue to work

#### Scenario: Edit article form works with existing callers
- **WHEN** an admin navigates to `/admin/articles/[id]`
- **THEN** the form SHALL render with pre-populated field values
- **AND** auto-focus on first validation error SHALL continue to work

#### Scenario: Existing ArticleForm tests continue to pass
- **WHEN** `npx vitest run src/components/admin/ArticleForm.test.tsx` is executed after refactoring
- **THEN** all existing tests SHALL pass without modification
