const db = require("../db");
const pUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Company {
  
  static async getCompanies(obj) {
    if (+obj.min_employees > +obj.max_employees) {
      throw { message: `Parameters are incorrect`, status: 400 };
    }
    
    const params = Object.values(obj);
    let query = "SELECT handle, name FROM companies ";
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
    if (filteredArray.length) {
      query += "WHERE " + filteredArray.join(' AND ');
    }

    const results = await db.query(query, params);
    return results.rows;
  }

  static async create(obj) {
    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)   
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING handle, name, num_employees, description, logo_url`,
      [obj.handle, obj.name, obj.num_employees, obj.description, obj.logo_url]);

    return result.rows[0];
  }

  static async getCompany(id) {
    const result = await db.query(`
         SELECT c.handle, c.name, c.num_employees, c.description, c.logo_url, j.id as jobId, j.title, j.salary, j.equity, j.date_posted
         FROM companies c
          FULL OUTER JOIN jobs j ON j.company_handle = c.handle
         WHERE lower(handle) = $1`, [id]);

    if (!result.rows.length) {
      throw { message: `There is no company with name ${id}`, status: 404 };
    }

    let { 
      handle, 
      name, 
      num_employees, 
      description, 
      logo_url, 
      jobId, 
      title, 
      salary, 
      equity, 
      date_posted } = result.rows[0];

    return {
      handle,
      name,
      num_employees,
      description,
      logo_url,
      jobs: {
        id: jobId,
        title,
        salary,
        equity,
        date_posted
      }
    };
  }

  static async updateCompany(body, handle) {
    const queryObj = pUpdate("companies", body, "handle", handle);
    const result = await db.query(queryObj.query, queryObj.values);

    if (!result.rows.length) {
      throw { message: `There is no company with name ${handle}`, status: 404 };
    }
    return result.rows[0];
  }

  static async deleteCompany(handle) {
    const result = await db.query(`DELETE FROM companies where handle = $1 RETURNING handle `, [handle]);

    if (!result.rows.length) {
      const error = new ExpressError(`There is no company with handle '${handle}`, 404);
      return error;
    }
  }
}

module.exports = Company;