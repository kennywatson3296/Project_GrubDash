const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//lists the orders on the get request
function list(req, res){
    res.json({data: orders})
}

//Middleware for checking propertys before Creating/ updating
function bodyDataHas(propertyName){
    return function (req, res, next) {
        const { data = {} } = req.body
        if (data[propertyName]) {
          return next()
        }
        next({ status: 400, message: `Order must include a ${propertyName}` })
      }
}
//middleware to verify that the dishes is an array that includes at least one dish
function dishArray(req, res, next){
    const {data: {dishes}={}} = req.body
    if(!Array.isArray(dishes) || dishes.length <= 0){
        return next({
            status: 400, message: `Order must include at least one dish`
        })
    }next()
}
//Helper function to verify that every dish quantity is valid
function dishQuantity(dish){
    return (Number(dish.quantity) > 0 && Number.isInteger(dish.quantity))
}
//Main dish middleware to verify dishes quantity
function dishQuantityApex(req, res, next){
    const {data: {dishes}={}} =req.body
    if(dishes.every(dishQuantity)){
        return next()
    }else{
        const foundDish = dishes.find((dish)=> (dish.quantity <=0 || !dish.quantity || !Number.isInteger(dish.quantity)))
        next({
            status: 400, 
            message: `Dish ${dishes.indexOf(foundDish)} must have a quantity that is an integer greater than 0`
        })
    }
    
}

//verifies that the orderId and the update body Id is the same
function orderMatcher(req, res, next){
    const order = res.locals.order
    const {data = {}} = req.body
    if(data.id){
        if(data.id != order.id){
        return next({
            status: 400, message: `Order id does not match route id. Order: ${data.id}, Route: ${order.id}`
        })}
    }next()
}

//checks if the status is a valid status
function checkStatus(req, res, next){
    const {data: {status} = {}} = req.body
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"]
    if(validStatus.includes(status)){
        return next()
    }next({
        status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    })
}

//checks that the status is pending before deletion
function checkStatusOnDelete(req, res, next){
    const order = res.locals.order
    if(order.status == "pending"){
        return next()
    }next({
        status: 400, message: "An order cannot be deleted unless it is pending."
    })
}

//creates a new Order after the middleware has verified properties
function create(req, res){
    const {data: {deliverTo, mobileNumber, status, dishes}={}} = req.body
    const newOrder = {
        id: nextId(),
        deliverTo, mobileNumber, status: "pending", dishes
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

//Middleware for checking if the Order exists in the directory
function orderExists(req, res, next){
    const {orderId} = req.params
    const foundOrder = orders.find(({id})=> id == orderId)
    if(foundOrder){
        res.locals.order = foundOrder
        return next()
    }next({
        status: 404, message: `Order id not found: ${orderId}`
    })
}

//displays a single order after orderExists has verified
function read(req, res){
    const order = res.locals.order
    res.json({data: order})
}

//updates a single order after orderExists has verified
function update(req, res){
    const order = res.locals.order
    const {data: {deliverTo, mobileNumber, status, dishes}={}} = req.body
    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes
    res.json({data: order})
}

//Deletes an order after orderExists has verified
function destroy(req, res){
    const order = res.locals.order
    const index = orders.indexOf(order)
    const deletedOrders = orders.splice(index, 1)
    res.sendStatus(204)
}

module.exports = {
    list,
    create: [bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"),bodyDataHas("dishes"), dishArray, dishQuantityApex, create],
read: [orderExists, read],
update: [orderExists, orderMatcher, bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), 
bodyDataHas("status"),bodyDataHas("dishes"), dishArray, dishQuantityApex, checkStatus, update],
delete: [orderExists, checkStatusOnDelete, destroy],
}
