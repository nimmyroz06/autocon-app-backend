const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Jsonwebtoken = require("jsonwebtoken")
const Bcrypt = require("bcrypt")
const userModel = require("./models/users")
const Multer = require("multer")
const fs = require("fs")
const path =require("path")

let app = Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://nimmyroz:roz206@cluster0.svkepzi.mongodb.net/autocon?retryWrites=true&w=majority&appName=Cluster0")


const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
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

app.post("/upload", upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), (req, res) => {
    console.log('Upload request received:', req.files); // Log the uploaded files

    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files uploaded');
        return res.status(400).send({ message: 'No files were uploaded. Please upload valid PDF files (less than 200KB).' });
    }

    // Prepare responses for each uploaded file
    const fileResponses = [];

    // Loop through each file field
    for (const field in req.files) {
        req.files[field].forEach(file => {
            fileResponses.push({ message: 'File uploaded successfully', filePath: file.path });
        });
    }

    res.status(200).send(fileResponses); // Return responses for all uploaded files
});


app.use((err, req, res, next) => {
    if (err instanceof Multer.MulterError) {
        res.status(400).send({ message: 'File upload error: ' + err.message });
    } else if (err) {
        res.status(400).send({ message: err.message });
    } else {
        next();
    }
});


app.listen(3030, () => {
    console.log("server started")
})