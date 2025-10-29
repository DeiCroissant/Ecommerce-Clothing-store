# 📋 PHASE 4.2: WISHLIST MANAGEMENT - OPTIMIZED

**Mục tiêu:** Xây dựng hệ thống Wishlist với performance tối ưu ngay từ đầu  
**Ưu tiên:** Code quality + Performance + User Experience

---

## 🎯 FEATURES

### 1. Wishlist Page
- ✨ Grid layout responsive (2-4 columns)
- 🔍 Quick view modal cho products
- 🛒 Add to cart trực tiếp từ wishlist
- 🗑️ Remove items với confirmation
- 📱 Mobile-optimized touch interactions
- 🔄 Real-time sync (mock localStorage)

### 2. Add to Wishlist
- ❤️ Heart button ở product cards
- ⚡ Optimistic UI updates
- 🎉 Toast notifications
- 🔐 Guest wishlist (localStorage)
- 👤 User wishlist (mock API - localStorage)

### 3. Wishlist Features
- 📊 Stats: Total items, total value
- 🏷️ Price change notifications (mock)
- 📦 Stock status tracking
- 🔔 Back in stock alerts
- 📤 Share wishlist (copy link)
- 🧹 Clear all with confirmation

---

## 🏗️ ARCHITECTURE (OPTIMIZED)

```
src/features/wishlist/
├── api.js                    # API calls + localStorage
├── hooks.js                  # useWishlist, useWishlistItem
├── types.js                  # TypeScript-style JSDoc
├── utils.js                  # Optimized helpers
└── components/
    ├── WishlistGrid.js       # Virtual scroll ready
    ├── WishlistCard.js       # Memoized card
    ├── WishlistButton.js     # Heart button (reusable)
    ├── WishlistStats.js      # Summary stats
    ├── WishlistEmpty.js      # Empty state
    ├── QuickViewModal.js     # Product preview
    └── WishlistActions.js    # Bulk actions

src/app/account/wishlist/
└── page.js                   # Main page (optimized)

src/lib/
└── mockWishlistData.js       # Mock data + helpers
```

---

## 🚀 OPTIMIZATION PRINCIPLES

### 1. **No Array Cloning**
```javascript
// ✅ GOOD
let result = wishlistItems;
result = result.filter(...);

// ❌ BAD
let result = [...wishlistItems];
```

### 2. **Memoization Everywhere**
```javascript
// Component memoization
export const WishlistCard = memo(function WishlistCard({ item }) {
  const formattedPrice = useMemo(() => formatCurrency(item.price), [item.price]);
  // ...
});

// Expensive computations
const totalValue = useMemo(() => 
  items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### 3. **Optimistic Updates**
```javascript
const addToWishlist = async (product) => {
  // Update UI immediately
  setWishlist(prev => [...prev, product]);
  
  try {
    await api.addToWishlist(product);
  } catch (error) {
    // Rollback on error
    setWishlist(prev => prev.filter(p => p.id !== product.id));
  }
};
```

### 4. **Virtual Scrolling Ready**
```javascript
// Structure data for easy virtualization
const gridItems = useMemo(() => 
  wishlistItems.map(item => ({
    id: item.id,
    height: CARD_HEIGHT,
    data: item
  })),
  [wishlistItems]
);
```

### 5. **Debounced Actions**
```javascript
// Debounce search/filter
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

---

## 📊 MOCK DATA STRUCTURE

```javascript
// lib/mockWishlistData.js
export const mockWishlistItems = [
  {
    id: 'wish-001',
    productId: 'prod-123',
    product: {
      id: 'prod-123',
      name: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      images: ['/images/products/tshirt-01.jpg'],
      inStock: true,
      stockCount: 15,
      variants: { sizes: ['S', 'M', 'L'], colors: ['White', 'Black'] }
    },
    addedAt: '2024-10-15T10:30:00Z',
    priceAtAdd: 29.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  }
  // ... 15 items total
];

// Optimized helpers (no unnecessary filtering)
export function getWishlistStats(items) {
  return items.reduce((stats, item) => ({
    totalItems: stats.totalItems + 1,
    totalValue: stats.totalValue + item.product.price,
    inStockItems: stats.inStockItems + (item.product.inStock ? 1 : 0),
    priceDrops: stats.priceDrops + (item.priceChanged && item.product.price < item.priceAtAdd ? 1 : 0)
  }), { totalItems: 0, totalValue: 0, inStockItems: 0, priceDrops: 0 });
}
```

---

## 🎨 COMPONENTS BREAKDOWN

### 1. WishlistButton (Reusable Heart Button)
**Props:** `productId, size, showLabel`  
**Features:**
- ✅ Memoized component
- ✅ Optimistic updates
- ✅ Animation on toggle
- ✅ Accessible (ARIA labels)

### 2. WishlistCard (Product Card)
**Props:** `item, onRemove, onAddToCart, onQuickView`  
**Optimizations:**
- ✅ React.memo with custom comparison
- ✅ useMemo for computed values
- ✅ Lazy load images
- ✅ Price change indicator

### 3. WishlistGrid (Container)
**Props:** `items, layout`  
**Features:**
- ✅ CSS Grid responsive
- ✅ Skeleton loading
- ✅ Empty state handling
- ✅ Virtual scroll ready structure

### 4. WishlistStats (Summary)
**Optimizations:**
- ✅ useMemo for expensive calculations
- ✅ Animated counters
- ✅ Format once, not per render

---

## 🎯 IMPLEMENTATION PLAN

### Step 1: Mock Data & Utils (30 mins)
- [ ] Create mockWishlistData.js (15 items)
- [ ] Optimized helper functions
- [ ] Types/JSDoc definitions

### Step 2: Core Hooks (45 mins)
- [ ] useWishlist hook (CRUD operations)
- [ ] useWishlistItem hook (single item)
- [ ] localStorage sync
- [ ] Optimistic updates

### Step 3: UI Components (2 hours)
- [ ] WishlistButton (heart icon)
- [ ] WishlistCard (memoized)
- [ ] WishlistGrid (responsive)
- [ ] WishlistStats (calculated)
- [ ] WishlistEmpty (empty state)
- [ ] QuickViewModal (product preview)
- [ ] WishlistActions (bulk operations)

### Step 4: Main Page (1 hour)
- [ ] Wishlist page.js
- [ ] Filters (in stock, price drops)
- [ ] Sort options
- [ ] Bulk actions UI

### Step 5: Integration (30 mins)
- [ ] Add WishlistButton to ProductCard
- [ ] Add WishlistButton to Product Detail Page
- [ ] Header wishlist count
- [ ] CSS styling

### Step 6: Testing & Polish (30 mins)
- [ ] Test all CRUD operations
- [ ] Test optimistic updates
- [ ] Mobile responsiveness
- [ ] Accessibility check

**Total Time:** ~5 hours

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial render | <50ms | Memoization, no cloning |
| Add/Remove item | <10ms | Optimistic updates |
| Calculate stats | <5ms | useMemo, single pass |
| Re-render count | Minimal | React.memo, proper deps |
| Memory usage | <30KB | Reference arrays, cleanup |
| Bundle size | <15KB | Tree-shakeable exports |

---

## 🎨 CSS STRUCTURE

```css
/* wishlist.css */
.wishlist-container { /* Grid layout */ }
.wishlist-header { /* Stats + actions */ }
.wishlist-grid { /* Responsive grid */ }
.wishlist-card { /* Memoized card */ }
.wishlist-button { /* Heart button */ }
.wishlist-stats { /* Summary */ }
.wishlist-empty { /* Empty state */ }
.quick-view-modal { /* Product preview */ }

/* Animations */
@keyframes heartBeat { /* Heart animation */ }
@keyframes fadeIn { /* Card appearance */ }
```

---

## 🔄 USER FLOWS

### Flow 1: Add to Wishlist
1. User clicks heart icon on product
2. ✨ Optimistic UI update (instant)
3. 💾 Save to localStorage
4. 🎉 Show toast notification
5. ❤️ Heart icon fills with animation

### Flow 2: View Wishlist
1. User navigates to wishlist page
2. 📊 Calculate stats (memoized)
3. 🎨 Render grid (no cloning)
4. 💫 Lazy load images

### Flow 3: Add to Cart from Wishlist
1. User clicks "Add to Cart" button
2. 🛒 Add product to cart
3. ✅ Show success message
4. ❓ Ask to remove from wishlist (optional)

### Flow 4: Remove from Wishlist
1. User clicks remove button
2. ⚠️ Show confirmation (optional)
3. ✨ Optimistic removal
4. 💾 Update localStorage
5. 📊 Recalculate stats

---

## 🚀 ADVANCED FEATURES (Optional)

### Phase 4.2B (If time permits):
- [ ] **Collections:** Group wishlist items into collections
- [ ] **Price tracking:** Chart showing price history
- [ ] **Smart notifications:** Email alerts for price drops
- [ ] **Share wishlist:** Generate shareable link
- [ ] **Move to collection:** Organize items
- [ ] **Export:** Export wishlist as PDF/CSV

---

## ✅ DEFINITION OF DONE

- [ ] All 7 components created
- [ ] Main page fully functional
- [ ] Heart button integrated in ProductCard
- [ ] Heart button integrated in Product Detail
- [ ] Header shows wishlist count
- [ ] All CRUD operations working
- [ ] Optimistic updates working
- [ ] No performance issues
- [ ] Mobile responsive
- [ ] No ESLint errors
- [ ] Code follows optimization principles
- [ ] localStorage persistence working

---

**Status:** 🟢 READY TO START  
**Estimated Time:** 5 hours  
**Priority:** High  
**Dependencies:** None (Phase 4.1 complete)
