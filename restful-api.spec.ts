import { test, expect } from '@playwright/test';

test.describe('RESTful API CRUD Suite', () => {
  test('CRUD lifecycle', async ({ request }) => {
    const create = await request.post('https://api.restful-api.dev/objects', {
      data: { name: 'Playwright Laptop', data: { year: 2026, price: 2500 } }
    });
    expect(create.ok()).toBeTruthy();
    const created = await create.json();
    const id = created.id;

    const read = await request.get(`https://api.restful-api.dev/objects/${id}`);
    expect(read.ok()).toBeTruthy();

    const update = await request.put(`https://api.restful-api.dev/objects/${id}`, {
      data: { name: 'Updated Laptop', data: { year: 2027, price: 3000 } }
    });
    expect(update.ok()).toBeTruthy();

    const del = await request.delete(`https://api.restful-api.dev/objects/${id}`);
    expect(del.ok()).toBeTruthy();
  });

  test('Negative - invalid ID', async ({ request }) => {
    const res = await request.get('https://api.restful-api.dev/objects/invalid-id-123');
    expect(res.status()).toBe(404);
  });

  test('Negative - missing required field', async ({ request }) => {
    const res = await request.post('https://api.restful-api.dev/objects', {
      data: { data: { price: 100 } }
    });
    expect(res.status()).toBe(400);
  });

  test('Negative - bad auth (if enforced)', async ({ request }) => {
    const res = await request.post('https://api.restful-api.dev/objects', {
      headers: { Authorization: 'Bearer invalid-token' },
      data: { name: 'Laptop' }
    });
    expect([200,201,401,403]).toContain(res.status());
  });
});
