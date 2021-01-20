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
      },
      secret,{
          expiresIn: "1d"
      }
    );
    res
      .status(200)
      .send({ user: user.email, token: token, message: "User Authenticated" });
  } else {
    return res.status(400).send("Wrong Password");
  }
});

module.exports = router;
