/**
 * API Route Tests - Authentication
 * Tests for authentication endpoints
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

// Mock Firebase Admin SDK
jest.mock('../../config/firebase', () => ({
  admin: {
    auth: jest.fn()
  }
}));

// Mock database
jest.mock('../../config/database', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

describe('Authentication Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/login', () => {
    test('should return instructions for Firebase login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Firebase client SDK');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/auth/language', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/auth/language')
        .send({ language: 'es' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

