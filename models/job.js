const db = require("../db");
const pUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Job {

  static async createJob(obj) {
    const results = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4) 
        RETURNING title, salary, equity, company_handle
        `, [obj.title, obj.salary, obj.equity, obj.company_handle]);

    return results.rows[0];
  }

  static async getJobs(obj) {
    let idx = 1;
    let filteredArray = [];
    let values = Object.values(obj);
    let query = "SELECT title, company_handle FROM jobs ";

    if (obj.title) {
      filteredArray.push(`lower(title)=$${idx}`);
      idx++;
    }
    if (obj.min_salary) {
      filteredArray.push(`salary>$${idx}`);
      idx++;
    }
    if (obj.min_equity) {
      filteredArray.push(`equity>$${idx}`);
      idx++;
    }

    if (filteredArray.length >= 1) {
      query += "WHERE " + filteredArray.join(' and ');
    }

    query += "ORDER BY date_posted DESC";

    const results = await db.query(query, values);
    return results.rows;
  }

  static async getJob(id) {
    const result = await db.query(`
        SELECT j.title, j.salary, j.equity, j.company_handle, 
        c.name, c.num_employees, c.description
        FROM jobs j 
            JOIN companies c ON c.handle = j.company_handle
        WHERE j.id=$1`, [id]);

    //Destructure  
    let m = result.rows[0];

    if (!m) {
      return new ExpressError("No such job exists", 404);
    }

    return {
      title: m.title,
      salary: m.salary,
      equity: m.equity,
      company: {
        company_handle: m.company_handle,
        name: m.name,
        num_employees: m.num_employees,
        description: m.description
      }
    };
  }

  static async patchJob(body, id) {
    let queryObj = pUpdate("jobs", body, "id", id);
    const result = await db.query(
      queryObj.query, queryObj.values);

    if (result.rows.length === 0) {
      throw { message: `There is no job with id ${id}`, status: 404 };
    }
    return result.rows[0];
  }

  static async deleteJob(id) {
    const result = await db.query(`
        DELETE FROM jobs where id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      let error = new ExpressError(`There is no job with id '${id}`, 404);
      return error;
    }
  }
}

module.exports = Job;