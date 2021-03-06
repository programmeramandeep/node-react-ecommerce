const Category = require("../models/category");
const Product = require("../models/product");
const SubCategory = require("../models/sub-category");
const slugify = require("slugify");

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await new Category({
            name,
            slug: slugify(name),
        }).save();

        res.json(category);
    } catch (error) {
        res.status(400).send("Create category failed");
    }
};

exports.list = async (req, res) => {
    res.json(await Category.find({}).sort({ createdAt: -1 }).exec());
};

exports.read = async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug }).exec();

    const products = await Product.find({ category })
        .populate("category")
        .exec();

    res.json({ category, products });
};

exports.update = async (req, res) => {
    const { name } = req.body;
    try {
        const updated = await Category.findOneAndUpdate(
            { slug: req.params.slug },
            { name, slug: slugify(name) },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(400).send("Category updated failed");
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await Category.findOneAndDelete({
            slug: req.params.slug,
        });
        res.json(deleted);
    } catch (error) {
        res.status(400).send("Category delete failed");
    }
};

exports.getSubCategories = async (req, res) => {
    SubCategory.find({ parent: req.params._id }).exec((err, subs) => {
        if (err) {
            console.error(err);
        }
        res.json(subs);
    });
};
