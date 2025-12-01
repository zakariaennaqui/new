import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import serviceModel from '../models/serviceModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import eventModel from '../models/eventModel.js'

// api for adding services
const addService = async (req, res) => {
    try {
        const {name, email, password, speciality, degree, experience, about, fees,address}= req.body;
        const imageFile = req.file;

        //checking for all data to add service
        if (!name || !email || !password || !speciality || !degree || !experience || !fees || !address || !about) {
            return res.json({success:false, message: "Please fill all the fields" });
        }

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({success:false, message: "Please enter a valid email" });
        }

        //validating strong password
        if (password.length < 8) {
            return res.json({success:false, message: "Password must be at least 8 characters long" });
        }

        //hashing service password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //uploading image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
        const imageUrl = imageUpload.secure_url;

        const serviceData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: JSON.parse(address),
            date: Date.now(),
        };

        const newService = new serviceModel(serviceData);
        await newService.save();

        res.json({success:true, message: "Service added successfully"});

    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

//
const loginAdmin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Generate JWT token
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token});   
        }else {
            res.json({success:false, message: "Invalid email or password"});
        }

    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

//
const allServices = async (req, res) => {
    try {
        const services = await serviceModel.find({}).select('-password')
        res.json({success:true, services})
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

//
const appointmentsAdmin = async (req, res) => {
    
    try {

        const appointments = await appointmentModel.find({})
        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }

}

//
const appointmentCancel = async (req, res) => {

    try {

        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

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

//
// const adminDashboard = async (req, res) => {
//     try {

//         const services = await serviceModel.find({})
//         const users = await userModel.find({})
//         const appointments = await appointmentModel.find({})

//         const dashData = {
//             services: services.length,
//             appointments: appointments.length,
//             patients: users.length,
//             latestAppointments: appointments.reverse().slice(0, 5)
//         }
//         res.json({success: true, dashData})
        
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

const adminDashboard = async (req, res) => {
  try {
    const services = await serviceModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const events = await eventModel.find({});  // fetch all events

    const dashData = {
      services: services.length,
      appointments: appointments.length,
      patients: users.length,
      events: events.length,  // added events count here
      latestAppointments: [...appointments].reverse().slice(0, 5) // cloned before reversing to avoid side effects
    };
    
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {addService, loginAdmin, allServices, appointmentsAdmin, appointmentCancel, adminDashboard}