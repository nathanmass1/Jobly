const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const ExpressError = require("../helpers/expressError");


function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.headers.authorization;
    const payload = jwt.verify(tokenFromBody, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("Unauthorized",401);
    return next(err);
  } else {
    return next();
  }
}


function ensureCorrectUser(req, res, next) {
  const err = new ExpressError("Unauthorized", 401);
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next(err);
    }
  } catch(err){
    return next(err);
  }
}

function isAdmin(req, res, next) {
  const err = new ExpressError("Unauthorized, not admin", 401);
  try {
    if (req.user.is_admin === true) {
      return next();
    } else {
      return next(err);
    }
  } catch(err){
    return next(err);
  }
}

module.exports = {
  authenticateJWT, ensureLoggedIn, ensureCorrectUser, isAdmin
};