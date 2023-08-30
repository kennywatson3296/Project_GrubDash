const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed")
const controller = require("./orders.controller")
// TODO: Implement the /orders routes needed to make the tests pass
//handles the list, create for /orders route
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed)
//handles the update, delete, read for the /orders/:orderId route
router.route("/:orderId")
.get(controller.read)
.put(controller.update)
.delete(controller.delete)
.all(methodNotAllowed)

module.exports = router;
