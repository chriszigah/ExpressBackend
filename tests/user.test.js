let request = require('supertest')
let app = require('../app')

// Create a User
/*
describe('POST /user/register', function () {
  test('should create a new user', async () => {
    const response = await request(app).post('/user/register').send({
      name: 'testName',
      lastname: 'testLastname',
      email: 'testEmail@gmail.com',
      password: 'testPassword'
    })

    expect(response.statusCode).toBe(422)
  })
})
*/
// Login a User
describe('POST /user/login', function () {
  test('should Login a user', async () => {
    const response = await request(app).post('/user/login').send({
      email: 'testEmail@gmail.com',
      password: 'testPassword1'
    })

    expect(response.statusCode).toBe(302)
  })
})
/*
// Update a User
describe('PUT /user/upd/:id', function () {
  test('should update a user record(s)', async (done) => {
    request(app)
      .post('/user/login')
      .send({
        email: 'testEmail@gmail.com',
        password: 'testPassword'
      })
      .then((response) => {
        expect(response.statusCode).toBe(302)
        done()
      })
  })
})
*/
// Logout a User
describe('GET /logout', function () {
  test('should Logout a user', async () => {
    const response = await request(app).get('/user/logout')
    expect(response.statusCode).toBe(422)
  })
})
