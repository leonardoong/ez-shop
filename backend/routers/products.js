const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const { Product } = require("../models/product");
const { Category } = require("../models/category");

const router = express.Router();
mongoose.set("useFindAndModify", false);

const FILE_EXT_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isFileValid = FILE_EXT_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image Type");
    if (isFileValid) {
      uploadError = null;
    }
    cb(uploadError, "public/upload");
  },
  filename: function (req, file, cb) {
    const extensions = FILE_EXT_MAP[file.mimetype];
    const fileName = file.originalname.replace(" ", "-");
    cb(null, `${fileName}-${Date.now()}.${extensions}`);
  },
});

const upload = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  // const productList = await Product.find().select('name image -_id');

  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({ success: false });
  } else {
    res.send(productList);
  }
});

router.get("/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({ productCount: productCount });
});

router.get("/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ success: false });
  } else {
    res.send(product);
  }
});

router.post(`/`, upload.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");

  const file = req.file;
  if (!file) return res.status(400).send("No image uploaded");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  let newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  newProduct = await newProduct.save();

  if (!newProduct) return res.status(500).send("Product cannot be created");

  res.send(newProduct);
});

router.delete(`/:id`, (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Product Deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Failed to delete product" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ success: false, error: err });
    });
});

router.put(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");

  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );
  if (!product) return res.status(500).send("Product cannot be updated");
  res.send(product);
});

router.put(
  `/gallery-images/:productId`,
  upload.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      res.status(400).send("Invalid Product Id");
    }
    let imagesPath = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

    const files = req.files;
    if (files) {
      files.map((file) => {
        imagesPath.push(`${basePath}${file.filename}`);
      });
    }
    console.log("images : ", imagesPath);
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        images: imagesPath,
      },
      {
        new: true,
      }
    );

    if (!product) return res.status(500).send("Gallery Product cannot be updated");
    res.send(product);
  }
);

module.exports = router;
