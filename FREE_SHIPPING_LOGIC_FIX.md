# Fix: Conditional Free Shipping Logic in Checkout

## Problem
The checkout page was displaying the "Free Shipping" option as long as it was enabled in the admin panel, without checking if the cart's subtotal met the minimum order requirement (`min_order`) set for that shipping method.

This could lead to a user selecting free shipping for a cart that was not eligible, causing confusion and potential issues with order processing.

## Solution

A new layer of client-side logic was implemented in the `CheckoutPage` component (`vyronfashion/src/app/checkout/page.js`) to dynamically filter the available shipping methods based on the cart's subtotal.

### 1. State Management Refactor

Two separate states were introduced to manage shipping options:

- `allShippingOptions`: Stores the complete list of all shipping methods enabled in the admin panel, as fetched from the API. This list is static until the page is reloaded.
- `shippingOptions`: Stores the filtered list of methods that are valid for the *current* cart subtotal. This is the list that is rendered to the user.

```javascript
const [allShippingOptions, setAllShippingOptions] = useState([]); // All options from API
const [shippingOptions, setShippingOptions] = useState([]); // Filtered options for display
```

### 2. Dynamic Filtering with `useEffect`

A new `useEffect` hook was added. This hook is configured to re-run whenever the `subtotal` of the cart or the `allShippingOptions` list changes.

Its responsibilities are:

1.  **Filter**: It iterates through `allShippingOptions` and includes an option only if:
    - The option has no `min_order` value.
    - OR the `subtotal` is greater than or equal to the option's `min_order` value.

2.  **Update Display**: It updates the `shippingOptions` state with the newly filtered list, causing the UI to re-render with the correct options.

3.  **Handle Selection Invalidation**: It checks if the `selectedShipping` method is still present in the new, filtered list. If not (e.g., the cart total dropped below the free shipping threshold), it automatically and safely resets the selection to the first available option to prevent an invalid state.

```javascript
// Filter shipping options based on subtotal
useEffect(() => {
  const availableOptions = allShippingOptions.filter(option => 
    !option.min_order || subtotal >= option.min_order
  );

  setShippingOptions(availableOptions);

  // Check if the currently selected shipping option is still valid
  const isSelectedStillAvailable = availableOptions.find(
    option => option.id === selectedShipping?.id
  );

  // If the selected option is no longer valid, or if nothing is selected yet, select the first available option.
  if (!isSelectedStillAvailable) {
    setSelectedShipping(availableOptions.length > 0 ? availableOptions[0] : null);
  }
}, [subtotal, allShippingOptions]);
```

### User Experience Flow

- **Scenario 1: Cart total is below the threshold (e.g., 400,000₫ / 500,000₫)**
  - The "Free Shipping" option is **not displayed**.
  - The user can only choose from paid options like "Standard" or "Express".

- **Scenario 2: User adds items, cart total meets the threshold (e.g., 600,000₫ / 500,000₫)**
  - The `useEffect` triggers.
  - The "Free Shipping" option now appears in the list, and the user can select it.

- **Scenario 3: User has selected "Free Shipping" but then removes an item, dropping the total below the threshold**
  - The `useEffect` triggers again.
  - The "Free Shipping" option is removed from the visible list.
  - The `selectedShipping` state is automatically reset to the first available paid option (e.g., "Standard"), and the shipping fee is correctly re-calculated in the order summary.

## Files Changed

- `vyronfashion/src/app/checkout/page.js`: Implemented the state changes and the new `useEffect` hook.

This fix ensures that the shipping options presented to the user are always valid for their current cart, providing a more accurate and intuitive checkout experience.
