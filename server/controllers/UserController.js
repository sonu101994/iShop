const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { message } = require("../library/helper");

// user registration function

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // validation
        if (!name || !email || !password) {
            return res.send(message.general_error("all fields required"));
        }

        // check existing user
        const exists = await UserModel.findOne({ email });
        if (exists) {
            return res.send(message.general_error("email already exists"));
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await UserModel.create(
            {
                name,
                email,
                phone,
                password: hashedPassword,
            }
        );

        // generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.send(
            {
                flag: 1,
                msg: "registered successfully",
                token,
                user: {
                    ...user.toJSON(),
                    password: "",
                }
            }
        )
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
}

// login function

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.send(message.general_error("email and password are required"));
        }
        // find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.send(message.general_error("user not exist"));
        }

        // blocked user
        if (!user.status) {
            return res.send(message.general_error("account blocked"));
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.send(message.general_error("password is incorrect"));
        }

        // token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );
        return res.send({
            flag: 1,
            msg: "login successful",
            token,
            user: {
                ...user.toJSON(),
                password: "",
            },
        });

    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
}

module.exports = { registerUser, loginUser };