import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    serviceId: { type: String, required: true }, // Service provider who created it
    discountType: { type: String, enum: ['fixed', 'percentage'], required: true },
    discountValue: { type: Number, required: true }, // Amount or percentage
    usageLimit: { type: Number, default: null }, // null = unlimited
    usagePerUser: { type: Number, default: 1 }, // Max uses per user
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usedBy: [{ 
        userId: String,
        usageCount: { type: Number, default: 0 },
        lastUsed: Date
    }],
    totalUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const promoCodeModel = mongoose.models.promoCode || mongoose.model('promoCode', promoCodeSchema);

export default promoCodeModel;