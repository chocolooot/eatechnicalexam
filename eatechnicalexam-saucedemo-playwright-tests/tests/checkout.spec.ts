import {
  expect,
  PRODUCTS,
  test,
  VALID_CHECKOUT_INFO,
} from '../fixtures/test-fixtures';

async function goToCheckoutStepOne(
  inventoryPage: {
    addProduct: (id: string) => Promise<void>;
    openCart: () => Promise<void>;
  },
  cartPage: {
    proceedToCheckout: () => Promise<void>;
  },
  productIds: string[] = [PRODUCTS.backpack],
): Promise<void> {
  for (const productId of productIds) {
    await inventoryPage.addProduct(productId);
  }
  await inventoryPage.openCart();
  await cartPage.proceedToCheckout();
}

test.describe('Checkout products', () => {
  test.describe('Happy paths', () => {
    test('should complete checkout with valid customer information', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.completeCheckout(VALID_CHECKOUT_INFO);

      await expect(checkoutPage.completeHeader).toHaveText(
        'Thank you for your order!',
      );
    });

    test('should checkout a single product and show order summary', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.fillCustomerInfo(VALID_CHECKOUT_INFO);
      await checkoutPage.submitCustomerInfo();

      await expect(page.locator('.title')).toHaveText('Checkout: Overview');
      expect(await checkoutPage.summaryItems.count()).toBe(1);
      await checkoutPage.finishOrder();

      await expect(checkoutPage.completeHeader).toBeVisible();
    });

    test('should checkout multiple products successfully', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage, [
        PRODUCTS.backpack,
        PRODUCTS.bikeLight,
        PRODUCTS.boltTshirt,
      ]);
      await checkoutPage.fillCustomerInfo(VALID_CHECKOUT_INFO);
      await checkoutPage.submitCustomerInfo();

      await expect(page.locator('.title')).toHaveText('Checkout: Overview');
      expect(await checkoutPage.summaryItems.count()).toBe(3);
      await checkoutPage.finishOrder();

      await expect(page.locator('.complete-text')).toContainText(
        'Your order has been dispatched',
      );
    });

    test('should return to cart with items when checkout is cancelled', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.cancelButton.click();

      await expect(page.locator('.title')).toHaveText('Your Cart');
      expect(await cartPage.getItemCount()).toBe(1);
    });
  });

  test.describe('Unhappy paths', () => {
    test('should show error when first name is missing', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.fillCustomerInfo({
        firstName: '',
        lastName: VALID_CHECKOUT_INFO.lastName,
        postalCode: VALID_CHECKOUT_INFO.postalCode,
      });
      await checkoutPage.submitCustomerInfo();

      await expect(checkoutPage.errorMessage).toHaveText(
        'Error: First Name is required',
      );
    });

    test('should show error when last name is missing', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.fillCustomerInfo({
        firstName: VALID_CHECKOUT_INFO.firstName,
        lastName: '',
        postalCode: VALID_CHECKOUT_INFO.postalCode,
      });
      await checkoutPage.submitCustomerInfo();

      await expect(checkoutPage.errorMessage).toHaveText(
        'Error: Last Name is required',
      );
    });

    test('should show error when postal code is missing', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
    }) => {
      await goToCheckoutStepOne(loggedInInventory, cartPage);
      await checkoutPage.fillCustomerInfo({
        firstName: VALID_CHECKOUT_INFO.firstName,
        lastName: VALID_CHECKOUT_INFO.lastName,
        postalCode: '',
      });
      await checkoutPage.submitCustomerInfo();

      await expect(checkoutPage.errorMessage).toHaveText(
        'Error: Postal Code is required',
      );
    });

    test('should proceed to checkout form with empty cart and no line items', async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
      page,
    }) => {
      await loggedInInventory.openCart();
      await cartPage.proceedToCheckout();

      await expect(page.locator('.title')).toHaveText(
        'Checkout: Your Information',
      );
      expect(await checkoutPage.cartItems.count()).toBe(0);

      await checkoutPage.fillCustomerInfo(VALID_CHECKOUT_INFO);
      await checkoutPage.submitCustomerInfo();
      expect(await checkoutPage.summaryItems.count()).toBe(0);
    });
  });
});
