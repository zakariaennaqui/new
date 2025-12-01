import express from 'express';
import { 
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
} from '../controllers/eventController.js';
import authService from '../middlewares/authService.js';
import authUser from '../middlewares/authUser.js';

const eventRouter = express.Router();

// Service provider routes
eventRouter.post('/create', authService, createEvent);
eventRouter.get('/service-events', authService, getServiceEvents);
eventRouter.put('/update/:eventId', authService, updateEvent);
eventRouter.delete('/delete/:eventId', authService, deleteEvent);

// User routes
eventRouter.get('/all', getAllEvents);
eventRouter.post('/register', authUser, registerForEvent);
eventRouter.get('/user-events', authUser, getUserEvents);
eventRouter.post('/payment-stripe', authUser, eventPaymentStripe);
eventRouter.post('/payment-razorpay', authUser, eventPaymentRazorpay);
eventRouter.post('/verify-razorpay', authUser, verifyEventRazorpay);
eventRouter.post('/verify-stripe', authUser, verifyEventStripe);
eventRouter.post('/payment-payzone', authUser, eventPaymentPayzone);
eventRouter.post('/verify-payzone', authUser, verifyEventPayzone);

export default eventRouter;