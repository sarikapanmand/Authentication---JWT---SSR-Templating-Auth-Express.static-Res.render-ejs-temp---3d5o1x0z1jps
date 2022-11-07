const router = require("express").Router();
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyAuthToken, verifyRefreshToken } = require("./verifyToken");
const { registerValidation, loginValidation } = require("./validation");

// Your code goes here

//Register
router.post("/register", async (req, res) => {
  // your code goes
  const data = req.body;
  const error = registerValidation(data).error;
  if (error) {
    res.status(400).send({ message: error.details[0].message });
  } else {
    User.find({ email: req.body.email }).then((data) => {
      if (data.length > 0) {
        res.status(400).send({ message: "Email already exists" });
      } else {
        const user = new User({
          ...req.body,
          password: bcrypt.hashSync(req.body.password, 8),
        });
        user.save().then((data) => res.send({ user: data._id }));
      }
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  // your code goes
  const data = req.body;
  const error = loginValidation(data).error;
  if (error) {
    res.status(400).send({ message: error.details[0].message });
  } else {
    User.find({ email: data.email })
      .then((result) => {
        if (result.length === 0) {
          res.status(400).send({ message: "Email not found" });
        } else {
          const user = result[0];
          const flag = bcrypt.compareSync(data.password, user.password);
          if (flag) {
            const authToken = jwt.sign(
              { id: user._id },
              process.env.TOKEN_SECRET,
              { expiresIn: "24h" }
            );
            const refreshToken = jwt.sign(
              { id: user._id },
              process.env.REFRESH_TOKEN_SECRET
            );

            const refreshTokenData = RefreshToken({
              token: refreshToken,
            });
            refreshTokenData.save().then((result) => {
              res.set({
                "auth-token": authToken,
                "refresh-token": result.token,
                "refresh-token-id": result._id,
              });
              res.send({
                "auth-token": authToken,
                "refresh-token": result.token,
                "refresh-token-id": result._id,
              });
            });
          } else {
            res.status(400).send({ message: "password is wrong" });
          }
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
});

// generate New Auth-Token
router.get("/newAuthToken", verifyRefreshToken, async (req, res) => {
  const refreshToken = req.header("refresh-token");
  try {
    const verifyres = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const authToken = jwt.sign({ id: verifyres.id }, process.env.TOKEN_SECRET, {
      expiresIn: 24 * 60 * 60 + 10,
    });

    res.set({
      "auth-token": authToken,
      "refresh-token": req.header("refresh-token"),
    });
    res.send({
      "auth-token": authToken,
      "refresh-token": req.header("refresh-token"),
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// logout
router.delete("/logout", verifyRefreshToken, async (req, res) => {
  // your code goes
  const refreshToken = req.header("refresh-token");
  try {
    const verifyres = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const readData = await RefreshToken.findOne({ token: refreshToken });
    console.log(readData);
    const deleteData = await RefreshToken.deleteOne({ token: refreshToken });

    res.send({
      token_id: readData._id,
      message: "Successfully logged out",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// get user details
router.get("/me", verifyAuthToken, async (req, res) => {
  // your code goes
  const authToken = req.header("auth-token");
  try {
    const verifyres = jwt.verify(authToken, process.env.TOKEN_SECRET);

    try {
      const userData = await User.findOne({ _id: verifyres.id });
      if (userData) res.send(userData);
      else {
        res.status(429).json({ message: "Access Denied" });
      }
    } catch (error) {
      res.sendStatus(500);
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
