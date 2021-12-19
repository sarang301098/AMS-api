import request from 'supertest';

import app from '../app';

describe('Express app test', () => {
  test('GET /health should return 200', (done) => {
    request(app).get('/health').expect(200, done);
  });

  test('GET /random-url should return 404', async () => {
    const response = await request(app).get('/random-url');
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('API_ENDPOINT_NOT_FOUND');
  });
});
