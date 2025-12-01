import express from 'express'
import { addService, allServices, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controllers/serviceController.js'

const adminRouter = express.Router()

adminRouter.post('/add-service', authAdmin, upload.single('image'), addService)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-services', authAdmin, allServices)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)

export default adminRouter