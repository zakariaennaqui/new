import express from 'express';
import { serviceList, loginService, appointmentsService, appointmentComplete, appointmentCancel, serviceDashboard, serviceProfile, updateServiceProfile, registerServiceStep1, registerServiceStep2, resendOTP } from '../controllers/serviceController.js';
import authService from '../middlewares/authService.js';
import upload from '../middlewares/multer.js';

const serviceRouter = express.Router();

serviceRouter.get('/list' , serviceList)
serviceRouter.post('/login' , loginService)
serviceRouter.post('/register-step1', upload.single('image'), registerServiceStep1)
serviceRouter.post('/register-step2', upload.single('image'), registerServiceStep2)
serviceRouter.post('/resend-otp', resendOTP)
serviceRouter.get('/appointments', authService, appointmentsService)
serviceRouter.post('/complete-appointment', authService, appointmentComplete)
serviceRouter.post('/cancel-appointment', authService, appointmentCancel)
serviceRouter.get('/dashboard', authService, serviceDashboard)
serviceRouter.get('/profile', authService, serviceProfile)
serviceRouter.post('/update-profile', authService, updateServiceProfile)

export default serviceRouter;