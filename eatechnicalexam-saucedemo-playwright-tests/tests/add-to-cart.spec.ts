import {
  expect,
  PRODUCTS,
  test,
} from '../fixtures/test-fixtures';

test.describe('Add product to cart', () => {
  test.describe('Happy paths', () => {
    test('should add a single product and update cart badge', async ({
      loggedInInventory,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);

      await expect(loggedInInventory.cartBadge).toHaveText('1');
      await expect(
        loggedInInventory.removeFromCartButton(PRODUCTS.backpack),
      ).toBeVisible();
    });

    test('should add multiple different products to cart', async ({
      loggedInInventory,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);
      await loggedInInventory.addProduct(PRODUCTS.bikeLight);
      await loggedInInventory.addProduct(PRODUCTS.boltTshirt);

      await expect(loggedInInventory.cartBadge).toHaveText('3');
    });

    test('should persist added product when navigating to cart page', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);
      await loggedInInventory.openCart();
      await cartPage.expectLoaded();

      await expect(cartPage.title).toHaveText('Your Cart');
      expect(await cartPage.getItemCount()).toBe(1);
      await expect(cartPage.removeButton(PRODUCTS.backpack)).toBeVisible();
    });

    test('should show Remove button on inventory after adding product', async ({
      loggedInInventory,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.bikeLight);

      await expect(
        loggedInInventory.addToCartButton(PRODUCTS.bikeLight),
      ).toBeHidden();
      await expect(
        loggedInInventory.removeFromCartButton(PRODUCTS.bikeLight),
      ).toBeVisible();
    });
  });

  test.describe('Unhappy paths', () => {
    test('should not display cart badge when cart is empty', async ({
      loggedInInventory,
    }) => {
      expect(await loggedInInventory.getCartBadgeCount()).toBeNull();
      await expect(loggedInInventory.cartBadge).toBeHidden();
    });

    test('should show empty cart when opened without adding products', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.openCart();
      await cartPage.expectLoaded();

      expect(await cartPage.getItemCount()).toBe(0);
      await expect(cartPage.checkoutButton).toBeVisible();
    });

    test('should not allow adding the same product twice from inventory', async ({
      loggedInInventory,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);

      await expect(
        loggedInInventory.addToCartButton(PRODUCTS.backpack),
      ).toBeHidden();
      await expect(loggedInInventory.cartBadge).toHaveText('1');
    });

    test('should redirect to login when accessing site without authentication', async ({
      page,
      loginPage,
    }) => {
      await page.goto('/cart.html');

      await expect(loginPage.loginButton).toBeVisible();
      await expect(page).toHaveURL(/\/$/);
    });
  });
});
