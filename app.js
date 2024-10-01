const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Jsonwebtoken = require("jsonwebtoken")
const Bcrypt = require("bcrypt")
const userModel = require("./models/users")

let app = Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://nimmyroz:roz206@cluster0.svkepzi.mongodb.net/autocon?retryWrites=true&w=majority&appName=Cluster0")


app.post("/signin",async(req,res)=>{
    let input=req.body
    let result=userModel.find({email:req.body.email}).then(
        (items)=>{
            if (items.length>0) {
                const passwordValidator=Bcrypt.compareSync(req.body.password,items[0].password)
                if (passwordValidator) {
                    Jsonwebtoken.sign({email:req.body.email},"autocon",{expiresIn:"1d"},(error,token)=>{
                        if (error) {
                            res.json({"status":"error","ErrorMessage":error})
                        } else {
                            res.json({"status":"success","token":token,"userid":items[0]._id})
                        }
                    })
                } else {
                    res.json({"status":"Incorrect Password"})
                }
            } else {
                res.json({"status":"Invalid Email Id"})
            }
        }
    ).catch()
})




app.post("/signup", async (req, res) => {

    let input = req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password, 8)
    console.log(hashedPassword)
    req.body.password = hashedPassword

    userModel.find({ email: req.body.email }).then(

        (items) => {

            if (items.length > 0) {

                res.json({ "status": "email id already exist" })

            } else {


                let result = new userModel(input)
                result.save()
                res.json({ "status": "success" })
            }

        }
    ).catch(
        (error) => {

        }
    )
})

app.listen(3030, () => {
    console.log("server started")
})