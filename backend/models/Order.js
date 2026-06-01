const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        notes: { type: String }
    },
    items: [
        {
            id: { type: String },
            name: { type: String },
            priceDH: { type: Number },
            priceEUR: { type: Number },
            selectedSize: { type: String }
        }
    ],
    totalDH: { type: Number, required: true },
    totalEUR: { type: Number, required: true },
    status: {
        type: String,
        enum: ['En attente', 'Confirmée', 'Expédiée', 'Livrée'],
        default: 'En attente'
    },
    date: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
