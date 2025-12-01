import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userModel from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';
import serviceModel from '../models/serviceModel.js'
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay'
import Stripe from 'stripe'

import calendarSlotModel from '../models/calendarSlotModel.js';

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "This user does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'invalid credentials' })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }

}

//
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        //
        if (!name || !password || !email) {
            return res.json({ success: false, message: "Please fill in all fields" })
        }

        //
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }

        //
        if (password.length < 8) {
            return res.json({ success: false, message: "enter strong password" })
        }

        //
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save();
        
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true, token})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//
const getProfile = async (req, res) => {
    try {
        //const {userId} = req.body
        const userId = req.userId;

        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true, userData})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//
const updateProfile = async (req, res) => {
    try {
        //const {userId, name, phone, address, dob, gender}=req.body
        const {name, phone, address, dob, gender}=req.body
        const userId = req.userId
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Please fill all fields" })
        }
        await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender})
        if (imageFile) {
            //
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
            const imageUrl = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, {image:imageUrl})
        }
        res.json({success:true, message:"Profile updated successfully"})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime} = req.body;
        const docData = await serviceModel.findById(docId).select('-password')
        if (!docData.available) {
            return res.json({ success: false, message: "service is not available" })
        }

        let slots_booked = docData.slots_booked

        //
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot is already booked" })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotDate,
            slotTime,
            date:Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        await serviceModel.findByIdAndUpdate(docId, {slots_booked})
        res.json({ success: true, message: "Appointment booked successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//
const listAppointment = async (req, res) => {

    try {

        //const {userId} = req.body
        const userId = req.userId;
        const appointments = await appointmentModel.find({userId})
        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

//
const cancelAppointment = async (req, res) => {

    try {

        const userId = req.userId
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "You are not authorized to cancel this appointment "})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        const {docId, slotDate, slotTime} = appointmentData

        const serviceData = await serviceModel.findById(docId)

        let slots_booked = serviceData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await serviceModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success :true, message: "Appointment cancelled successfully"})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const {appointmentId} = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled) {
        return res.json({ success: false, message: "Appointment not found" })
    }
    const options = {
        amount: appointmentData.amount * 100,
        currency: process.env.CURRENCY,
        receipt: appointmentId,
    }
    const order = await razorpayInstance.orders.create(options)
    res.json({success : true, order})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment:true});
            res.json({success:true, message:'Payment successful'});
        } else {
            res.json({success:false, message:'Payment failed'});
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

// Stripe integration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment not found or cancelled" })
        }

        const { origin } = req.headers

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify-payment?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify-payment?success=false&appointmentId=${appointmentData._id}`,
            line_items: [{
                price_data: {
                    currency: process.env.CURRENCY || 'mad',
                    product_data: {
                        name: `Appointment with ${appointmentData.docData.name}`,
                    },
                    unit_amount: appointmentData.amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body

        if (success === 'true') {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            res.json({ success: true, message: 'Payment verified successfully' })
        } else {
            res.json({ success: false, message: 'Payment cancelled' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const paymentPayzone = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment || appointment.cancelled) {
      return res.json({ success: false, message: "Appointment not found or cancelled" });
    }

    const merchantId = process.env.PAYZONE_MERCHANT_ID;
    const secretKey = process.env.PAYZONE_SECRET;
    const amount = appointment.amount;

    const returnUrl = `${req.headers.origin}/verify-payment?provider=payzone&success=true&appointmentId=${appointmentId}`;

    // Signature simulée (à adapter selon documentation Payzone)
    const crypto = await import('crypto');
    const signature = crypto.createHash('sha256').update(
      merchantId + appointmentId + amount + secretKey
    ).digest('hex');

    res.json({
      success: true,
      formData: {
        url: 'https://sandbox.payzone.ma/payment', // à remplacer par URL réelle Payzone
        data: {
          merchant_id: merchantId,
          appointment_id: appointmentId,
          amount,
          return_url: returnUrl,
          signature
        }
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyPayzone = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
    res.json({ success: true, message: "Payzone payment verified successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Payment methods for calendar slots
const calendarPaymentRazorpay = async (req, res) => {
    try {
        const { slotId } = req.body;
        const slot = await calendarSlotModel.findById(slotId);

        if (!slot || slot.cancelled) {
            return res.json({ success: false, message: "Créneau non trouvé ou annulé" });
        }

        const options = {
            amount: slot.amount * 100,
            currency: process.env.CURRENCY,
            receipt: slotId,
        };
        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyCalendarRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status === 'paid') {
            await calendarSlotModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            res.json({ success: true, message: 'Payment successful' });
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const calendarPaymentStripe = async (req, res) => {
    try {
        const { slotId } = req.body;
        const slot = await calendarSlotModel.findById(slotId);

        if (!slot || slot.cancelled) {
            return res.json({ success: false, message: "Créneau non trouvé ou annulé" });
        }

        const { origin } = req.headers;

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify-calendar-payment?success=true&slotId=${slot._id}`,
            cancel_url: `${origin}/verify-calendar-payment?success=false&slotId=${slot._id}`,
            line_items: [{
                price_data: {
                    currency: process.env.CURRENCY || 'mad',
                    product_data: {
                        name: `Réservation créneau avec ${slot.bookingData.serviceData.name}`,
                    },
                    unit_amount: slot.amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyCalendarStripe = async (req, res) => {
    try {
        const { slotId, success } = req.body;

        if (success === 'true') {
            await calendarSlotModel.findByIdAndUpdate(slotId, { payment: true });
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.json({ success: false, message: 'Payment cancelled' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const calendarPaymentPayzone = async (req, res) => {
    try {
        const { slotId } = req.body;
        const slot = await calendarSlotModel.findById(slotId);

        if (!slot || slot.cancelled) {
            return res.json({ success: false, message: "Créneau non trouvé ou annulé" });
        }

        const merchantId = process.env.PAYZONE_MERCHANT_ID;
        const secretKey = process.env.PAYZONE_SECRET;
        const amount = slot.amount;

        const returnUrl = `${req.headers.origin}/verify-calendar-payment?provider=payzone&success=true&slotId=${slotId}`;

        const crypto = await import('crypto');
        const signature = crypto.createHash('sha256').update(
            merchantId + slotId + amount + secretKey
        ).digest('hex');

        res.json({
            success: true,
            formData: {
                url: 'https://sandbox.payzone.ma/payment',
                data: {
                    merchant_id: merchantId,
                    slot_id: slotId,
                    amount,
                    return_url: returnUrl,
                    signature
                }
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyCalendarPayzone = async (req, res) => {
    try {
        const { slotId } = req.body;
        await calendarSlotModel.findByIdAndUpdate(slotId, { payment: true });
        res.json({ success: true, message: "Payzone payment verified successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay, 
    verifyRazorpay, 
    paymentStripe, 
    verifyStripe, 
    paymentPayzone, 
    verifyPayzone,
    calendarPaymentRazorpay,
    verifyCalendarRazorpay,
    calendarPaymentStripe,
    verifyCalendarStripe,
    calendarPaymentPayzone,
    verifyCalendarPayzone
};