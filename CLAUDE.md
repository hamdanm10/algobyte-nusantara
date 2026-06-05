# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Internal platform for **Algobyte Teknologi Nusantara**. Will encompass multiple interconnected sub-applications: project management, company product listing, invoice generation for clients, and financial recording for tax reporting. **Currently focused on the landing page only** — database schema / ERD is not yet designed.

## Stack

- Ruby 4.0.5, Rails 8.1.3
- PostgreSQL (primary database)
- Propshaft (asset pipeline), importmap-rails (JS, no bundler), Hotwire (Turbo + Stimulus)
- Tailwind CSS v4 + Flowbite
- Solid Cache, Solid Queue, Solid Cable — all DB-backed (no Redis/Valkey needed)
- Kamal + Thruster for deployment

## Commands

```bash
bin/setup                # Install deps, prepare DB, start server
bin/setup --skip-server  # Install deps and prepare DB only
bin/dev                  # Start development server (rails server)
bin/ci                   # Full CI suite (setup, rubocop, security audits)

bin/rails db:prepare     # Create and migrate DB
bin/rails db:reset       # Drop, recreate, and seed DB

bundle exec rspec                       # Run full test suite
bundle exec rspec spec/path/to_spec.rb  # Run a single spec file

bin/rubocop                              # Lint Ruby (rubocop-rails-omakase style)
bin/brakeman --quiet --no-pager          # Static security analysis
bin/bundler-audit                        # Audit gems for known CVEs
bin/importmap audit                      # Audit JS packages via importmap
```

## Architecture Patterns

### Service Layer

All business logic lives in service objects, not in controllers or models. Every service inherits from `BaseService`.

```ruby
# app/services/base_service.rb
class BaseService
  # shared interface — call, result, errors, etc.
end

# app/services/invoices/create_service.rb
class Invoices::CreateService < BaseService
end
```

### Repository Layer

All direct database interactions (queries, complex scopes) go in repository classes, not in models or services.

```ruby
# app/repositories/invoice_repository.rb
class InvoiceRepository
  # query methods only
end
```

### Controllers

Keep controllers as thin as possible — only handle params, call a service, then render/redirect.

### View Components

UI components are built with **ViewComponent**. Do not write presentation logic directly in ERB partials.

```ruby
# app/components/card_component.rb
class CardComponent < ViewComponent::Base
end
```

### Views & JavaScript

- Use **Turbo Frames** and **Turbo Streams** for all dynamic interactions (full Turbo, no full-page reloads).
- JavaScript logic goes in **Stimulus controllers** (`app/javascript/controllers/`), never inline in views.
- Install JS packages via importmap: `bin/importmap pin <package>`

### Lottie Animations

Use **dotlottie-web** to play `.lottie` files. Reference: https://github.com/lottiefiles/dotlottie-web. Install via importmap.

### Pagination & Search

- Pagination: **Pagy**
- Search / filtering: **Ransack**

## Testing

Use **RSpec**. Place specs under `spec/` following the standard convention:
- `spec/services/` for service objects
- `spec/repositories/` for repositories
- `spec/components/` for ViewComponents

## Architecture Notes

**Multi-database production setup**: Production uses four separate PostgreSQL databases — `primary`, `cache`, `queue`, and `cable` — each with its own `migrations_paths` in `config/database.yml`. Development/test use a single database only.

**Background jobs in-process**: Solid Queue runs inside the Puma web process via `SOLID_QUEUE_IN_PUMA: true` (see `config/deploy.yml`). On multi-server production setups, split job processing to a dedicated server using `bin/jobs`.

**No asset bundling**: JavaScript is served via importmap (no Node/npm/Webpack). CSS goes in `app/assets/stylesheets/`.

**Linting style**: RuboCop uses `rubocop-rails-omakase` (Basecamp's opinionated defaults). Override rules in `.rubocop.yml`.

## Commit Message Convention

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

- Header is mandatory; scope is optional. Max 100 characters per line.
- Subject: imperative present tense, no capital first letter, no trailing period.
- Body: explain *why*, not what. Contrast with previous behavior.
- Footer: use `BREAKING CHANGE:` prefix for breaking changes; reference closed issues.

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |
| `test` | Adding or correcting tests |
| `docs` | Documentation only |
| `build` | Build system or dependency changes |
| `ci` | CI configuration changes |

**Examples:**
```
feat(invoice): add PDF export for client invoices

fix(auth): redirect to login when session expires

refactor(project): extract creation logic into CreateService
```

## Deployment

Deployed via Kamal. Container image registry is at `localhost:5555`. `RAILS_MASTER_KEY` is injected as a secret.

```bash
bin/kamal console   # Rails console on production
bin/kamal logs      # Tail production logs
bin/kamal shell     # Bash shell into production container
```
