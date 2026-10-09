# Firebase Security Specification - Emiral Global

## 1. Data Invariants
- An order must have a unique order number.
- Order items must belong to a valid order.
- Only the creator of an order (or someone with the order number) can view it (using order number as a shared secret for tracking).
- Admin can manage all collections.
- Public can read products, faqs, events, articles, and settings.
- Public can create contact messages and orders.
- Payment proof can only be uploaded for an existing order by the order owner.

## 2. The Dirty Dozen Payloads
1. Create a product as a non-admin.
2. Update a product price as a non-admin.
3. Delete an order as a non-admin.
4. Create an order with a total that doesn't match subtotal + delivery. (Note: difficult to enforce in rules without server-side validation, but we can check if total exists).
5. Update an order's status to "Delivered" as a customer.
6. Create a contact message with a 1MB subject.
7. Update someone else's order payment proof.
8. Read contact messages as a public user.
9. Inject a shadow field `isAdmin: true` into a user document (not using users collection yet, but good to keep in mind).
10. Update a terminal order (Confirmed) to "Waiting for Payment".
11. Create an event with a date in the past (rules can check `request.time`).
12. Read settings that are meant to be private (all settings are currently public in this app).

## 3. Test Runner
(I will skip the actual .test.ts file for now as I need to write the rules first, but I'll ensure they are hardened).
