const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")

const userRouter = express.Router()

userRouter.post("/register", async (req, res) => {
    try {
        req.body.role = "member"
        let user = new User(req.body)
        await user.save()
        let token = await user.generateAuthToken()
        req.session.user = user
        req.session.token = token
        res.status(200).send({user, token})
    } catch (error) {
        console.log(error)
        if (!error.errors) { return res.status(400).send({error: "An unexpected problem occurred."}) }
        res.status(400).send({error: error.errors})
    }
})

userRouter.post("/login", async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.username, req.body.password)
        if (!user) {
            throw new Error("Username or password is incorrect.")
        }
        let token = await user.generateAuthToken()
        req.session.user = user
        req.session.token = token
        res.status(200).send({user, token})
    } catch (error) {
        if (!error.errors) { return res.status(400).send({error: "An unexpected problem occurred."}) }
        res.status(400).send({error: error.errors})
    }
})

userRouter.get("/logout", (req, res) => {
    req.session.destroy()
    res.status(200).render("home")
})

userRouter.get("/get-username", (req, res) => {
    if (req.session.token) {
        res.status(200).send({username: req.session.user.username})
    } else {
        res.status(401).send("User is not authenticated.")
    }
})

module.exports = userRouter