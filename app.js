const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Jsonwebtoken = require("jsonwebtoken")
const Bcrypt = require("bcrypt")
const userModel = require("./models/users")
const adminModel = require("./models/admin")
const uploadedFileSchema = require("./models/renewelupload")
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

app.post('/renewalupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                const newFile = new uploadedFileSchema({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    fileFieldName: field,
                });
                filePromises.push(newFile.save());
            });
        }

        // Save all file details to the database
        await Promise.all(filePromises);

        res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed.' });
    }
});


app.post('/duplicateupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                const newFile = new uploadedFileSchema({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    fileFieldName: field,
                });
                filePromises.push(newFile.save());
            });
        }

        // Save all file details to the database
        await Promise.all(filePromises);

        res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed.' });
    }
});



app.post('/ownershipupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }, { name: 'file4' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                const newFile = new uploadedFileSchema({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    fileFieldName: field,
                });
                filePromises.push(newFile.save());
            });
        }

        // Save all file details to the database
        await Promise.all(filePromises);

        res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed.' });
    }
});




app.post('/addressupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }, { name: 'file4' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                const newFile = new uploadedFileSchema({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    fileFieldName: field,
                });
                filePromises.push(newFile.save());
            });
        }

        // Save all file details to the database
        await Promise.all(filePromises);

        res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed.' });
    }
});



app.post('/numberupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                const newFile = new uploadedFileSchema({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    fileFieldName: field,
                });
                filePromises.push(newFile.save());
            });
        }

        // Save all file details to the database
        await Promise.all(filePromises);

        res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed.' });
    }
});



app.post("/adminsignup", async (req, res) => {

    let input = req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password, 8)
    console.log(hashedPassword)
    req.body.password = hashedPassword

    adminModel.find({ email: req.body.email }).then(

        (items) => {

            if (items.length > 0) {

                res.json({ "status": "email id already exist" })

            } else {


                let result = new adminModel(input)
                result.save()
                res.json({ "status": "success" })
            }

        }
    ).catch(
        (error) => {

        }
    )
})

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";


app.post("/adminlogin",async(req,res)=>{
    const { email, password } = req.body;

    // Check if the provided credentials match the hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Credentials match, authentication successful
        Jsonwebtoken.sign({ email: ADMIN_EMAIL }, "autocon", { expiresIn: "1d" }, (error, token) => {
            if (error) {
                res.status(500).json({ "status": "error", "ErrorMessage": error });
            } else {
                res.status(200).json({ "status": "success", "token": token, "isAdmin": true });
            }
        });
    } else {
        // Credentials do not match
        res.status(401).json({ "status": "Invalid email or password" });
    }
});


app.get('/files', async (req, res) => {
    try {
        const files = await uploadedFileSchema.find();
        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching uploaded files' });
    }
});

app.listen(3030, () => {
    console.log("server started")
})