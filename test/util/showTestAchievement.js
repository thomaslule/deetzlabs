const request = require('supertest');

module.exports = app => request(app).post('/api/show_test_achievement');
