import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true }, // Can be "Online" or physical address
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    registrationDeadline: { type: Date, required: true },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0 }, // Price per reservation if not free
    serviceId: { type: String, required: true }, // Reference to service provider
    serviceData: { type: Object, required: true }, // Service provider info
    participants: [{ 
        userId: String,
        userData: Object,
        registrationDate: { type: Date, default: Date.now },
        promoCode: String,
        finalPrice: Number
    }],
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { minimize: false });

const eventModel = mongoose.models.event || mongoose.model('event', eventSchema);

export default eventModel;