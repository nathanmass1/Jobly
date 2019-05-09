const express = require("express");
const User = require("../models/user");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
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
    return res.json({ user: createUser });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    const allUsers = await User.getUsers();
    return res.json({users: allUsers});
  } catch (err) {
    return next(err);
  }
}); 

router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.getUser(req.params.username);
    return res.json({user: user});
  } catch (err) {
    return next(err);
  }
}); 

router.patch("/:username", async function (req, res, next) {
  const result = jsonschema.validate(req.body, userSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(error => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }
  try {
    const user = await User.updateUser(req.body, req.params.username);
    return res.json({user: user});
  } catch (err) {
    return next(err);
  }
}); 

router.delete("/:username", async function (req, res, next) {
  try {
    await User.delete(req.params.username);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;