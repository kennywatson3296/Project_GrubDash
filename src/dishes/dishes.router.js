const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed")
const controller = require("./dishes.controller")
// TODO: Implement the /dishes routes needed to make the tests pass
//Creates dishes and lists dishes from the /dishes route
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed)
//Display a dish and update a dish from the /dishes/:dishId route
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed)

module.exports = router;
