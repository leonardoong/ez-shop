const express = require("express");

const { Category } = require("../models/category");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(500).json({ success: false, message: "Category not found" });
  }
  res.status(200).send(category);
});

router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
    image: req.body.image,
  });
  category = await category.save();

  if (!category) return res.status(500).send("Category cannot be created!");

  res.send(category);
});

router.delete(`/:id`, (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "Category Deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Failed to delete category" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ success: false, error: err });
    });
});

router.put(`/:id`, (req, res) => {
  Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
      image: req.body.image,
    },
    {
      new: true,
    }
  )
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: "Category Updated",
          category: category,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Failed to update category" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
