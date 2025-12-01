import promoCodeModel from '../models/promoCodeModel.js';

// Create promo code (Service Provider)
const createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, usageLimit, usagePerUser, validFrom, validUntil } = req.body;
        const serviceId = req.docId;

        // Validate discount value
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.json({ success: false, message: "Percentage discount must be between 1 and 100" });
        }
        if (discountType === 'fixed' && discountValue <= 0) {
            return res.json({ success: false, message: "Fixed discount must be greater than 0" });
        }

        // Validate dates
        const from = new Date(validFrom);
        const until = new Date(validUntil);
        if (until <= from) {
            return res.json({ success: false, message: "Valid until date must be after valid from date" });
        }

        const promoData = {
            code: code.toUpperCase(),
            serviceId,
            discountType,
            discountValue: Number(discountValue),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            usagePerUser: Number(usagePerUser) || 1,
            validFrom: from,
            validUntil: until
        };

        const newPromo = new promoCodeModel(promoData);
        await newPromo.save();

        res.json({ success: true, message: "Promo code created successfully" });

    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: "Promo code already exists" });
        }
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get service provider's promo codes
const getServicePromoCodes = async (req, res) => {
    try {
        const serviceId = req.docId;
        const promoCodes = await promoCodeModel.find({ serviceId }).sort({ createdAt: -1 });
        res.json({ success: true, promoCodes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Validate promo code
const validatePromoCode = async (req, res) => {
    try {
        const { code, serviceId } = req.body;

        const promo = await promoCodeModel.findOne({ 
            code: code.toUpperCase(),
            serviceId,
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!promo) {
            return res.json({ success: false, message: "Invalid or expired promo code" });
        }

        // Check usage limits
        if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
            return res.json({ success: false, message: "Promo code usage limit exceeded" });
        }

        res.json({ 
            success: true, 
            promoCode: {
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update promo code
const updatePromoCode = async (req, res) => {
    try {
        const { promoId } = req.params;
        const serviceId = req.docId;
        const updateData = req.body;

        const promo = await promoCodeModel.findOne({ _id: promoId, serviceId });
        if (!promo) {
            return res.json({ success: false, message: "Promo code not found or unauthorized" });
        }

        // Validate dates if being updated
        if (updateData.validFrom || updateData.validUntil) {
            const from = new Date(updateData.validFrom || promo.validFrom);
            const until = new Date(updateData.validUntil || promo.validUntil);
            if (until <= from) {
                return res.json({ success: false, message: "Valid until date must be after valid from date" });
            }
        }

        await promoCodeModel.findByIdAndUpdate(promoId, updateData);
        res.json({ success: true, message: "Promo code updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete promo code
const deletePromoCode = async (req, res) => {
    try {
        const { promoId } = req.params;
        const serviceId = req.docId;

        const promo = await promoCodeModel.findOne({ _id: promoId, serviceId });
        if (!promo) {
            return res.json({ success: false, message: "Promo code not found or unauthorized" });
        }

        await promoCodeModel.findByIdAndDelete(promoId);
        res.json({ success: true, message: "Promo code deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createPromoCode, 
    getServicePromoCodes, 
    validatePromoCode, 
    updatePromoCode, 
    deletePromoCode 
};