
import app from '../src/app';
import request from 'supertest';
import { server } from '../src/server';

beforeAll(async () => {
    console.log('Jest starting!');
})

afterAll(() => {
    server.close();
})

describe('app', () => {
    describe('API routes setup completed and running', () => {
        it('should return 404', async ()=>{
            let res = await request(app).get('/unknown');
            console.log('From the app.test.ts file');
            
            expect(res.status).toBe(404);
        })
    })
})