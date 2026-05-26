const unstable_cacheTagserModel = require("../models/UserModel");
const { message } = require("../library/helper");
const UserModel = require("../models/UserModel");

// get users
const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find().sort({ createdAt: -1 });

        res.send(
            { flag: 1, users, }
        )
    } catch (error) {
        console.log(error)
        res.send(message.catch_error);

    }
}

// delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.findByIdAndDelete(id);
        res.send(message.delete_msg("user"));
    } catch (error) {
        res.send(message.catch_error);
    }
};

// toggle user (block/unblock)

const toggleUser = async (req, res) => {
    try {
        console.log("api hit");
        const { id } = req.params;
        console.log(id);
        const user = await UserModel.findById(id);
        console.log(user);
        if (!user) {
            res.send(message.general_error("user not found"));
        }
        user.status = !user.status;
        await user.save();
        res.send(message.general_success("user status updated"));
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
}

module.exports = { getUsers, deleteUser, toggleUser };