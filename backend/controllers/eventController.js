import eventModel from '../models/eventModel.js';
import serviceModel from '../models/serviceModel.js';
import userModel from '../models/userModel.js';
import promoCodeModel from '../models/promoCodeModel.js';
import razorpay from 'razorpay';
import Stripe from 'stripe';

// Initialize payment gateways
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Create new event (Service Provider)
const createEvent = async (req, res) => {
    try {
        const { title, description, location, startDate, endDate, maxParticipants, registrationDeadline, isFree, price } = req.body;
        const serviceId = req.docId;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const deadline = new Date(registrationDeadline);
        const now = new Date();

        if (start <= now) {
            return res.json({ success: false, message: "Start date must be in the future" });
        }
        if (end <= start) {
            return res.json({ success: false, message: "End date must be after start date" });
        }
        if (deadline >= start) {
            return res.json({ success: false, message: "Registration deadline must be before start date" });
        }

        // Get service provider data
        const serviceData = await serviceModel.findById(serviceId).select('-password');
        if (!serviceData) {
            return res.json({ success: false, message: "Service provider not found" });
        }

        const eventData = {
            title,
            description,
            location,
            startDate: start,
            endDate: end,
            maxParticipants: Number(maxParticipants),
            registrationDeadline: deadline,
            isFree: isFree === 'true',
            price: isFree === 'true' ? 0 : Number(price),
            serviceId,
            serviceData: {
                name: serviceData.name,
                image: serviceData.image,
                speciality: serviceData.speciality
            },
            participants: []
        };

        const newEvent = new eventModel(eventData);
        await newEvent.save();

        res.json({ success: true, message: "Event created successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get events for service provider
const getServiceEvents = async (req, res) => {
    try {
        const serviceId = req.docId;
        const events = await eventModel.find({ serviceId }).sort({ createdAt: -1 });
        res.json({ success: true, events });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all active events (for users)
const getAllEvents = async (req, res) => {
    try {
        const now = new Date();
        const events = await eventModel.find({ 
            isActive: true,
            registrationDeadline: { $gt: now }
        }).sort({ startDate: 1 });
        res.json({ success: true, events });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Register for event
const registerForEvent = async (req, res) => {
    try {
        const { eventId, promoCode } = req.body;
        const userId = req.userId;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: "Event not found" });
        }

        // Check if registration is still open
        if (new Date() > event.registrationDeadline) {
            return res.json({ success: false, message: "Registration deadline has passed" });
        }

        // Check if event is full
        if (event.participants.length >= event.maxParticipants) {
            return res.json({ success: false, message: "Event is full" });
        }

        // Check if user already registered
        const alreadyRegistered = event.participants.some(p => p.userId === userId);
        if (alreadyRegistered) {
            return res.json({ success: false, message: "You are already registered for this event" });
        }

        // Get user data
        const userData = await userModel.findById(userId).select('-password');
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let finalPrice = event.price;
        let usedPromoCode = null;

        // Apply promo code if provided
        if (promoCode && !event.isFree) {
            const promo = await promoCodeModel.findOne({ 
                code: promoCode,
                serviceId: event.serviceId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promo) {
                // Check usage limits
                const userUsage = promo.usedBy.find(u => u.userId === userId);
                const userUsageCount = userUsage ? userUsage.usageCount : 0;

                if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
                    return res.json({ success: false, message: "Promo code usage limit exceeded" });
                }

                if (userUsageCount >= promo.usagePerUser) {
                    return res.json({ success: false, message: "You have reached the usage limit for this promo code" });
                }

                // Apply discount
                if (promo.discountType === 'fixed') {
                    finalPrice = Math.max(0, finalPrice - promo.discountValue);
                } else {
                    finalPrice = finalPrice * (1 - promo.discountValue / 100);
                }

                // Update promo code usage
                if (userUsage) {
                    userUsage.usageCount += 1;
                    userUsage.lastUsed = new Date();
                } else {
                    promo.usedBy.push({
                        userId,
                        usageCount: 1,
                        lastUsed: new Date()
                    });
                }
                promo.totalUsed += 1;
                await promo.save();

                usedPromoCode = promoCode;
            }
        }

        // Add participant
        event.participants.push({
            userId,
            userData: {
                name: userData.name,
                email: userData.email,
                image: userData.image
            },
            promoCode: usedPromoCode,
            finalPrice
        });

        await event.save();

        res.json({ success: true, message: "Successfully registered for event", finalPrice });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's registered events
const getUserEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const events = await eventModel.find({ 
            "participants.userId": userId 
        }).sort({ startDate: 1 });
        res.json({ success: true, events });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const serviceId = req.docId;
        const updateData = req.body;

        const event = await eventModel.findOne({ _id: eventId, serviceId });
        if (!event) {
            return res.json({ success: false, message: "Event not found or unauthorized" });
        }

        // Validate dates if being updated
        if (updateData.startDate || updateData.endDate || updateData.registrationDeadline) {
            const start = new Date(updateData.startDate || event.startDate);
            const end = new Date(updateData.endDate || event.endDate);
            const deadline = new Date(updateData.registrationDeadline || event.registrationDeadline);

            if (end <= start) {
                return res.json({ success: false, message: "End date must be after start date" });
            }
            if (deadline >= start) {
                return res.json({ success: false, message: "Registration deadline must be before start date" });
            }
        }

        await eventModel.findByIdAndUpdate(eventId, updateData);
        res.json({ success: true, message: "Event updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const serviceId = req.docId;

        const event = await eventModel.findOne({ _id: eventId, serviceId });
        if (!event) {
            return res.json({ success: false, message: "Event not found or unauthorized" });
        }

        await eventModel.findByIdAndDelete(eventId);
        res.json({ success: true, message: "Event deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Payment methods for events
const eventPaymentStripe = async (req, res) => {
    try {
        const { eventId, promoCode } = req.body;
        const userId = req.userId;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: "Event not found" });
        }

        // Check if registration is still open
        if (new Date() > event.registrationDeadline) {
            return res.json({ success: false, message: "Registration deadline has passed" });
        }

        // Check if event is full
        if (event.participants.length >= event.maxParticipants) {
            return res.json({ success: false, message: "Event is full" });
        }

        // Check if user already registered
        const alreadyRegistered = event.participants.some(p => p.userId === userId);
        if (alreadyRegistered) {
            return res.json({ success: false, message: "You are already registered for this event" });
        }

        let finalPrice = event.price;
        let usedPromoCode = null;

        // Apply promo code if provided
        if (promoCode && !event.isFree) {
            const promo = await promoCodeModel.findOne({ 
                code: promoCode,
                serviceId: event.serviceId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promo) {
                // Check usage limits
                const userUsage = promo.usedBy.find(u => u.userId === userId);
                const userUsageCount = userUsage ? userUsage.usageCount : 0;

                if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
                    return res.json({ success: false, message: "Promo code usage limit exceeded" });
                }

                if (userUsageCount >= promo.usagePerUser) {
                    return res.json({ success: false, message: "You have reached the usage limit for this promo code" });
                }

                // Apply discount
                if (promo.discountType === 'fixed') {
                    finalPrice = Math.max(0, finalPrice - promo.discountValue);
                } else {
                    finalPrice = finalPrice * (1 - promo.discountValue / 100);
                }

                usedPromoCode = promoCode;
            }
        }

        const { origin } = req.headers;

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify-event-payment?success=true&eventId=${eventId}&promoCode=${usedPromoCode || ''}`,
            cancel_url: `${origin}/verify-event-payment?success=false&eventId=${eventId}`,
            line_items: [{
                price_data: {
                    currency: process.env.CURRENCY || 'usd',
                    product_data: {
                        name: `Event Registration: ${event.title}`,
                        description: `Registration for ${event.title} by ${event.serviceData.name}`,
                    },
                    unit_amount: Math.round(finalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: {
                eventId,
                userId,
                promoCode: usedPromoCode || '',
                finalPrice: finalPrice.toString()
            }
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const eventPaymentRazorpay = async (req, res) => {
    try {
        const { eventId, promoCode } = req.body;
        const userId = req.userId;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: "Event not found" });
        }

        // Check if registration is still open
        if (new Date() > event.registrationDeadline) {
            return res.json({ success: false, message: "Registration deadline has passed" });
        }

        // Check if event is full
        if (event.participants.length >= event.maxParticipants) {
            return res.json({ success: false, message: "Event is full" });
        }

        // Check if user already registered
        const alreadyRegistered = event.participants.some(p => p.userId === userId);
        if (alreadyRegistered) {
            return res.json({ success: false, message: "You are already registered for this event" });
        }

        let finalPrice = event.price;
        let usedPromoCode = null;

        // Apply promo code if provided
        if (promoCode && !event.isFree) {
            const promo = await promoCodeModel.findOne({ 
                code: promoCode,
                serviceId: event.serviceId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promo) {
                // Check usage limits
                const userUsage = promo.usedBy.find(u => u.userId === userId);
                const userUsageCount = userUsage ? userUsage.usageCount : 0;

                if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
                    return res.json({ success: false, message: "Promo code usage limit exceeded" });
                }

                if (userUsageCount >= promo.usagePerUser) {
                    return res.json({ success: false, message: "You have reached the usage limit for this promo code" });
                }

                // Apply discount
                if (promo.discountType === 'fixed') {
                    finalPrice = Math.max(0, finalPrice - promo.discountValue);
                } else {
                    finalPrice = finalPrice * (1 - promo.discountValue / 100);
                }

                usedPromoCode = promoCode;
            }
        }

        const options = {
            amount: Math.round(finalPrice * 100),
            currency: process.env.CURRENCY || 'usd',
            receipt: `event_${eventId}_${userId}`,
            notes: {
                eventId,
                userId,
                promoCode: usedPromoCode || '',
                finalPrice: finalPrice.toString()
            }
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyEventRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, eventId, promoCode } = req.body;
        const userId = req.userId;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === 'paid') {
            // Register user for event
            const registrationResult = await registerUserForEvent(eventId, userId, promoCode);
            
            if (registrationResult.success) {
                res.json({ success: true, message: 'Payment successful and registration completed' });
            } else {
                res.json({ success: false, message: registrationResult.message });
            }
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyEventStripe = async (req, res) => {
    try {
        const { success, eventId, promoCode } = req.body;
        const userId = req.userId;

        if (success === 'true') {
            // Register user for event
            const registrationResult = await registerUserForEvent(eventId, userId, promoCode);
            
            if (registrationResult.success) {
                res.json({ success: true, message: 'Payment verified and registration completed' });
            } else {
                res.json({ success: false, message: registrationResult.message });
            }
        } else {
            res.json({ success: false, message: 'Payment cancelled' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const eventPaymentPayzone = async (req, res) => {
    try {
        const { eventId, promoCode } = req.body;
        const userId = req.userId;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: "Event not found" });
        }

        let finalPrice = event.price;
        let usedPromoCode = null;

        // Apply promo code if provided
        if (promoCode && !event.isFree) {
            const promo = await promoCodeModel.findOne({ 
                code: promoCode,
                serviceId: event.serviceId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promo) {
                // Apply discount
                if (promo.discountType === 'fixed') {
                    finalPrice = Math.max(0, finalPrice - promo.discountValue);
                } else {
                    finalPrice = finalPrice * (1 - promo.discountValue / 100);
                }
                usedPromoCode = promoCode;
            }
        }

        const merchantId = process.env.PAYZONE_MERCHANT_ID;
        const secretKey = process.env.PAYZONE_SECRET;
        const returnUrl = `${req.headers.origin}/verify-event-payment?provider=payzone&success=true&eventId=${eventId}&promoCode=${usedPromoCode || ''}`;

        // Signature simulée (à adapter selon documentation Payzone)
        const crypto = await import('crypto');
        const signature = crypto.createHash('sha256').update(
            merchantId + eventId + finalPrice + secretKey
        ).digest('hex');

        res.json({
            success: true,
            formData: {
                url: 'https://sandbox.payzone.ma/payment',
                data: {
                    merchant_id: merchantId,
                    event_id: eventId,
                    amount: finalPrice,
                    return_url: returnUrl,
                    signature,
                    user_id: userId,
                    promo_code: usedPromoCode || ''
                }
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyEventPayzone = async (req, res) => {
    try {
        const { eventId, promoCode } = req.body;
        const userId = req.userId;

        // Register user for event
        const registrationResult = await registerUserForEvent(eventId, userId, promoCode);
        
        if (registrationResult.success) {
            res.json({ success: true, message: "Payzone payment verified and registration completed" });
        } else {
            res.json({ success: false, message: registrationResult.message });
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Helper function to register user for event after payment
const registerUserForEvent = async (eventId, userId, promoCode) => {
    try {
        const event = await eventModel.findById(eventId);
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        // Check if user already registered
        const alreadyRegistered = event.participants.some(p => p.userId === userId);
        if (alreadyRegistered) {
            return { success: false, message: "You are already registered for this event" };
        }

        // Get user data
        const userData = await userModel.findById(userId).select('-password');
        if (!userData) {
            return { success: false, message: "User not found" };
        }

        let finalPrice = event.price;
        let usedPromoCode = null;

        // Apply promo code if provided
        if (promoCode && !event.isFree) {
            const promo = await promoCodeModel.findOne({ 
                code: promoCode,
                serviceId: event.serviceId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promo) {
                // Check usage limits
                const userUsage = promo.usedBy.find(u => u.userId === userId);
                const userUsageCount = userUsage ? userUsage.usageCount : 0;

                if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
                    return { success: false, message: "Promo code usage limit exceeded" };
                }

                if (userUsageCount >= promo.usagePerUser) {
                    return { success: false, message: "You have reached the usage limit for this promo code" };
                }

                // Apply discount
                if (promo.discountType === 'fixed') {
                    finalPrice = Math.max(0, finalPrice - promo.discountValue);
                } else {
                    finalPrice = finalPrice * (1 - promo.discountValue / 100);
                }

                // Update promo code usage
                if (userUsage) {
                    userUsage.usageCount += 1;
                    userUsage.lastUsed = new Date();
                } else {
                    promo.usedBy.push({
                        userId,
                        usageCount: 1,
                        lastUsed: new Date()
                    });
                }
                promo.totalUsed += 1;
                await promo.save();

                usedPromoCode = promoCode;
            }
        }

        // Add participant
        event.participants.push({
            userId,
            userData: {
                name: userData.name,
                email: userData.email,
                image: userData.image
            },
            promoCode: usedPromoCode,
            finalPrice
        });

        await event.save();

        return { success: true, message: "Successfully registered for event", finalPrice };

    } catch (error) {
        console.log(error);
        return { success: false, message: error.message };
    }
};

export { 
    createEvent, 
    getServiceEvents, 
    getAllEvents, 
    registerForEvent, 
    getUserEvents, 
    updateEvent, 
    deleteEvent,
    eventPaymentStripe,
    eventPaymentRazorpay,
    verifyEventRazorpay,
    verifyEventStripe,
    eventPaymentPayzone,
    verifyEventPayzone
};