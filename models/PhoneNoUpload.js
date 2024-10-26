const mongoose = require('mongoose');

// Define the schema for ownership transfers
const ownershipTransferSchema = new mongoose.Schema({
    registrationCertificate: {
        type: String,
        required: true,
    },
    buyersAadhaar: {
        type: String,
        required: true,
    },
    form29: {
        type: String,
        required: true,
    },
    form30: {
        type: String,
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    transferDate: {
        type: Date,
        default: Date.now, // Automatically set the date to now when a file is uploaded
    },
});

// Create the model from the schema
const OwnershipTransfer = mongoose.model('OwnershipTransfer', ownershipTransferSchema);

// Export the model
module.exports = OwnershipTransfer;
