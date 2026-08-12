# FIELDOPS MOBILE APP — OUTLET DETAIL & ACTIVITY SCREENS

Build the following screens as part of the **FieldOps React Native mobile application**.

## IMPORTANT: THIS IS A NATIVE MOBILE APP

This is **NOT a PWA, website, responsive web app, or desktop application**.

Build these screens using **React Native mobile UI patterns**.

Do NOT use:

* TanStack Start
* React Router
* Web URLs/routes such as `/outlet/$id`
* `head()`
* Browser navigation
* `<a>` links
* Web-only layout patterns
* Desktop navigation
* Web route-based screen architecture

Use the project's existing React Native navigation system, preferably a navigation structure based on:

* Stack navigation
* Bottom tab navigation where appropriate
* Native screen transitions
* Native back navigation
* Bottom sheets
* Modals
* Native touch interactions
* Safe areas
* Mobile headers

Every item that says "navigate to..." below means **navigate to a React Native screen**, NOT navigate to a URL.

---

# 1. PURPOSE

These screens form the **Outlet Workspace** for a Field Agent.

An agent should be able to open an outlet and perform the available field activities directly from that outlet.

The outlet workspace needs to support:

* Viewing outlet information
* Viewing outlet activity history
* Viewing sales
* Viewing orders
* Viewing surveys
* Merchandising
* Skipping an outlet
* Creating a sale
* Creating an order
* Creating a survey
* Editing an outlet

All records are:

* Campaign-scoped
* Outlet-scoped
* Associated with the currently active Field Agent

---

# 2. SCREEN INVENTORY

Make sure the following screens are actually implemented and accessible through the mobile navigation system.

### Outlet screens

1. **Outlet Detail**
2. **Outlet Activity Bottom Sheet**
3. **Skip Outlet Bottom Sheet**
4. **Edit Outlet**

### Sales screens

5. **New Sale**
6. **Customer Selection**
7. **Sale Review / Confirmation**
8. **Sale Receipt / Success**

### Order screens

9. **New Order**
10. **Customer Selection**
11. **Order Review / Confirmation**
12. **Order Success**

### Survey screens

13. **Survey Selection / Details**
14. **Dynamic Survey Form**
15. **Survey Submission / Success**

Do not omit screens simply because the real API is not available yet.

All of these screens must be accessible using mock/local data.

---

# 3. OUTLET DETAIL SCREEN

Create a native mobile screen called:

**Outlet Detail**

The screen should have a proper mobile header containing:

* Back button
* Title: `Outlet`
* Subtitle: `#<outlet id>`

There should be:

* NO edit icon in the header
* NO notification icon in the header

The back button must actually return to the previous mobile screen.

## Missing outlet

If the requested outlet does not exist in the local/mock data, show a proper mobile empty/error state:

> This outlet no longer exists.

Do not crash.

Provide a clear action to return to the previous screen or outlet list.

---

# 4. OUTLET IDENTITY CARD

At the top of the Outlet Detail screen, create a prominent outlet information card.

Display:

* Outlet name
* Area
* Open now / Closed
* Outlet status
* Distance
* Phone number
* Outlet type
* Address
* Notes

The phone number should be presented as a tappable mobile action that can initiate a phone call using the device's native capabilities.

## Outlet status

The status should be based on the visit/activity record.

Possible states:

* Visited
* Skipped

Use the application's existing design tokens/theme system.

**Do not hardcode brand colors or hex values.**

---

# 5. OUTLET METRICS

Below the identity card, create a three-column mobile metrics section.

Display:

| Metric  | Value             |
| ------- | ----------------- |
| Sales   | Number of sales   |
| Orders  | Number of orders  |
| Surveys | Number of surveys |

The values must come from the current mock/store data so that they update when an activity is completed.

Example:

```text
┌────────────┬────────────┬────────────┐
│   SALES    │   ORDERS   │  SURVEYS   │
│     4      │     2      │     7      │
└────────────┴────────────┴────────────┘
```

---

# 6. OUTLET RECORDS

Create a "Records" section.

Display the available outlet activities as mobile cards/actions.

At minimum:

* Merchandising
* Skip Outlet

### Merchandising

Only show Merchandising when the currently active campaign has the `merchandising` module enabled.

### Skip Outlet

Always show the Skip Outlet action.

The cards should be large enough to comfortably tap on a mobile device.

Use minimum touch targets of approximately **48px**.

---

# 7. OUTLET HISTORY

Display activity history for this outlet.

## Sales

Show a Sales section only when sales exist.

Each sale should display information such as:

* Product
* Quantity
* Amount
* Date/time where appropriate

Example:

```text
Coca-Cola × 3
₦4,500
```

## Orders

Show an Orders section only when orders exist.

Each order should display:

* Product
* Quantity
* Amount
* Status

Example:

```text
Coca-Cola × 10
₦15,000
Pending
```

If there are no records of a particular type, hide that section completely.

---

# 8. OUTLET ACTIVITY ACTION SHEET

Add a prominent floating `+` action button to the Outlet Detail screen.

This should be a **native mobile floating action button**, positioned above the bottom safe area.

When tapped, open a **native bottom sheet**.

Title:

**Outlet activity**

Description:

**<Outlet Name>**

The bottom sheet should contain:

* New Sale
* New Order
* New Survey
* Edit Outlet

The actions must respect the active campaign's enabled modules.

### Module rules

If the campaign has:

`sales`

show:

**New Sale**

If the campaign has:

`orders`

show:

**New Order**

If the campaign has:

`surveys`

show:

**New Survey**

**Edit Outlet** is always available.

Do not hardcode module visibility.

Read it from the active campaign configuration in the local/mock store.

---

# 9. NATIVE MOBILE NAVIGATION

When the user selects an action from the bottom sheet:

### New Sale

Open the React Native **New Sale screen** and pass the current outlet as navigation parameters.

Conceptually:

```text
Outlet Detail
     ↓
Outlet Activity
     ↓
New Sale
     ↓
outlet context = current outlet
```

### New Order

```text
Outlet Detail
     ↓
Outlet Activity
     ↓
New Order
     ↓
outlet context = current outlet
```

### New Survey

```text
Outlet Detail
     ↓
Outlet Activity
     ↓
New Survey
     ↓
outlet context = current outlet
```

### Edit Outlet

```text
Outlet Detail
     ↓
Edit Outlet
     ↓
outlet context = current outlet
```

Do not use URL query parameters to pass outlet IDs.

Use the navigation library's native route parameters.

---

# 10. SKIP OUTLET

When Skip Outlet is selected, open a native bottom sheet or modal.

Title:

**Skip Outlet**

Provide a single-select list containing:

* Outlet Closed
* No Stock Available
* Owner Not Available
* Wrong Location
* Temporary Closure
* Other

If **Other** is selected, reveal a required multiline text field.

The submit button must remain disabled until a valid reason has been selected.

If Other is selected, the note must also be provided.

---

# 11. SKIP SUBMISSION

When submitted, save the following information into the local/mock store:

* Outlet
* Skip reason
* Optional note
* Timestamp
* GPS/location information

Because the real API does not exist yet, use mocked GPS/location data.

After submission, close the sheet and update the Outlet Detail screen immediately.

Show a summary card:

```text
Skipped
Reason: Outlet Closed
```

The UI should update immediately without requiring a refresh.

---

# 12. VISITED STATE

Do NOT create a manual:

> Mark Visited

button.

An outlet should automatically become **Visited** when the agent successfully completes any activity against it.

For example:

```text
New Sale completed
       ↓
Outlet becomes Visited
```

or:

```text
Survey completed
       ↓
Outlet becomes Visited
```

or:

```text
Order completed
       ↓
Outlet becomes Visited
```

The local/mock store should demonstrate this behavior.

---

# 13. NEW SALE SCREEN

Create a native mobile screen:

**New Sale**

The current outlet is required context.

The outlet should be passed through React Native navigation parameters.

If no outlet context exists, do not render the sale form.

Instead show:

> Sales belong to an outlet.

Provide an action to return to the outlet list.

---

# 14. SALE OUTLET CARD

At the top of New Sale, show the selected outlet as a **read-only card**.

The agent should clearly see which outlet they are creating the sale for.

The outlet cannot be edited directly from this card.

---

# 15. PRODUCT PICKER

Create a mobile-friendly product selection interface using mock inventory data.

Only show products that have a valid price.

Each product should display:

* Product name
* Quantity available
* Price
* Selection indicator

Example:

```text
Coca-Cola
20 in stock · ₦1,500

○
```

Products with zero stock must:

* Remain visible where appropriate
* Be disabled
* Clearly display:

**Out of stock**

---

# 16. QUANTITY STEPPER

After selecting a product, display a native mobile quantity stepper:

```text
       −     2     +
```

Quantity must be clamped between:

```text
1 → available stock
```

Display:

> Max available: N

The user must not be able to exceed available stock.

---

# 17. CUSTOMER SELECTOR

Customer selection is required.

Create a mobile customer-selection screen.

The New Sale screen should navigate to the Customer Selection screen.

After selecting a customer:

```text
Customer Selection
        ↓
Return to New Sale
        ↓
Selected customer displayed
```

Preserve the current sale state during this navigation.

Do NOT use URL search parameters.

Use React Native navigation state/params or the shared Zustand store.

---

# 18. PROMOTIONS

Display promotion options as mobile chips/cards.

Include:

**None**

as an option.

Promotions apply percentage-based discounts.

The selected promotion should immediately update the sale totals.

---

# 19. SALE SUMMARY

Create a summary card containing:

* Subtotal
* Discount — only when greater than zero
* Total

The Total should be visually emphasized.

---

# 20. SALE VALIDATION

Show an inline destructive/error banner when:

* Product is out of stock
* Quantity exceeds available stock
* `addSale` mock operation returns an error

The submit button must be disabled unless:

* Outlet exists
* Product is selected
* Quantity is valid
* Customer is selected

---

# 21. SALE SUCCESS

When the sale is submitted successfully using mock data:

1. Decrease the product inventory in the local/mock store.
2. Mark the outlet as Visited.
3. Add the sale to the outlet's history.
4. Increment the outlet's Sales count.
5. Navigate to the Sale Receipt/Success screen.

The result should immediately be reflected when returning to the outlet.

There is **no payment method field** in this Sale flow.

---

# 22. NEW ORDER

Create a native mobile:

**New Order**

screen.

The overall UI should closely follow the New Sale screen.

It should contain:

* Outlet context
* Product picker
* Quantity stepper
* Customer selector
* Promotions
* Summary
* Confirmation

## Important differences from Sale

Orders:

* Do NOT decrement inventory.
* Can exceed current stock.
* Have an order status such as `Pending`.

After successful submission:

1. Add the order to the local/mock store.
2. Mark the outlet Visited.
3. Increment the outlet's Order count.
4. Show the Order Success screen.
5. Allow the user to return to the outlet.

---

# 23. NEW SURVEY

Create a native mobile:

**New Survey**

screen.

The survey must be dynamically generated from the active campaign's survey configuration.

Do NOT hardcode survey questions.

The mock survey configuration should demonstrate different question types:

* Text
* Number
* Single choice
* Multiple choice
* Photo
* GPS/location

The screen should behave like a real mobile survey form.

---

# 24. SURVEY VALIDATION

Required questions must be validated before submission.

If required information is missing:

* Keep the user on the form.
* Clearly identify the incomplete field(s).
* Do not submit.

If the user leaves an incomplete survey, allow it to be stored as a **local draft**.

The draft behavior should be demonstrated using the mock/local store.

---

# 25. SURVEY SUBMISSION

For this frontend phase, simulate the survey submission.

When submitted successfully:

1. Save the survey to the mock/local store.
2. Mark the outlet Visited.
3. Increment the outlet's Survey count.
4. Show a Survey Success screen.
5. Return to the outlet when the user chooses to continue.

The real offline queue and backend synchronization will be implemented later when the API documentation is available.

For now, simulate the UI/state behavior locally.

---

# 26. SHARED STATE

All outlet activities must use a shared Zustand store or equivalent centralized state.

The following must update immediately across screens:

* Outlet visited status
* Outlet skipped status
* Sales count
* Order count
* Survey count
* Sales history
* Order history
* Inventory quantities
* Lead/activity data where applicable
* Draft surveys
* Campaign/module configuration

For example:

```text
Create Sale
    ↓
Zustand Store updates
    ↓
Inventory decreases
    ↓
Sales count increases
    ↓
Outlet becomes Visited
    ↓
Outlet Detail immediately reflects changes
```

No manual page refresh should be necessary.

---

# 27. MOCK DATA IS REQUIRED

The API is NOT available yet.

Therefore, provide realistic mock data for:

* Outlets
* Customers
* Products
* Inventory
* Campaigns
* Campaign modules
* Sales
* Orders
* Surveys
* Survey configurations
* Skip records
* GPS coordinates
* Activity history

The entire flow must work using this local data.

---

# 28. API INTEGRATION MUST NOT BLOCK THE UI

Do NOT make the app dependent on the API being available.

There should be no:

```text
Loading forever because API is unavailable
```

and no:

```text
Cannot enter application because authentication API is unavailable
```

The current build must be completely demonstrable without a backend.

Structure the data layer so that mock services can later be replaced by real API services.

---

# 29. DESIGN SYSTEM

Use the existing project's design system/theme where available.

**Do not hardcode brand colors or specific hex color values in this implementation.**

Do not introduce arbitrary colors from this prompt.

Use the application's existing theme tokens, semantic colors, typography, spacing, elevation, borders, and component styles.

The existing Field Force HQ project can be referenced for its visual language, but this implementation must be adapted to a **native mobile interface**.

---

# 30. MOBILE UX REQUIREMENTS

Every screen must be designed for touch interaction.

Use:

* Minimum ~48px touch targets
* Comfortable spacing
* Native-feeling buttons
* Scrollable content
* Safe-area handling
* Keyboard-aware forms
* Native back navigation
* Mobile-friendly bottom sheets
* Mobile-friendly confirmation dialogs
* Proper loading indicators
* Clear success/error feedback

Avoid:

* Tiny web-style buttons
* Dense desktop tables
* Hover interactions
* Browser-specific UI
* Desktop sidebars
* URL-based navigation
* Web-style breadcrumbs

---

# 31. FINAL EXPECTATION

When you finish, I should be able to launch the React Native application and test this entire flow:

```text
Outlets
   ↓
Select Outlet
   ↓
Outlet Detail
   │
   ├── View Sales
   ├── View Orders
   ├── View Surveys
   ├── Merchandising
   ├── Skip Outlet
   │
   └── +
        │
        ├── New Sale
        │      ↓
        │   Customer
        │      ↓
        │   Product
        │      ↓
        │   Quantity
        │      ↓
        │   Promotion
        │      ↓
        │   Review
        │      ↓
        │   Success / Receipt
        │
        ├── New Order
        │      ↓
        │   Customer
        │      ↓
        │   Product
        │      ↓
        │   Quantity
        │      ↓
        │   Review
        │      ↓
        │   Success
        │
        ├── New Survey
        │      ↓
        │   Dynamic Questions
        │      ↓
        │   Validation
        │      ↓
        │   Submit
        │      ↓
        │   Success
        │
        └── Edit Outlet
```

All of these flows must work **without a live API** using mock/local data.

The end result must clearly look and behave like a **React Native FieldOps mobile application**, not a Lovable PWA converted into a mobile-sized website.
