
import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['learning_log', 'code_snippet', 'docs_update', 'backend_util'],
        required: true
    },
    title: String,
    hash: String, // To check for content uniqueness
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Log = mongoose.model('Log', LogSchema);
