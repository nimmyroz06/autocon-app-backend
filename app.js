const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Jsonwebtoken = require("jsonwebtoken")
const Bcrypt = require("bcrypt")
const userModel = require("./models/users")
const Multer = require("multer")
const fs = require("fs")

let app = Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://nimmyroz:roz206@cluster0.svkepzi.mongodb.net/autocon?retryWrites=true&w=majority&appName=Cluster0")


const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory)
}


const storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true)
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
}

const upload = Multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 }, // 200KB limit
    fileFilter: fileFilter
})



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

app.post("/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a valid PDF file (less than 200KB).' })
    }
    res.status(200).send({ message: 'File uploaded successfully', filePath: req.file.path })
})


app.use((err, req, res, next) => {
    if (err instanceof Multer.MulterError) {
        res.status(400).send({ message: 'File upload error: ' + err.message });
    } else if (err) {
        res.status(400).send({ message: err.message });
    } else {
        next();
    }
})

app.listen(3030, () => {
    console.log("server started")
})