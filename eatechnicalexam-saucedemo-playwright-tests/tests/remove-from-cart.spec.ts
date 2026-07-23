import {
  expect,
  PRODUCTS,
  test,
} from '../fixtures/test-fixtures';

async function addProductsToCart(
  inventoryPage: {
    addProduct: (id: string) => Promise<void>;
  },
  productIds: string[],
): Promise<void> {
  for (const productId of productIds) {
    await inventoryPage.addProduct(productId);
  }
}

test.describe('Remove product from cart', () => {
  test.describe('Happy paths', () => {
    test('should remove a single product from cart page', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);
      await loggedInInventory.openCart();
      await cartPage.removeProduct(PRODUCTS.backpack);

      expect(await cartPage.getItemCount()).toBe(0);
    });

    test('should remove one product and keep remaining items in cart', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await addProductsToCart(loggedInInventory, [
        PRODUCTS.backpack,
        PRODUCTS.bikeLight,
      ]);
      await loggedInInventory.openCart();
      await cartPage.removeProduct(PRODUCTS.backpack);

      expect(await cartPage.getItemCount()).toBe(1);
      await expect(cartPage.removeButton(PRODUCTS.bikeLight)).toBeVisible();
    });

    test('should remove product from inventory page without opening cart', async ({
      loggedInInventory,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.boltTshirt);
      await loggedInInventory.removeProduct(PRODUCTS.boltTshirt);

      expect(await loggedInInventory.getCartBadgeCount()).toBeNull();
      await expect(
        loggedInInventory.addToCartButton(PRODUCTS.boltTshirt),
      ).toBeVisible();
    });

    test('should update cart badge after removing item from cart', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await addProductsToCart(loggedInInventory, [
        PRODUCTS.backpack,
        PRODUCTS.bikeLight,
      ]);
      await loggedInInventory.openCart();
      await cartPage.removeProduct(PRODUCTS.backpack);
      await cartPage.continueShopping();
      await loggedInInventory.expectLoaded();

      await expect(loggedInInventory.cartBadge).toHaveText('1');
    });
  });

  test.describe('Unhappy paths', () => {
    test('should not show remove buttons when cart is empty', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.openCart();
      await cartPage.expectLoaded();

      expect(await cartPage.getItemCount()).toBe(0);
      await expect(cartPage.removeButton(PRODUCTS.backpack)).toBeHidden();
    });

    test('should not show Remove button on inventory for products not in cart', async ({
      loggedInInventory,
    }) => {
      await expect(
        loggedInInventory.removeFromCartButton(PRODUCTS.backpack),
      ).toBeHidden();
      await expect(
        loggedInInventory.addToCartButton(PRODUCTS.backpack),
      ).toBeVisible();
    });

    test('should remain on cart page with no items after removing all products', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.backpack);
      await loggedInInventory.openCart();
      await cartPage.removeProduct(PRODUCTS.backpack);

      await expect(cartPage.title).toHaveText('Your Cart');
      expect(await cartPage.getItemCount()).toBe(0);
      await expect(cartPage.continueShoppingButton).toBeVisible();
    });

    test('should not display cart badge after removing the only item', async ({
      loggedInInventory,
      cartPage,
    }) => {
      await loggedInInventory.addProduct(PRODUCTS.bikeLight);
      await loggedInInventory.openCart();
      await cartPage.removeProduct(PRODUCTS.bikeLight);
      await cartPage.continueShopping();
      await loggedInInventory.expectLoaded();

      await expect(loggedInInventory.cartBadge).toBeHidden();
    });
  });
});
