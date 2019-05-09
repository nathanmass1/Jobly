const db = require("../db");
const pUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_ROUNDS } = require('../config');

class User {

  static async createUser(obj) {
    try {
      const { username, password, first_name, last_name, email, photo_url, is_admin } = obj;
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);

      const results = await db.query(`
          INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING username, first_name, last_name, email, is_admin
          `, [username, hashedPassword, first_name, last_name, email, photo_url, is_admin]);

      return results.rows[0];
    } catch (err) {
      return new ExpressError("Cannot create user", 404);
    }
  }

  static async getUsers() {
    const results = await db.query(`
      SELECT username, first_name, last_name, email FROM users
    `);

    return results.rows;
  }

  static async getUser(username) {
    const results = await db.query(`
      SELECT username, first_name, last_name, email, photo_url, is_admin FROM users WHERE username=$1
    `, [username]);

    return results.rows[0];
  }

  static async updateUser(newInfo, username) {

    const hashedPassword = await bcrypt.hash(newInfo.password, BCRYPT_WORK_ROUNDS);

    newInfo.password = hashedPassword;

    let queryObj = pUpdate("users", newInfo, "username", username);
    const results = await db.query(
      queryObj.query, queryObj.values
    );

    let returnObj = results.rows[0];
    delete returnObj.password;

    return returnObj;
  }

  static async delete(username) {

    const results = await db.query(`
    DELETE FROM users where username = $1 RETURNING username
    `, [username]);

    if (results.rows.length === 0) {
      let error = new ExpressError(`There is no user with id '${username}`, 404);
      return error;
    }
  }
}

module.exports = User;