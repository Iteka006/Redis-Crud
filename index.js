const express = require("express"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    redis = require("redis")


const app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(methodOverride("_method"))

const redisClient = redis.createClient()
redisClient.on("connect", () => {
    console.log("Connected to redis...")
})
redisClient.on("error", (error) => {
    console.error("Some error occurred in redis: " + error)
})

app.get('/users/search', (req, res) => {
    const search = req.body.search

    redisClient.getall(search, function (error, object) {
        res.json(object)
    })
})

app.post('/users', (req, res) => {
    const { id, name, email, phone } = req.body

    redisClient.set(id, [
        "name", name,
        "email", email,
        "phone", phone
    ], (err, result) => {
        if (err) {
            console.log("Some error occured", err)
        }

        res.send("User created.")
    })
})

app.delete('/users/:id', (req, res) => {
    const id = req.params.id

    redisClient.del(id, () => {
        res.send("User deleted.")
    })
})

const port = 3003
app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})