const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            text: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
            text: true,
        },
        price: {
            type: Number,
            required: true,
            trim: true,
            maxlength: 32,
        },
        category: {
            type: ObjectId,
            ref: "Category",
        },
        sub_categories: [
            {
                type: ObjectId,
                ref: "SubCategory",
            },
        ],
        quantity: {
            type: Number,
        },
        sold: {
            type: Number,
            default: 0,
        },
        // images: {
        //     type: Array,
        // },
        shipping: {
            type: String,
            enum: ["Yes", "No"],
        },
        color: {
            type: String,
            enum: ["Black", "Brown", "Silver", "White", "Blue"],
        },
        brand: {
            type: String,
            enum: ["Microsoft", "Apple", "Dell", "Lenovo", "Asus"],
        },
        // ratings: [
        //     {
        //         star: Number,
        //         postedBy: { type: ObjectId, ref: "User" },
        //     },
        // ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);