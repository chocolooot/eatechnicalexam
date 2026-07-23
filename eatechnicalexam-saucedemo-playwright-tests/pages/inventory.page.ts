import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectLoaded(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  addToCartButton(productTestId: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productTestId}"]`);
  }

  removeFromCartButton(productTestId: string): Locator {
    return this.page.locator(`[data-test="remove-${productTestId}"]`);
  }

  async addProduct(productTestId: string): Promise<void> {
    await this.addToCartButton(productTestId).click();
  }

  async removeProduct(productTestId: string): Promise<void> {
    await this.removeFromCartButton(productTestId).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async getCartBadgeCount(): Promise<number | null> {
    if (!(await this.cartBadge.isVisible())) {
      return null;
    }
    return Number(await this.cartBadge.textContent());
  }
}
