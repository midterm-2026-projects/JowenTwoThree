import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Ob1: POS End-to-End Transaction Workflow', () => {

  test.describe('1. Authentication', () => {
    test('should show login page on initial load', async ({ page }) => {
      await page.goto(BASE_URL)
      await expect(page.getByTestId('login-button')).toBeVisible()
      await expect(page.getByTestId('username-input')).toBeVisible()
      await expect(page.getByTestId('email-input')).toBeVisible()
      await expect(page.getByTestId('password-input')).toBeVisible()
    })

    test('should login with valid credentials and show POS dashboard', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()

      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
      await expect(page.getByText('Welcome admin')).toBeVisible()
      await expect(page.getByTestId('sidebar')).toBeVisible()
      await expect(page.getByTestId('product-page')).toBeVisible()
      await expect(page.getByTestId('order-summary')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('wrong')
      await page.getByTestId('email-input').fill('wrong@test.com')
      await page.getByTestId('password-input').fill('wrongpass')
      await page.getByTestId('login-button').click()

      await expect(page.getByTestId('error-message')).toContainText(
        'Invalid username, email, or password'
      )
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).not.toBeVisible()
    })

    test('should show validation error for empty username', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('login-button').click()

      await expect(page.getByTestId('error-message')).toContainText(
        'Username is required'
      )
    })
  })

  test.describe('2. Product Browsing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
    })

    test('should display products from mock data', async ({ page }) => {
      await expect(page.getByTestId('products-grid')).toBeVisible()
      await expect(page.getByTestId('product-1')).toBeVisible()
      await expect(page.getByTestId('product-name-1')).toHaveText('Burger')
      await expect(page.getByTestId('product-price-1')).toContainText('120')
    })

    test('should filter products by category', async ({ page }) => {
      await expect(page.getByTestId('category-filter-Food')).toBeVisible()

      await page.getByTestId('category-filter-Food').click()
      await expect(page.getByTestId('product-1')).toBeVisible()
      await expect(page.getByTestId('product-2')).toBeVisible()
      await expect(page.getByTestId('product-3')).not.toBeVisible()

      await page.getByTestId('category-filter-All').click()
      await expect(page.getByTestId('product-3')).toBeVisible()
    })

    test('should show customer recording button', async ({ page }) => {
      await expect(page.getByTestId('customer-recording-button')).toBeVisible()
      await expect(page.getByTestId('customer-recording-button')).toHaveText('Customers: 1')
    })
  })

  test.describe('3. Add to Cart', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
      await expect(page.getByTestId('add-to-cart-1')).toBeVisible()
    })

    test('should add a product to cart', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      await expect(page.getByTestId('cart-item-1')).toBeVisible()
      await expect(page.getByTestId('qty-1')).toHaveText('1')
      await expect(page.getByTestId('subtotal-1')).toContainText('120')
    })

    test('should add multiple different products', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()
      await page.getByTestId('add-to-cart-3').click()

      await expect(page.getByTestId('cart-item-1')).toBeVisible()
      await expect(page.getByTestId('cart-item-3')).toBeVisible()
      await expect(page.getByTestId('total-items')).toHaveText('2')
    })

    test('should increment quantity when adding same product twice', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()
      await page.getByTestId('add-to-cart-1').click()

      await expect(page.getByTestId('qty-1')).toHaveText('2')
      await expect(page.getByTestId('subtotal-1')).toContainText('240')
    })
  })

  test.describe('4. Discount & Calculation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
      await expect(page.getByTestId('add-to-cart-1')).toBeVisible()
    })

    test('should update subtotal when items are added', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()
      await expect(page.getByTestId('subtotal-amount')).toHaveText('₱120.00')
      await expect(page.getByTestId('total-amount')).toHaveText('₱120.00')

      await page.getByTestId('add-to-cart-2').click()
      await expect(page.getByTestId('subtotal-amount')).toHaveText('₱180.00')
      await expect(page.getByTestId('total-amount')).toHaveText('₱180.00')
    })

    test('should apply percentage discount and update total', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      await page.getByTestId('discount-type-select').selectOption('percentage')
      await page.getByTestId('discount-value-input').fill('10')

      await expect(page.getByTestId('subtotal-amount')).toHaveText('₱120.00')
      await expect(page.getByTestId('discount-amount')).toHaveText('-₱12.00')
      await expect(page.getByTestId('total-amount')).toHaveText('₱108.00')
    })

    test('should apply fixed discount and update total', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      await page.getByTestId('discount-type-select').selectOption('fixed')
      await page.getByTestId('discount-value-input').fill('20')

      await expect(page.getByTestId('subtotal-amount')).toHaveText('₱120.00')
      await expect(page.getByTestId('discount-amount')).toHaveText('-₱20.00')
      await expect(page.getByTestId('total-amount')).toHaveText('₱100.00')
    })

    test('should reset discount when set back to none', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      await page.getByTestId('discount-type-select').selectOption('percentage')
      await page.getByTestId('discount-value-input').fill('10')
      await expect(page.getByTestId('discount-amount')).toHaveText('-₱12.00')

      await page.getByTestId('discount-type-select').selectOption('none')
      await expect(page.getByTestId('discount-amount')).not.toBeVisible()
      await expect(page.getByTestId('total-amount')).toHaveText('₱120.00')
    })
  })

  test.describe('5. Checkout & Transaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
      await expect(page.getByTestId('add-to-cart-1')).toBeVisible()
    })

    test('should disable checkout button when cart is empty', async ({ page }) => {
      await expect(page.getByTestId('checkout-btn')).toBeDisabled()
    })

    test('should enable checkout button after adding item', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()
      await expect(page.getByTestId('checkout-btn')).toBeEnabled()
    })

    test('should save transaction to backend on checkout', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const response = await responsePromise

      expect(response.status()).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.transaction.transaction_number).toMatch(/^TXN-/)
    })

    test('should send correct cart data in transaction payload', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()
      await page.getByTestId('add-to-cart-2').click()

      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const response = await responsePromise

      const body = await response.json()
      expect(body.transaction.cart).toHaveLength(2)
      expect(body.transaction.subtotal).toBe(180)
      expect(body.transaction.total).toBe(180)
    })

    test('should retrieve receipt after successful transaction', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      const postResponsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const postResponse = await postResponsePromise
      const postBody = await postResponse.json()
      const txnNumber = postBody.transaction.transaction_number

      const receiptResponse = await page.request.get(
        `http://localhost:5000/api/transactions/${txnNumber}/receipt`
      )
      expect(receiptResponse.status()).toBe(200)
      const receiptBody = await receiptResponse.json()
      expect(receiptBody.success).toBe(true)
      expect(receiptBody.receipt.receiptId).toBe(txnNumber)
      expect(receiptBody.receipt.items).toHaveLength(1)
      expect(receiptBody.receipt.totalAmount).toBe(120)
    })

    test('should appear in transaction history after checkout', async ({ page }) => {
      await page.getByTestId('add-to-cart-1').click()

      const postResponsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      await postResponsePromise

      const historyResponse = await page.request.get(
        'http://localhost:5000/api/transactions/history'
      )
      expect(historyResponse.status()).toBe(200)
      const historyBody = await historyResponse.json()
      expect(historyBody.success).toBe(true)
      expect(historyBody.history.length).toBeGreaterThan(0)
    })
  })

  test.describe('6. Navigation & Sidebar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL)
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()
    })

    test('should navigate to Inventory module', async ({ page }) => {
      await page.getByTestId('menu-inventory').click()
      await expect(page.getByTestId('inventory-page')).toBeVisible()
      await expect(page.getByTestId('product-page')).not.toBeVisible()
    })

    test('should navigate back to POS from Inventory', async ({ page }) => {
      await page.getByTestId('menu-inventory').click()
      await expect(page.getByTestId('inventory-page')).toBeVisible()

      await page.getByTestId('menu-pos').click()
      await expect(page.getByTestId('product-page')).toBeVisible()
    })

    test('should display logged-in user info in sidebar', async ({ page }) => {
      await expect(page.getByTestId('user-info')).toHaveText('admin')
    })

    test('should logout and return to login page', async ({ page }) => {
      await page.getByTestId('logout-button').click()
      await expect(page.getByTestId('login-button')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).not.toBeVisible()
    })
  })

  test.describe('7. Full Workflow Integration', () => {
    test('should complete full flow: login → browse → add to cart → checkout → transaction saved', async ({ page }) => {
      await page.goto(BASE_URL)

      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()

      await expect(page.getByTestId('add-to-cart-1')).toBeVisible()
      await page.getByTestId('add-to-cart-1').click()
      await page.getByTestId('add-to-cart-2').click()

      await expect(page.getByTestId('cart-item-1')).toBeVisible()
      await expect(page.getByTestId('cart-item-2')).toBeVisible()
      await expect(page.getByTestId('total-items')).toHaveText('2')
      await expect(page.getByTestId('subtotal-amount')).toHaveText('₱180.00')

      const postResponsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const postResponse = await postResponsePromise
      expect(postResponse.status()).toBe(201)

      const postBody = await postResponse.json()
      expect(postBody.success).toBe(true)
      expect(postBody.transaction.cart).toHaveLength(2)
      expect(postBody.transaction.total).toBe(180)

      const receiptResponse = await page.request.get(
        `http://localhost:5000/api/transactions/${postBody.transaction.transaction_number}/receipt`
      )
      expect(receiptResponse.status()).toBe(200)
      const receiptBody = await receiptResponse.json()
      expect(receiptBody.receipt.totalAmount).toBe(180)
      expect(receiptBody.receipt.items).toHaveLength(2)
    })

    test('should allow multiple sequential transactions', async ({ page }) => {
      await page.goto(BASE_URL)

      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('email-input').fill('admin@jowen.com')
      await page.getByTestId('password-input').fill('admin123')
      await page.getByTestId('login-button').click()
      await expect(page.getByRole('heading', { name: 'Point-of-Sale' })).toBeVisible()

      await page.getByTestId('add-to-cart-1').click()

      const post1Promise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const post1 = await post1Promise
      expect(post1.status()).toBe(201)

      await page.getByTestId('add-to-cart-3').click()
      await expect(page.getByTestId('cart-item-3')).toBeVisible()

      const post2Promise = page.waitForResponse(
        (resp) => resp.url().includes('/api/transactions') && resp.request().method() === 'POST'
      )
      await page.getByTestId('checkout-btn').click()
      const post2 = await post2Promise
      expect(post2.status()).toBe(201)

      const historyResponse = await page.request.get(
        'http://localhost:5000/api/transactions/history'
      )
      const historyBody = await historyResponse.json()
      expect(historyBody.history.length).toBeGreaterThanOrEqual(2)
    })
  })
})
