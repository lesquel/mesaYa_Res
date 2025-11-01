# Controller Design and Permission Strategy

## Objective

Define the controller architecture and RBAC/resource-scoping strategy for the Mesa Ya API, ensuring security, scalability, and maintainability while preserving a clear separation of concerns.

## Key Concepts

- **Role-Based Access Control (RBAC):** Determines what actions a user can perform.
- **Resource Scoping:** Determines which data (global, own restaurant, own user resources) a user may interact with.

## Roles

| Role   | Description            | Core Capabilities                                                                                                                      |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| PUBLIC | Anonymous visitor      | Read-only access to public resources (restaurants, menus, reviews, etc.).                                                              |
| USER   | Authenticated customer | All PUBLIC actions plus management of own profile, reservations, payments, and reviews.                                                |
| OWNER  | Restaurant owner       | All USER actions plus CRUD over own restaurants and related entities, reservations, analytics, subscriptions, and associated payments. |
| ADMIN  | Platform superuser     | Global CRUD over all resources, system configuration, analytics, and user/role administration.                                         |

## Namespace Structure

| Namespace Prefix     | Purpose                                                    | Access                                                                        | Notes                                                                         |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/api/v1/public`     | Public read-only endpoints                                 | PUBLIC                                                                        | No authentication/authorization.                                              |
| `/api/v1/auth`       | Identity management (`signup`, `login`, `me`, role admin)  | PUBLIC (`signup`, `login`), USER/OWNER/ADMIN (`me`), ADMIN (admin management) | Shared entry points for authentication and admin role management.             |
| `/api/v1/user`       | User-owned resources (reservations, payments, profile)     | USER and above                                                                | Services must validate ownership via `userId`.                                |
| `/api/v1/restaurant` | Owner-owned resources (subscriptions, payments, analytics) | OWNER and ADMIN                                                               | Services must validate `ownerId` vs authenticated user.                       |
| `/api/v1/admin`      | Administrative CRUD and analytics for all entities         | OWNER (scoped) and ADMIN (global)                                             | Permissions enforced via `PermissionsGuard` and scoped in services/use-cases. |

## Permission Strategy by Feature

### Restaurants

- **Admin Controllers** (`AdminRestaurantsController`)
  - ADMIN: Full CRUD and analytics across all restaurants.
  - OWNER: CRUD and analytics restricted to own restaurants (`ownerId` checks in services/use-cases).
- **Public Controllers** (`PublicRestaurantsController`)
  - PUBLIC: Paginated list and detail endpoints.

### Sections, Tables, Objects

- **Admin Controllers** (`AdminSectionsController`, `AdminSectionObjectsController`, `AdminTablesController` if present)
  - ADMIN: Full CRUD for all entities.
  - OWNER: CRUD limited to entities linked to their restaurants.
- **Public Controllers** (`PublicSectionsController`, `PublicTablesController`, `PublicObjectsController`)
  - PUBLIC: Read-only paginated endpoints.

### Menus and Dishes

- **Admin Controllers** (`AdminMenusController`, `AdminDishesController`)
  - ADMIN: Full CRUD for all menus/dishes.
  - OWNER: CRUD limited to menus tied to own restaurants (service layer enforces `restaurantId`).
- **Public Controllers**
  - PUBLIC: Read-only endpoints with pagination (e.g., `PublicMenusController`).

### Reservations

- **Admin Controllers** (`AdminReservationsController`)
  - ADMIN: Global CRUD and analytics.
  - OWNER: CRUD/analytics limited to own restaurants.
  - USER: Where endpoints are shared, ensure reservation ownership (`reservation.userId`).
- **User Controllers** (if separated)
  - USER: CRUD over own reservations only.

### Payments

- **Admin** (`AdminPaymentController`)
  - ADMIN: Global listing, analytics, status updates, deletions.
- **Restaurant** (`RestaurantPaymentController`)
  - OWNER: Subscription payments and listings scoped to owner’s restaurants.
- **User** (`UserPaymentController`)
  - USER: Reservation payments and retrieval limited to own records.

### Reviews

- **Admin** (`AdminReviewsController`)
  - ADMIN: Global moderation and analytics.
  - OWNER/USER: CRUD limited to own restaurants or own reviews (service validates `userId`).
- **Public** (`PublicReviewsController`)
  - PUBLIC: Read-only endpoints (global or by restaurant).

### Images

- **Admin** (`AdminImagesController`)
  - ADMIN/OWNER: Creation, updates, deletions gated by permissions (`image:*`), with scoping handled in service layer.
- **Public** (`ImagesController`)
  - PUBLIC: Read-only paginated listing and detail.

### Subscription Plans and Subscriptions

- **Admin** (`AdminSubscriptionPlanController`)
  - ADMIN: CRUD over plan catalog and analytics.
- **Public** (`PublicSubscriptionPlanController`)
  - PUBLIC/OWNER: View available plans.
- **Restaurant** (`RestaurantSubscriptionController`)
  - OWNER: Manage subscriptions for own restaurants; service validates ownership.

## Guards and Decorators

- `JwtAuthGuard`: Authenticates users for protected namespaces.
- `PermissionsGuard` + `@Permissions(...)`: Enforces fine-grained permissions per endpoint (e.g., `menu:create`).
- `RolesGuard`: Normalizes role payloads (strings or objects) and ensures RBAC alignment.
- Throttling decorators (`ThrottleRead`, `ThrottleCreate`, etc.) mitigate abusive usage patterns.

## Implementation Notes

1. **Service-Level Scoping:** Ensure use-cases/services perform ownership checks (e.g., verifying `ownerId`, `userId`) before executing repository operations. Many controllers include TODO comments; prioritize implementing those validations.
2. **Analytics Filters:** When providing analytics to owners, filter queries by authenticated owner identifiers to respect scoping rules.
3. **Swagger Documentation:** Tags already reflect namespaces (e.g., `Menus - Admin`). Consider adding tag descriptions noting role access levels for clarity.
4. **Testing:** Add unit/integration tests covering OWNER/USER scenarios to ensure forbidden access to non-owned resources.

## Next Steps

- Audit service/use-case layers for any remaining TODOs related to ownership validation and implement necessary checks.
- Expand test coverage for RBAC and resource scoping, especially around shared admin endpoints used by multiple roles.
- Optionally regenerate Swagger docs once ownership validations and tag descriptions are finalized.
