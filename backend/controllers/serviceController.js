import serviceModel from '../models/serviceModel.js'
import serviceOtpModel from '../models/serviceOtpModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import eventModel from '../models/eventModel.js'
import validator from 'validator'
import {v2 as cloudinary} from 'cloudinary'
import nodemailer from 'nodemailer'

import calendarSlotModel from '../models/calendarSlotModel.js';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Fonction pour générer un OTP à 6 chiffres
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Fonction pour envoyer l'email OTP
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Code de vérification - Inscription Service Provider',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Code de vérification</h2>
                <p>Votre code de vérification pour l'inscription en tant que service provider est :</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>Ce code expire dans 10 minutes.</p>
                <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const changeAvailability = async (req, res) => {
    try {

        const {docId} = req.body

        const docData = await serviceModel.findById(docId)
        await serviceModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true, message:'availability changed'})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// Inscription du service provider - Étape 1: Envoyer OTP
const registerServiceStep1 = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Vérification des champs obligatoires
        if (!name || !email || !password || !speciality || !degree || !experience || !fees || !address || !about) {
            return res.json({ success: false, message: "Veuillez remplir tous les champs" });
        }

        // Validation de l'email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Veuillez entrer un email valide" });
        }

        // Validation du mot de passe
        if (password.length < 8) {
            return res.json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères" });
        }

        // Vérifier si l'email existe déjà
        const existingService = await serviceModel.findOne({ email });
        if (existingService) {
            return res.json({ success: false, message: "Un service provider avec cet email existe déjà" });
        }

        // Vérifier si une image est fournie
        if (!imageFile) {
            return res.json({ success: false, message: "Image non sélectionnée" });
        }

        // Générer et sauvegarder l'OTP
        const otp = generateOTP();
        
        // Supprimer les anciens OTP pour cet email
        await serviceOtpModel.deleteMany({ email });
        
        // Sauvegarder le nouvel OTP
        const otpDoc = new serviceOtpModel({ email, otp });
        await otpDoc.save();

        // Envoyer l'email OTP
        await sendOTPEmail(email, otp);

        // Stocker temporairement les données (vous pourriez utiliser Redis en production)
        // Pour simplifier, nous allons les renvoyer au frontend pour les stocker temporairement
        res.json({ 
            success: true, 
            message: "Code OTP envoyé à votre email",
            tempData: {
                name, email, password, speciality, degree, experience, about, fees, address
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Inscription du service provider - Étape 2: Vérifier OTP et créer le compte
const registerServiceStep2 = async (req, res) => {
    try {
        const { email, otp, serviceData } = req.body;
        const imageFile = req.file;

        // Vérifier l'OTP
        const otpDoc = await serviceOtpModel.findOne({ email, otp });
        if (!otpDoc) {
            return res.json({ success: false, message: "Code OTP invalide ou expiré" });
        }

        // Vérifier si l'email existe déjà
        const existingService = await serviceModel.findOne({ email });
        if (existingService) {
            return res.json({ success: false, message: "Un service provider avec cet email existe déjà" });
        }

        // Parser les données du service si c'est une chaîne JSON
        const parsedServiceData = typeof serviceData === 'string' ? JSON.parse(serviceData) : serviceData;

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parsedServiceData.password, salt);

        // Uploader l'image sur Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
        const imageUrl = imageUpload.secure_url;

        // Créer le service provider
        const newServiceData = {
            name: parsedServiceData.name,
            email: parsedServiceData.email,
            image: imageUrl,
            password: hashedPassword,
            speciality: parsedServiceData.speciality,
            degree: parsedServiceData.degree,
            experience: parsedServiceData.experience,
            about: parsedServiceData.about,
            fees: Number(parsedServiceData.fees),
            address: JSON.parse(parsedServiceData.address),
            date: Date.now(),
            available: false // Par défaut non disponible jusqu'à approbation admin
        };

        const newService = new serviceModel(newServiceData);
        await newService.save();

        // Supprimer l'OTP utilisé
        await serviceOtpModel.deleteOne({ email, otp });

        res.json({ success: true, message: "Inscription réussie! Votre compte sera activé après approbation de l'administrateur." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Renvoyer l'OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: "Email invalide" });
        }

        // Générer un nouvel OTP
        const otp = generateOTP();
        
        // Supprimer les anciens OTP pour cet email
        await serviceOtpModel.deleteMany({ email });
        
        // Sauvegarder le nouvel OTP
        const otpDoc = new serviceOtpModel({ email, otp });
        await otpDoc.save();

        // Envoyer l'email OTP
        await sendOTPEmail(email, otp);

        res.json({ success: true, message: "Nouveau code OTP envoyé" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const serviceList = async (req, res) => {
    try {
        const services = await serviceModel.find({}).select(['-password', '-email'])

        res.json({success:true, services})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
const loginService = async (req, res) => {
    try {

        const {email, password} = req.body
        const service = await serviceModel.findOne({email})
        if(!service) {
            return res.json({success:false, message:'invalid email or password'})
        }
        const isMatch = await bcrypt.compare(password, service.password)
        if(isMatch) {
            const token = jwt.sign({id:service._id}, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            res.json({success:false, message:'invalid email or password'})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
const appointmentsService = async (req, res) => {
    try {
        const docId = req.docId;
        
        // Récupérer les rendez-vous classiques
        const appointments = await appointmentModel.find({ docId });
        
        // Récupérer les réservations de créneaux
        const calendarBookings = await calendarSlotModel.find({ 
            serviceId: docId, 
            isBooked: true 
        });
        
        // Transformer les réservations de créneaux au format des rendez-vous
        const transformedBookings = calendarBookings.map(slot => ({
            _id: slot._id,
            userId: slot.bookedBy,
            docId: slot.serviceId,
            slotDate: slot.date.replace(/-/g, '_'),
            slotTime: slot.startTime,
            userData: slot.bookingData?.userData || {},
            docData: slot.bookingData?.serviceData || {},
            amount: slot.amount,
            date: new Date(slot.createdAt).getTime(),
            cancelled: slot.cancelled,
            payment: slot.payment,
            isCompleted: slot.isCompleted,
            isCalendarBooking: true // Flag pour identifier les réservations de créneaux
        }));
        
        // Combiner les deux types de rendez-vous
        const allAppointments = [...appointments, ...transformedBookings];
        
        res.json({ success: true, appointments: allAppointments });
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const docId = req.docId;

        // Vérifier d'abord si c'est un rendez-vous classique
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'appointment completed successfully' });
        }
        
        // Sinon, vérifier si c'est une réservation de créneau
        const calendarSlot = await calendarSlotModel.findById(appointmentId);
        if (calendarSlot && calendarSlot.serviceId === docId) {
            await calendarSlotModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'calendar booking completed successfully' });
        } else {
            return res.json({ success: false, message: 'Mark failed' });
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const docId = req.docId;

        // Vérifier d'abord si c'est un rendez-vous classique
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: 'appointment cancelled' });
        }
        
        // Sinon, vérifier si c'est une réservation de créneau
        const calendarSlot = await calendarSlotModel.findById(appointmentId);
        if (calendarSlot && calendarSlot.serviceId === docId) {
            await calendarSlotModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: 'calendar booking cancelled' });
        } else {
            return res.json({ success: false, message: 'cancellation failed' });
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
// const serviceDashboard = async (req, res) => {
//     try {
//         //const {docId} = req.body;
//         const docId = req.docId;
//         const appointments = await appointmentModel.find({docId})
//         let earnings = 0
//         appointments.map((item)=>{
//             if(item.isCompleted || item.payment) {
//                 earnings += item.amount
//             }
//         })
//         let patients = []

//         appointments.map((item)=>{
//             if (!patients.includes(item.userId)) {
//                 patients.push(item.userId)
//             }
//         })

//         const dashData = {
//             earnings,
//             appointments: appointments.length,
//             patients: patients.length,
//             latestAppointments: appointments.reverse().slice(0, 5)
//         }
//         res.json({success:true, dashData})
//     } catch (error) {
//         console.log(error)
//         res.json({success:false, message:error.message})
//     }
// }

const serviceDashboard = async (req, res) => {
  try {
    const docId = req.docId;

    // Get all regular appointments for this service provider
    const appointments = await appointmentModel.find({ docId });

    // Get all calendar bookings for this service provider
    const calendarBookings = await calendarSlotModel.find({ 
      serviceId: docId, 
      isBooked: true 
    });

    // Get all events for this service provider
    const events = await eventModel.find({ serviceId: docId });

    // Calculate earnings from regular appointments
    let earnings = 0;
    appointments.forEach(item => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    // Calculate earnings from calendar bookings
    calendarBookings.forEach(booking => {
      if (booking.isCompleted || booking.payment) {
        earnings += booking.amount;
      }
    });

    // Calculate earnings from event participants' finalPrice
    events.forEach(event => {
      event.participants.forEach(participant => {
        if (participant.finalPrice) {
          earnings += participant.finalPrice;
        }
      });
    });

    // Collect unique clients from appointments, calendar bookings, and events participants
    const clientsSet = new Set();

    appointments.forEach(item => {
      if (item.userId) clientsSet.add(item.userId.toString());
    });

    calendarBookings.forEach(booking => {
      if (booking.bookedBy) clientsSet.add(booking.bookedBy.toString());
    });

    events.forEach(event => {
      event.participants.forEach(participant => {
        if (participant.userId) clientsSet.add(participant.userId.toString());
      });
    });

    // Transform calendar bookings to appointment format for latest appointments
    const transformedBookings = calendarBookings.map(slot => ({
      _id: slot._id,
      userId: slot.bookedBy,
      docId: slot.serviceId,
      slotDate: slot.date.replace(/-/g, '_'),
      slotTime: slot.startTime,
      userData: slot.bookingData?.userData || {},
      docData: slot.bookingData?.serviceData || {},
      amount: slot.amount,
      date: new Date(slot.createdAt).getTime(),
      cancelled: slot.cancelled,
      payment: slot.payment,
      isCompleted: slot.isCompleted,
      isCalendarBooking: true
    }));

    // Combine all appointments and sort by date
    const allAppointments = [...appointments, ...transformedBookings];
    const latestAppointments = allAppointments
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    const dashData = {
      earnings,
      appointments: appointments.length + calendarBookings.length,
      events: events.length,
      patients: clientsSet.size,  // unique clients count
      latestAppointments
    };

    res.json({ success: true, dashData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//
const serviceProfile = async (req, res) => {
    try {

        //const {docId} = req.body
        const docId = req.docId;
        const profileData = await serviceModel.findById(docId).select('-password')
        res.json({success:true, profileData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//
const updateServiceProfile = async (req, res) => {
    try {

        //const {docId, fees, address, available} = req.body
        const docId = req.docId;
        const {fees, address, available} = req.body
        await serviceModel.findByIdAndUpdate(docId, {fees, address, available})
        res.json({success:true, message:'profile updated'})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

export {
    changeAvailability, 
    serviceList, 
    loginService, 
    appointmentsService, 
    appointmentComplete, 
    appointmentCancel, 
    serviceDashboard, 
    serviceProfile, 
    updateServiceProfile,
    registerServiceStep1,
    registerServiceStep2,
    resendOTP
}