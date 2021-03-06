const Product = require("../models/product");
const User = require("../models/user");
const slugify = require("slugify");

exports.create = async (req, res) => {
    try {
        req.body.slug = slugify(req.body.title);
        const product = await new Product(req.body).save();

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error:
                error.name === "MongoError" && error.code === 11000
                    ? "Product already exists !"
                    : "Create product failed !",
        });
    }
};

exports.listAll = async (req, res) => {
    res.json(
        await Product.find({})
            .limit(parseInt(req.params.count))
            .populate("category")
            .populate("sub_categories")
            .sort([["createdAt", "desc"]])
            .exec()
    );
};

exports.list = async (req, res) => {
    try {
        const { sort, order, page } = req.body;
        const currentPage = page || 1;
        const perPage = 4;

        const products = await Product.find({})
            .skip((currentPage - 1) * perPage)
            .populate("category")
            .populate("sub_categories")
            .sort([[sort, order]])
            .limit(perPage)
            .exec();

        res.json(products);
    } catch (error) {
        console.error(error);
    }
};

exports.read = async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate("category")
        .populate("sub_categories")
        .exec();
    res.json(product);
};

exports.update = async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            { new: true }
        ).exec();
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error:
                error.name === "MongoError" && error.code === 11000
                    ? "Product already exists !"
                    : "Create product failed !",
        });
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await Product.findOneAndRemove({
            slug: req.params.slug,
        }).exec();
        res.json(deleted);
    } catch (error) {
        res.status(400).send("Product delete failed");
    }
};

exports.productsCount = async (req, res) => {
    let total = await Product.find({}).estimatedDocumentCount().exec();

    res.json(total);
};

exports.productStar = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findOne({ email: req.user.email }).exec();
    const { star } = req.body;

    // Check if currently logged in user  have already added rating tho this product
    let existingRatingObject = product.ratings.find(
        (element) => element.postedBy.toString() === user._id.toString()
    );

    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id,
            {
                $push: {
                    ratings: {
                        star,
                        postedBy: user._id,
                    },
                },
            },
            { new: true }
        ).exec();

        res.json(ratingAdded);
    } else {
        // if user have already left rating, update it
        const ratingUpdated = await Product.updateOne(
            {
                ratings: { $elemMatch: existingRatingObject },
            },
            {
                $set: { "ratings.$.star": star },
            },
            { new: true }
        ).exec();

        res.json(ratingUpdated);
    }
};

// related products
exports.listRelated = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();

    const related = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
    })
        .limit(4)
        .populate("category")
        .populate("sub_categories")
        .populate("postedBy")
        .exec();

    res.json(related);
};

// search / filter products
const handleQuery = async (req, res, query) => {
    const products = await Product.find({ $text: { $search: query } })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec();

    res.json(products);
};

const handlePrice = async (req, res, price) => {
    try {
        let products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1],
            },
        })
            .populate("category", "_id name")
            .populate("subs", "_id name")
            .populate("postedBy", "_id name")
            .exec();

        res.json(products);
    } catch (error) {
        console.log(error);
    }
};

const handleCategory = async (req, res, category) => {
    try {
        let products = await Product.find({ category })
            .populate("category", "_id name")
            .populate("subs", "_id name")
            .populate("postedBy", "_id name")
            .exec();

        res.json(products);
    } catch (error) {
        console.lof(error);
    }
};

const handleStar = (req, res, stars) => {
    Product.aggregate([
        {
            $project: {
                document: "$$ROOT",
                floorAverage: {
                    $floor: { $avg: "$ratings.star" },
                },
            },
        },
        { $match: { floorAverage: stars } },
    ])
        .limit(12)
        .exec((err, aggregates) => {
            if (err) console.log("Aggregate error", err);

            Product.find({ _id: aggregates })
                .populate("category", "_id name")
                .populate("subs", "_id name")
                .populate("postedBy", "_id name")
                .exec((err, products) => {
                    if (err) console.log("Product aggregate error", err);
                    res.json(products);
                });
        });
};

const handleSub = async (req, res, sub) => {
    const products = await Product.find({ sub_categories: sub })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec();

    res.json(products);
};

const handleColor = async (req, res, color) => {
    const products = await Product.find({ color })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec();

    res.json(products);
};

const handleBrand = async (req, res, brand) => {
    const products = await Product.find({ brand })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec();

    res.json(products);
};

const handleShipping = async (req, res, shipping) => {
    const products = await Product.find({ shipping })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec();

    res.json(products);
};

exports.searchFilters = async (req, res) => {
    const {
        brand,
        category,
        color,
        price,
        query,
        shipping,
        stars,
        sub,
    } = req.body;

    if (query) {
        console.log("query", query);
        await handleQuery(req, res, query);
    }

    if (price !== undefined) {
        await handlePrice(req, res, price);
    }

    if (category) {
        await handleCategory(req, res, category);
    }

    if (stars) {
        await handleStar(req, res, stars);
    }

    if (sub) {
        await handleSub(req, res, sub);
    }

    if (color) {
        await handleColor(res, res, color);
    }

    if (brand) {
        await handleBrand(res, res, brand);
    }

    if (shipping) {
        await handleShipping(res, res, shipping);
    }
};
