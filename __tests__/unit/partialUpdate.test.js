const partialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let testTable = "jobs";
      let items = { "user": "Joe", "job": "janitor", "salary": 400 };
      let key = "user";
      let id = 2;
      expect(partialUpdate(testTable, items, key, id)).toEqual({ "query": "UPDATE jobs SET user=$1, job=$2, salary=$3 WHERE user=$4 RETURNING *", "values": ["Joe", "janitor", 400, 2] });
    });
});
