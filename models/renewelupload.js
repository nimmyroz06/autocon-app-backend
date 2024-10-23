// models/UploadedFile.js
const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    fileFieldName: {
        type: String,
        required: true,
    }
});

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);

module.exports = UploadedFile;
