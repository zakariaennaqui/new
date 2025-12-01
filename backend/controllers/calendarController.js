import calendarSlotModel from '../models/calendarSlotModel.js';
import calendarConfigModel from '../models/calendarConfigModel.js';
import serviceModel from '../models/serviceModel.js';
import userModel from '../models/userModel.js';

// Configuration du calendrier (Service Provider)
const updateCalendarConfig = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { defaultDuration, workingDays, workingHours, breakTimes } = req.body;

        const config = await calendarConfigModel.findOneAndUpdate(
            { serviceId },
            {
                defaultDuration,
                workingDays,
                workingHours,
                breakTimes,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Configuration mise à jour", config });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Récupérer la configuration du calendrier
const getCalendarConfig = async (req, res) => {
    try {
        const serviceId = req.docId;
        
        let config = await calendarConfigModel.findOne({ serviceId });
        if (!config) {
            // Créer une configuration par défaut
            config = new calendarConfigModel({ serviceId });
            await config.save();
        }

        res.json({ success: true, config });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Générer des créneaux automatiquement
const generateSlots = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { startDate, endDate } = req.body;

        const config = await calendarConfigModel.findOne({ serviceId });
        if (!config) {
            return res.json({ success: false, message: "Configuration non trouvée" });
        }

        const slots = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            
            // Vérifier si c'est un jour de travail
            if (!config.workingDays.includes(dayOfWeek)) continue;

            const dateStr = date.toISOString().split('T')[0];
            
            // Supprimer les anciens créneaux pour cette date
            await calendarSlotModel.deleteMany({ serviceId, date: dateStr });

            // Générer les créneaux pour cette journée
            const workStart = new Date(`${dateStr}T${config.workingHours.start}:00`);
            const workEnd = new Date(`${dateStr}T${config.workingHours.end}:00`);

            let currentTime = new Date(workStart);
            
            while (currentTime < workEnd) {
                const slotEnd = new Date(currentTime.getTime() + config.defaultDuration * 60000);
                
                if (slotEnd > workEnd) break;

                // Vérifier les pauses
                const isBreakTime = config.breakTimes.some(breakTime => {
                    const breakStart = new Date(`${dateStr}T${breakTime.start}:00`);
                    const breakEnd = new Date(`${dateStr}T${breakTime.end}:00`);
                    return currentTime < breakEnd && slotEnd > breakStart;
                });

                if (!isBreakTime) {
                    const slot = new calendarSlotModel({
                        serviceId,
                        date: dateStr,
                        startTime: currentTime.toTimeString().slice(0, 5),
                        endTime: slotEnd.toTimeString().slice(0, 5),
                        duration: config.defaultDuration,
                        isActive: true
                    });
                    
                    slots.push(slot);
                }

                currentTime = new Date(slotEnd);
            }
        }

        await calendarSlotModel.insertMany(slots);
        res.json({ success: true, message: `${slots.length} créneaux générés`, slots: slots.length });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Récupérer les créneaux du service provider
const getServiceSlots = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { startDate, endDate } = req.query;

        const query = { serviceId };
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const slots = await calendarSlotModel.find(query)
            .sort({ date: 1, startTime: 1 })
            .populate('bookedBy', 'name email phone image dob')
            .lean();
        
        // Ensure bookingData is properly structured for display
        const slotsWithBookingData = slots.map(slot => {
            if (slot.isBooked && slot.bookingData) {
                return slot;
            }
            return slot;
        });
        
        res.json({ success: true, slots });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Activer/désactiver un créneau
const toggleSlotStatus = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { slotId } = req.body;

        const slot = await calendarSlotModel.findOne({ _id: slotId, serviceId });
        if (!slot) {
            return res.json({ success: false, message: "Créneau non trouvé" });
        }

        if (slot.isBooked) {
            return res.json({ success: false, message: "Impossible de modifier un créneau réservé" });
        }

        slot.isActive = !slot.isActive;
        await slot.save();

        res.json({ success: true, message: `Créneau ${slot.isActive ? 'activé' : 'désactivé'}` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Récupérer les créneaux disponibles pour un service (côté utilisateur)
const getAvailableSlots = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { startDate, endDate } = req.query;

        const service = await serviceModel.findById(serviceId);
        if (!service || !service.available) {
            return res.json({ success: false, message: "Service non disponible" });
        }

        const query = {
            serviceId,
            isActive: true,
            isBooked: false,
            date: { $gte: startDate || new Date().toISOString().split('T')[0] }
        };

        if (endDate) {
            query.date.$lte = endDate;
        }

        const slots = await calendarSlotModel.find(query).sort({ date: 1, startTime: 1 });
        res.json({ success: true, slots });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Réserver un créneau (côté utilisateur)
const bookSlot = async (req, res) => {
    try {
        const userId = req.userId;
        const { slotId } = req.body;

        const slot = await calendarSlotModel.findById(slotId);
        if (!slot) {
            return res.json({ success: false, message: "Créneau non trouvé" });
        }

        if (!slot.isActive || slot.isBooked) {
            return res.json({ success: false, message: "Créneau non disponible" });
        }

        const userData = await userModel.findById(userId).select('-password');
        const serviceData = await serviceModel.findById(slot.serviceId).select('-password');

        // Calculer le montant basé sur les frais du service
        const amount = serviceData.fees || 0;

        slot.isBooked = true;
        slot.bookedBy = userId;
        slot.amount = amount;
        slot.bookingData = {
            userData: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                image: userData.image
            },
            serviceData: {
                name: serviceData.name,
                email: serviceData.email,
                speciality: serviceData.speciality,
                image: serviceData.image
            },
            bookedAt: new Date()
        };

        await slot.save();

        res.json({ success: true, message: "Créneau réservé avec succès" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Annuler une réservation
const cancelSlotBooking = async (req, res) => {
    try {
        const userId = req.userId;
        const { slotId } = req.body;

        const slot = await calendarSlotModel.findById(slotId);
        if (!slot) {
            return res.json({ success: false, message: "Créneau non trouvé" });
        }

        if (slot.bookedBy !== userId) {
            return res.json({ success: false, message: "Non autorisé" });
        }

        slot.cancelled = true;
        await slot.save();

        res.json({ success: true, message: "Réservation annulée" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Récupérer les réservations de l'utilisateur
const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;
        
        const bookings = await calendarSlotModel.find({ 
            bookedBy: userId,
            isBooked: true 
        }).sort({ date: 1, startTime: 1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Compléter une réservation (côté service provider)
const completeSlotBooking = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { slotId } = req.body;

        const slot = await calendarSlotModel.findOne({ _id: slotId, serviceId });
        if (!slot) {
            return res.json({ success: false, message: "Créneau non trouvé" });
        }

        if (!slot.isBooked) {
            return res.json({ success: false, message: "Créneau non réservé" });
        }

        slot.isCompleted = true;
        await slot.save();

        res.json({ success: true, message: "Réservation marquée comme terminée" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Annuler une réservation (côté service provider)
const cancelSlotBookingByService = async (req, res) => {
    try {
        const serviceId = req.docId;
        const { slotId } = req.body;

        const slot = await calendarSlotModel.findOne({ _id: slotId, serviceId });
        if (!slot) {
            return res.json({ success: false, message: "Créneau non trouvé" });
        }

        slot.cancelled = true;
        await slot.save();

        res.json({ success: true, message: "Réservation annulée" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
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
};