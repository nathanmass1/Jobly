process.env.NODE_ENV = "test";

const companies = require("../../routes/companies");
const jobs = require("../../models/job");
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

  let job = jobs.createJob(
    { "title": "Job Model", 
      "salary": "130000", 
      "equity": 0.6,
      "company_handle": "twitter"});
});

afterEach(async function () {
  
  await db.query(`
    DELETE FROM jobs`);

  await db.query(`
    DELETE FROM companies`);
});

afterAll(function () {
  db.end();
});


describe("GET Route ", () => {
  test("Get all jobs", async function () {
    const response = await request(app).get('/jobs');
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(4);
  });

  test("Get all jobs with query strings", async function () {
    const response = await request(app).get('/jobs?title=svp');
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
  });
});

describe("GET Route ", () => {
  test("Get single job", async function () {
    const response = await request(app).get('/jobs/3');
    expect(response.statusCode).toBe(200);
    // console.log("DOES THIS WORKKKK?", job)
    // console.log("JOB BODY ************", response.body.job)
    // expect(response.body.job.handle).toEqual("twitter");


  // test("Get invalid single company", async function () {
  //   const response = await request(app).get('/jobs/20000');
  //   console.log(response.body)
  //   expect(response.body.job.status).toBe(404);
  //   expect(response.body.job.message).toBe("No such job exists");
  });
});

describe("POST Route ", () => {
  test("Create new job", async function () {
    const response = await request(app).post('/jobs').send({
      "title": "Trial VP", 
      "salary": "20000", 
      "equity": 0.1,
      "company_handle": "amazon"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.job.company_handle).toEqual("amazon");
  });

  test("Create new job with invalid parameters", async function () {
    const response = await request(app).post('/jobs').send({
      "title": "Trial Engineer", 
      "salary": "20000", 
      "equity": 10,
      "company_handle": "amazon"
    });
    expect(response.statusCode).toBe(400);
  });
});

