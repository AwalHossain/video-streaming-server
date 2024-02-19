
import app from '../src/app';
import request from 'supertest';
import { server } from '../src/server';
import {beforeAll, afterAll, describe, it,expect} from '@jest/globals';

beforeAll(async () => {
    console.log('Jest starting!');
})

afterAll(() => {
    server.close();
})

describe('Vide', () => {
    describe('Get all videos api testing', () => {
        it('should return 200', async ()=>{
            let res = await request(app).get('/api/v1/videos');
            console.log('From the app.test.ts file');
            
            expect(res.status).toBe(200);
            // expect(res.body).toEqual({success: true, message: 'All videos fetched successfully', data: [],meta:{}});
        })
    })
})