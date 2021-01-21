const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const e = require("express");

const router = express.Router();

router.get(`/`, async (req, res) => {
  let userList = await User.find().select("-passwordHash");

  if (!userList) return res.status(400).send("User not found");

  res.send(userList);
});

router.get("/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({ userCount: userCount });
});

router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(500).json({ success: false, message: "User not found" });
  }
  res.status(200).send(user);
});

router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    isAdmin: req.body.isAdmin,
  });
  user = await user.save();

  if (!user) return res.status(500).send("User cannot be created!");

  res.send(user);
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.PRIVATE_KEY;
  if (!user) {
    return res.status(400).send("User Not Found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );
    res
      .status(200)
      .send({ user: user.email, token: token, message: "User Authenticated" });
  } else {
    return res.status(400).send("Wrong Password");
  }
});

router.post(`/register`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.PRIVATE_KEY;
  if (!user) {
    return res.status(400).send("User Not Found");
  }
  console.log(user.isAdmin);
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );
    res
      .status(200)
      .send({ user: user.email, token: token, message: "User Authenticated" });
  } else {
    return res.status(400).send("Wrong Password");
  }
});

router.delete(`/:id`, (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User Deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Failed to delete user" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
