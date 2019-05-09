const express = require("express");
const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobsSchema.json");
const { authenticateJWT, ensureLoggedIn, isAdmin } = require("../middleware/auth");
const router = new express.Router();

router.post("/", authenticateJWT, ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);
  
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const job = await Job.createJob(req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const searchResults = await Job.getJobs(req.query);
    return res.json({ jobs: searchResults });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const getJobById = await Job.getJob(req.params.id);
    return res.json({ job: getJobById });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", authenticateJWT, ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);
  
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let updatedJob = await Job.patchJob(req.body, req.params.id);
    return res.json({ job: updatedJob });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", authenticateJWT, ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    await Job.deleteJob(req.params.id);
    return res.json({ message: "Job deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;