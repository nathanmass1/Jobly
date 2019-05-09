process.env.NODE_ENV = "test";

const app = require("../../app");
const db = require("../../db");
const request = require("supertest");

beforeEach(async function () {
  await db.query(`
    INSERT into companies (handle, name, num_employees, description) 
    VALUES ('twitter', 'Twitter Inc.', 7500, 'The tweet thing'), 
    ('amazon', 'Amazon Inc.', 35000, 'bezos')
    `);
  await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle) 
    VALUES ('SVP', 130000, .5, 'twitter'), ('PRESIDENT', 150000, .42, 'twitter'), ('Engineer', 85000, .32, 'amazon')
    `);

  await db.query(`
    INSERT into users (username, password, first_name, last_name, email, photo_url, is_admin) 
    VALUES ('Teddy', 'password1', 'Ted', 'Bear', 'tedster@gmail.com', 'wwww.google.com', false),
    ('jon', 'password1', 'Jon', 'Snow', 'youknownothing@gmail.com', 'wwww.google.com', false)
  `);
});

afterEach(async function () {
  await db.query(`
  DELETE FROM users`);

  await db.query(`
    DELETE FROM jobs`);

  await db.query(`
    DELETE FROM companies`);
});

afterAll(function () {
  db.end();
});

describe("GET Route ", () => {
  test("Get all users", async function () {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(2);
  });
});

describe("GET Route ", () => {
  test("Get single user", async function () {
    const response = await request(app).get('/users/jon');
    expect(response.statusCode).toBe(200);

  });
});