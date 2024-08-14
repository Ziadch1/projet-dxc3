const request = require('supertest');
const express = require('express');

// Mock mysql2 before requiring the app
jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: jest.fn((callback) => callback()),
    query: jest.fn(),
  })),
}));

const app = require('../server'); // Adjust the path if necessary

describe('Server API - Health Check', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
