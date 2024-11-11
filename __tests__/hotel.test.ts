import request from 'supertest';
import app from '../src';

describe('Hotel API', () => {
  it('should add a new hotel', async () => {
    const res = await request(app)
      .post('/hotels')
      .send({ title: 'City Lights Inn', description: 'A stylish city inn.' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should retrieve a hotel by ID', async () => {
    const res = await request(app).get('/hotels/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title');
  });

  it('should update a hotel', async () => {
    const res = await request(app)
      .put('/hotels/1')
      .send({ title: 'Updated City Lights Inn' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated City Lights Inn');
  });
});
