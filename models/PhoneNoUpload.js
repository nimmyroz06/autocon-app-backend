const mongoose = require('mongoose');

const PhoneNoUploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  registrationCertificate: { type: String, required: true },
  eAadhaar: { type: String, required: true },
  applicationForm: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PhoneNoUpload', PhoneNoUploadSchema);