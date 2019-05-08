const express = require("express");
const Job = require("../models/job");
const ExpressError = require("../helpers/expressError")
const jsonschema = require("jsonschema")
const companySchema = require("../schemas/companySchema.json")
const updateCompanySchema = require("../schemas/updateCompanySchema.json")
const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
        const searchResults = await Job.getJobs(req.query);
        return res.json({ jobs: searchResults })
    } catch (err) {
        return next(err)
    }
})

router.get("/:id", async function (req, res, next) {
    try {
        const getJobById = await Job.getJob(req.params.id);
        return res.json({ job: getJobById });
    } catch (err) {
        return next(err)
    }
})

router.patch("/:id", async function (req, res, next) {
    // const result = jsonschema.validate(req.body, updateCompanySchema);

    // if(!result.valid) {
    //     let listOfErrors = result.errors.map(error => error.stack);
    //     let error = new ExpressError(listOfErrors, 400);
    //     return next(error)
    // }
    try {
        let result = await Job.patchJob(req.body, req.params.id)
        return res.json({ job: result })
    } catch (err) {
        return next(err);
    }
})

router.delete("/:id", async function (req, res, next) {
    try {
        await Job.deleteJob(req.params.id);
        return res.json({ message: "Job deleted"})
    } catch (err) {
        return next(err);
    }
})

module.exports = router;