const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["stock", "mf", "gold", "fd", "rd", "crypto", "other"],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    purchaseValue: {
        type: Number,
        required: true,
        min: 0
    },
    currentValue: {
        type: Number,
        required: true,
        min: 0
    },
    purchaseDate: {
        type: Date,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("Holding", holdingSchema);