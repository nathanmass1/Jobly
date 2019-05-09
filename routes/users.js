const express = require("express");
const User = require("../models/user");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const OPTIONS = { expiresIn: 60 * 60 }; // 1 hour
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema.json");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


const router = new express.Router();

router.post("/", async function (req, res, next) {
  const result = jsonschema.validate(req.body, userSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(error => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }
  try {
    const createUser = await User.createUser(req.body);

    let token = jwt.sign({ "username": createUser.username, "is_admin": createUser.is_admin }, JWT_SECRET, OPTIONS);
    return res.json({ token: token });
  } catch (err) {
    return next(err);
  }
});


router.post("/login", async function (req, res, next) {
  try {
    const { username, password, is_admin } = req.body;
    const userAuth = await User.authenticate(username, password);

    if (userAuth) {
      let token = jwt.sign({ username, is_admin }, JWT_SECRET, OPTIONS);
      return res.json({ token });
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err);
  }
});


router.get("/", async function (req, res, next) {
  try {
    const allUsers = await User.getUsers();
    return res.json({ users: allUsers });
  } catch (err) {
    return next(err);
  }
});


router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.getUser(req.params.username);
    return res.json({ user: user });
  } catch (err) {
    return next(err);
  }
});


router.patch("/:username", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {
  const result = jsonschema.validate(req.body, userSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(error => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }
  try {
    const user = await User.updateUser(req.body, req.params.username);
    let token = jwt.sign({ "username": user.username, "is_admin": user.is_admin }, JWT_SECRET, OPTIONS);
    return res.json({ token: token });
  } catch (err) {
    return next(err);
  }
});


router.delete("/:username", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {
  try {
    await User.delete(req.params.username);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;