import express from 'express';
import {
    updateCalendarConfig,
    getCalendarConfig,
    generateSlots,
    getServiceSlots,
    toggleSlotStatus,
    getAvailableSlots,
    bookSlot,
    cancelSlotBooking,
    getUserBookings,
    completeSlotBooking,
    cancelSlotBookingByService
} from '../controllers/calendarController.js';
import authService from '../middlewares/authService.js';
import authUser from '../middlewares/authUser.js';

const calendarRouter = express.Router();

// Routes pour les service providers
calendarRouter.get('/config', authService, getCalendarConfig);
calendarRouter.post('/config', authService, updateCalendarConfig);
calendarRouter.post('/generate-slots', authService, generateSlots);
calendarRouter.get('/service-slots', authService, getServiceSlots);
calendarRouter.post('/toggle-slot', authService, toggleSlotStatus);
calendarRouter.post('/complete-booking', authService, completeSlotBooking);
calendarRouter.post('/cancel-booking-service', authService, cancelSlotBookingByService);

// Routes pour les utilisateurs
calendarRouter.get('/available-slots/:serviceId', getAvailableSlots);
calendarRouter.post('/book-slot', authUser, bookSlot);
calendarRouter.post('/cancel-booking', authUser, cancelSlotBooking);
calendarRouter.get('/user-bookings', authUser, getUserBookings);

export default calendarRouter;