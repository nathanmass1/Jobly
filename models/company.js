const db = require("../db");
const pUpdate = require("../helpers/partialUpdate")



const BASE_SQL = "Select handle, name from companies ";

class Company {

    static async getCompanies(obj) {

        let suffix = "WHERE ";
        let keys = Object.keys(obj);

        if (Number(obj.min_employees) > Number(obj.max_employees)) {
            throw { message: `Parameters are incorrect`, status: 400 }
        }

        let idx = 1;
        let filteredArray = [];

        if (obj.handle) {
            filteredArray.push(`lower(handle)=$${idx}`)
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

        let query = BASE_SQL

        if (filteredArray.length >= 1) {
            query = BASE_SQL + "WHERE " + filteredArray.join(' and ');
        }
        else {
            query = BASE_SQL
        }
        let values = Object.values(obj);

        const results = await db.query(
            `${query}`, values

        )
        return results.rows;
    }

    static async create(obj) {

        const result = await db.query(
            `INSERT INTO companies (handle, name, num_employees, description, logo_url)   VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees,    description, logo_url`, 
            [obj.handle, obj.name, obj.num_employees, obj.description, obj.logo_url]);

        return result.rows[0];
    }



    static async getCompany(id) {

        const result = await db.query(`
         Select handle, name, num_employees, description, logo_url 
         from companies
         where lower(handle) = $1`, 
         [id]);

         return result.rows[0];

    }


    static async updateCompany(body, handle) {
        let queryObj = pUpdate("companies", body, "handle", handle)
        const result = await db.query(
        queryObj.query, queryObj.values)

        return result.rows[0];

    }


    static async deleteCompany(handle) {
        const result = await db.query(`
            DELETE FROM companies where handle = $1 RETURNING *`, [handle]);

            if (result.rows.length === 0) {
                throw { message: `There is no company with handle '${handle}`, status: 404 }
              }
    }
    






}

module.exports = Company;