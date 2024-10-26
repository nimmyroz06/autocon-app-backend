const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Jsonwebtoken = require("jsonwebtoken")
const Bcrypt = require("bcrypt")
const userModel = require("./models/users")
const adminModel = require("./models/admin")
const uploadedFileSchema = require("./models/renewelupload")
const PhoneNoUpload = require('./models/PhoneNoUpload');
const OwnershipTransfer = require('./models/ownership'); 
const Multer = require("multer")
const fs = require("fs")
const path =require("path")

let app = Express()

app.use(Express.json())
app.use(Cors())
app.use('/uploads', Express.static(path.join(__dirname, 'uploads')));

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
        // Use the original name of the file
        cb(null, file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};


const upload = Multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 }, // 200KB limit
    fileFilter: fileFilter
});

app.post('/renewalupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const filePromises = [];
        for (const field in req.files) {
            req.files[field].forEach(file => {
                // Log path and filename to confirm values
                console.log('File path:', file.path);
                console.log('File filename:', file.filename);
                
                const newFile = new uploadedFileSchema({
                    fileName: file.filename, // Use generated filename
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path, // Save the full path to the database
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




app.get('/files', async (req, res) => {
    try {
        const files = await uploadedFileSchema.find();

        // Convert file path to use forward slashes
        const formattedFiles = files.map(file => ({
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            uploadDate: file.uploadDate,
            filePath: file.filePath.replace(/\\/g, '/') // Ensure forward slashes for URLs
        }));
        console.log(formattedFiles);

        res.status(200).json(formattedFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching uploaded files' });
    }
});





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
app.post('/numberupload', upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
    { name: 'file3', maxCount: 1 }
  ]), async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length < 3) {
        return res.status(400).json({ message: 'All three files are required.' });
      }
  
      const { file1, file2, file3 } = req.files;
  
      const newUpload = new PhoneNoUpload({
         // Ensure the user is authenticated; adjust as per your auth setup
        registrationCertificate: file1[0].path,
        eAadhaar: file2[0].path,
        applicationForm: file3[0].path,
      });
  
      await newUpload.save();
      res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed. Please try again.' });
    }
  });




  

  app.post('/ownershipupload', upload.fields([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
      { name: 'file3', maxCount: 1 },
      { name: 'file4', maxCount: 1 },
  ]), async (req, res) => {
      try {
          // Check if all files are uploaded
          if (!req.files.file1 || !req.files.file2 || !req.files.file3 || !req.files.file4) {
              return res.status(400).json({ message: 'All files must be uploaded.' });
          }
  
          // Create a new ownership transfer record
          const ownershipTransfer = new OwnershipTransfer({
              registrationCertificate: req.files.file1[0].path, // File path for Registration Certificate
              buyersAadhaar: req.files.file2[0].path,           // File path for Buyer's Aadhaar
              form29: req.files.file3[0].path,                  // File path for Form 29
              form30: req.files.file4[0].path,                  // File path for Form 30
              ownerName: req.body.ownerName,                     // Owner's name from the request body
          });
  
          // Save the ownership transfer record to the database
          await ownershipTransfer.save();
  
          res.status(200).json({ message: 'Files uploaded successfully.', ownershipTransfer });
      } catch (error) {
          console.error('Upload error:', error);
          res.status(500).json({ message: 'File upload failed. Please try again.', error });
      }
  });


  // API endpoint for retrieving ownership transfers
app.get('/ownershiptransfers', async (req, res) => {
    try {
        const transfers = await OwnershipTransfer.find(); // Fetch all ownership transfer records
        res.status(200).json(transfers);
    } catch (error) {
        console.error('Error retrieving ownership transfers:', error);
        res.status(500).json({ message: 'Error retrieving ownership transfers.' });
    }
});

  

  



/* app.post('/duplicateupload', upload.fields([{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }]), async (req, res) => {
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

 */

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




app.listen(3030, () => {
    console.log("server started")
})