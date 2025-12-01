import mongoose from "mongoose";

const serviceOtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Expire après 10 minutes
});

const serviceOtpModel = mongoose.models.serviceOtp || mongoose.model('serviceOtp', serviceOtpSchema);

export default serviceOtpModel;