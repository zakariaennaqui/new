import mongoose from "mongoose";

const calendarConfigSchema = new mongoose.Schema({
    serviceId: { type: String, required: true, unique: true },
    defaultDuration: { type: Number, default: 60 }, // Durée par défaut en minutes
    workingDays: { 
        type: [Number], 
        default: [1, 2, 3, 4, 5] // Lundi à Vendredi (0 = Dimanche, 1 = Lundi, etc.)
    },
    workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" }
    },
    breakTimes: [{
        start: String,
        end: String,
        name: String
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const calendarConfigModel = mongoose.models.calendarConfig || mongoose.model('calendarConfig', calendarConfigSchema);

export default calendarConfigModel;