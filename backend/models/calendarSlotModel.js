import mongoose from "mongoose";

const calendarSlotSchema = new mongoose.Schema({
    serviceId: { type: String, required: true }, // ID du service provider
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    startTime: { type: String, required: true }, // Format: "HH:MM"
    endTime: { type: String, required: true }, // Format: "HH:MM"
    duration: { type: Number, required: true }, // Durée en minutes (30, 60, etc.)
    isActive: { type: Boolean, default: true }, // Créneau activé/désactivé
    isBooked: { type: Boolean, default: false }, // Créneau réservé ou non
    bookedBy: { type: String, default: null }, // ID de l'utilisateur qui a réservé
    bookingData: { type: Object, default: null }, // Données de la réservation
    amount: { type: Number, default: 0 }, // Montant à payer
    payment: { type: Boolean, default: false }, // Statut du paiement
    cancelled: { type: Boolean, default: false }, // Réservation annulée
    isCompleted: { type: Boolean, default: false }, // Réservation terminée
    createdAt: { type: Date, default: Date.now }
}, { minimize: false });

// Index pour optimiser les requêtes
calendarSlotSchema.index({ serviceId: 1, date: 1, startTime: 1 });

const calendarSlotModel = mongoose.models.calendarSlot || mongoose.model('calendarSlot', calendarSlotSchema);

export default calendarSlotModel;