const express = require("express");
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError")
const jsonschema = require("jsonschema")
const companySchema = require("../schemas/companySchema.json")
const updateCompanySchema = require("../schemas/updateCompanySchema.json")
const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
        const searchResults = await Company.getCompanies(req.query);
        return res.json({ companies: searchResults })
    } catch (err) {
        return next(err)
    }
})

router.get("/:handle", async function (req, res, next) {
    try {
        const getCompanyByHandle = await Company.getCompany(req.params.handle.toLowerCase());
        return res.json({ company: getCompanyByHandle });
    } catch (err) {
        return next(err)
    }
})

router.post("/", async function (req, res, next) {
    const result = jsonschema.validate(req.body, companySchema);

    if(!result.valid) {
        let listOfErrors = result.errors.map(error => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(error)
    }
    try {
        const createCompany = await Company.create(req.body);
        return res.json({ company: createCompany })
    } catch (err) {
        return next(err);
    }
})

router.patch("/:handle", async function (req, res, next) {
    const result = jsonschema.validate(req.body, updateCompanySchema);

    if(!result.valid) {
        let listOfErrors = result.errors.map(error => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(error)
    }
    try {
        let result = await Company.updateCompany(req.body, req.params.handle)
        return res.json({ company: result })
    } catch (err) {
        return next(err);
    }
})

router.delete("/:handle", async function (req, res, next) {
    try {
        await Company.deleteCompany(req.params.handle);
        return res.json({ message: "Company deleted"})
    } catch (err) {
        return next(err);
    }
})


module.exports = router;