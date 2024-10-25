const mongoose = require('mongoose');

const uploadedFileSchema3 = new mongoose.Schema({
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

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema3);

module.exports = UploadedFile;
