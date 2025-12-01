import express from 'express';
import { 
    createPromoCode, 
    getServicePromoCodes, 
    validatePromoCode, 
    updatePromoCode, 
    deletePromoCode 
} from '../controllers/promoCodeController.js';
import authService from '../middlewares/authService.js';

const promoCodeRouter = express.Router();

// Service provider routes
promoCodeRouter.post('/create', authService, createPromoCode);
promoCodeRouter.get('/service-codes', authService, getServicePromoCodes);
promoCodeRouter.put('/update/:promoId', authService, updatePromoCode);
promoCodeRouter.delete('/delete/:promoId', authService, deletePromoCode);

// Public route for validation
promoCodeRouter.post('/validate', validatePromoCode);

export default promoCodeRouter;