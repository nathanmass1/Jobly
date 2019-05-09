const db = require("../db");
const pUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Company {

  static async getCompanies(obj) {
    if (Number(obj.min_employees) > Number(obj.max_employees)) {
      throw { message: `Parameters are incorrect`, status: 400 };
    }

    let idx = 1;
    let filteredArray = [];

    if (obj.handle) {
      filteredArray.push(`lower(handle)=$${idx}`);
      idx++;
    }
    if (obj.min_employees) {
      filteredArray.push(`num_employees>$${idx}`);
      idx++;
    }
    if (obj.max_employees) {
      filteredArray.push(`num_employees<$${idx}`);
      idx++;
    }

    let query = "SELECT handle, name FROM companies ";

    if (filteredArray.length >= 1) {
      query += "WHERE " + filteredArray.join(' and ');
    }

    let values = Object.values(obj);

    const results = await db.query(query, values);
    return results.rows;
  }

  static async create(obj) {
    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)   
            VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [obj.handle, obj.name, obj.num_employees, obj.description, obj.logo_url]);

    return result.rows[0];
  }

  static async getCompany(id) {
    const result = await db.query(`
         SELECT c.handle, c.name, c.num_employees, c.description, c.logo_url, j.id, j.title, j.salary, j.equity, j.date_posted
         FROM companies c
          FULL OUTER JOIN jobs j ON j.company_handle = c.handle
         WHERE lower(handle) = $1`, [id]);

    if (result.rows.length === 0) {
      throw { message: `There is no company with name ${id}`, status: 404 };
    }

    let m = result.rows[0];

    return {
      handle: m.handle,
      name: m.name,
      num_employees: m.num_employees,
      description: m.description,
      logo_url: m.logo_url,
      jobs: {
        id: m.id,
        title: m.title,
        salary: m.salary,
        equity: m.equity,
        date_posted: m.date_posted
      }
    };
  }

  static async updateCompany(body, handle) {
    let queryObj = pUpdate("companies", body, "handle", handle);
    const result = await db.query(
      queryObj.query, queryObj.values);

    if (result.rows.length === 0) {
      throw { message: `There is no company with name ${handle}`, status: 404 };
    }
    return result.rows[0];
  }

  static async deleteCompany(handle) {
    const result = await db.query(`
            DELETE FROM companies where handle = $1 RETURNING *`, [handle]);

    if (result.rows.length === 0) {
      let error = new ExpressError(`There is no company with handle '${handle}`, 404);
      return error;
    }
  }
}

module.exports = Company;