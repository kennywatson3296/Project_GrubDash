const path = require("path");

// Use the existing dishes data
const dishes = require("../data/dishes-data");

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//Lists all the dishes
function list(req, res){
    res.json({data: dishes})
}

//Middleware for checking property values
function bodyDataHas(propertyName){
    return function (req, res, next) {
        const { data = {} } = req.body
        if (data[propertyName]) {
          return next()
        }
        next({ status: 400, message: `Dish must include a ${propertyName}` })
      }
}
//checks that price is a valid integer more than 0
function priceCheck(req, res, next){
    const {data: {price} = {}} = req.body
    if(Number(price) > 0 && Number.isInteger(price)){
        return next()
    }next({status: 400, message: "Dish must have a price that is an integer greater than 0"})
}


//The create function to create a new dish after the bodyDataHas middleware has ran
function create(req, res){
const {data: {name, description, price, image_url} = {}} = req.body
const newDish = {
    id: nextId(),
    name, description, price, image_url
}
dishes.push(newDish)
res.status(201).json({data: newDish})
}

//Middleware to check if the dish exists in the directory
function dishExists(req, res, next){
    const {dishId} = req.params
    const foundDish = dishes.find((dish)=> dish.id == dishId)
    if(foundDish){
        res.locals.dish = foundDish
        return next()
    }next({
        status: 404, message: `Dish does not exist: ${dishId}`
    })
}

//verifies that the dishId and update data.id is the same
function dishMatcher(req, res, next){
    const dish = res.locals.dish
    const {data = {}} = req.body
    if(data.id){
        if(data.id != dish.id){
        return next({
            status: 400, message: `Dish id does not match route id. Dish: ${data.id}, Route: ${dish.id}`
        })}
    }next()
}



//Displays a single dish after the middleware has verified 
function read(req, res){
    const dish = res.locals.dish
    res.json({data: dish})
}

//updates a single dish after the middleware has verified
function update(req, res, next){
    const dish = res.locals.dish
    const {data: { name, description, price, image_url} = {}} = req.body
    dish.name = name
    dish.description = description
    dish.price = price
    dish.image_url = image_url
    res.json({data: dish})
}

module.exports = {
    list, 
    create: [bodyDataHas("name"), bodyDataHas("description"), bodyDataHas("price"),
bodyDataHas("image_url"), priceCheck, create],
read: [dishExists, read],
update: [dishExists, dishMatcher, bodyDataHas("name"), bodyDataHas("description"),bodyDataHas("price"),
bodyDataHas("image_url"), priceCheck, update],
}