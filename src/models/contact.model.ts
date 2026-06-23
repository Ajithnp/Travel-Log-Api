import mongoose, { model, Schema } from "mongoose";
import { IContact } from "types/entities/contact.entity";

const ContactSchema = new Schema<IContact>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    isGuest: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        required: true,
        default: 'pending'
    },
}, { timestamps: true });

const ContactModel = model<IContact>('Contact', ContactSchema);
export default ContactModel;