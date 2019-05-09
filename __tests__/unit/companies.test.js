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
});

afterEach(async function () {
  await db.query(`DELETE FROM jobs `);
  await db.query(`DELETE FROM companies `);
});

afterAll(function () {
  db.end();
});


describe("GET Route ", () => {
  test("Get all companies", async function () {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

  test("Get all companies with query strings", async function () {
    const response = await request(app).get('/companies?handle=twitter');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
  });
});

describe("GET Route ", () => {
  test("Get single companies", async function () {
    const response = await request(app).get('/companies/twitter');
    expect(response.statusCode).toBe(200);
    expect(response.body.company.handle).toEqual("twitter");
  });

  test("Get invalid single company", async function () {
    const response = await request(app).get('/companies/oracle');
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe(404);
    expect(response.body.message).toBe("There is no company with name oracle");
  });
});

describe("POST Route ", () => {
  test("Create new company", async function () {
    const response = await request(app).post('/companies').send({
      "handle": "microsoft",
      "name": "MSFT Inc",
      "num_employees": 40000
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.company.handle).toEqual("microsoft");
  });
});
