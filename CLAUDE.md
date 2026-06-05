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

Pages that do not require authentication live under `app/controllers/public/` and inherit from `Public::PublicController`. This base controller sets the `public_application` layout automatically.

```
app/controllers/public/public_controller.rb   ← base for all public pages
app/controllers/public/home_controller.rb     ← example public controller
app/views/layouts/public_application.html.erb ← layout for public pages
app/views/public/home/index.html.erb          ← views follow the same namespace
```

### Routes

Routes are split by authentication requirement. `config/routes.rb` loads each file via `draw`:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  draw :public   # loads config/routes/public.rb
end
```

| File | Purpose |
|------|---------|
| `config/routes/public.rb` | Pages that do not require authentication |

Add new route files to `config/routes/` and load them with `draw :<name>` in `routes.rb`.

Prefer `resources` / `resource` over manual route definitions (`get`, `post`, `delete`, etc.). Always use `only:` or `except:` to limit to the actions actually needed.

```ruby
# preferred
resources :projects, only: [:index, :show]
resource :profile, only: [:show, :edit, :update]

# avoid unless no REST mapping fits
get "about", to: "public/pages#about"
```

`root` is the one exception — it must always be defined explicitly.

### View Components

UI components are built with **ViewComponent**. Do not write presentation logic directly in ERB partials.

Components are grouped by context to keep public and authenticated styles separate:

```
app/components/public/           ← components for public pages
app/components/application/      ← components for authenticated pages
```

```ruby
# app/components/public/card_component.rb
class Public::CardComponent < ViewComponent::Base
end

# app/components/application/card_component.rb
class Application::CardComponent < ViewComponent::Base
end
```

### Views & JavaScript

- Use **Turbo Frames** and **Turbo Streams** for all dynamic interactions (full Turbo, no full-page reloads).
- JavaScript logic goes in **Stimulus controllers** (`app/javascript/controllers/`), never inline in views.
- Install JS packages via importmap: `bin/importmap pin <package>`

### Package Installation

- **JavaScript** (browser delivery): use importmap — `bin/importmap pin <package>`
- **CSS build dependencies** (e.g. Tailwind plugins, Flowbite): use **bun** — `bun add <package>`

Bun is used only for the Tailwind CSS build step (not for bundling JS). This keeps the importmap approach intact while allowing Tailwind plugins like Flowbite to be available locally via `node_modules`.

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
