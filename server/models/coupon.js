const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            uppercase: true,
            required: "Name is required",
            minlength: [6, "Too short"],
            maxlength: [12, "Too long"],
        },
        expiry: {
            type: Date,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
