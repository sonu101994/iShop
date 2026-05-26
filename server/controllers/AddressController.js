const AddressModel = require("../models/AddressModel");
const { message } = require("../library/helper");

const getAddressList = async (user_id) => AddressModel.find({ user_id }).sort({ is_default: -1, createdAt: -1 });

const ensureOneDefault = async (user_id) => {
    const count = await AddressModel.countDocuments({ user_id });
    if (!count) return;

    const defaultExists = await AddressModel.exists({ user_id, is_default: true });
    if (!defaultExists) {
        const latest = await AddressModel.findOne({ user_id }).sort({ createdAt: -1 });
        if (latest) {
            latest.is_default = true;
            await latest.save();
        }
    }
};

// add address
const addAddress = async (req, res) => {
    try {
        const data = req.body;
        const user_id = req.user._id;
        const hasAnyAddress = await AddressModel.exists({ user_id });
        const shouldBeDefault = Boolean(data.is_default) || !hasAnyAddress;

        if (shouldBeDefault) {
            await AddressModel.updateMany({ user_id }, { is_default: false });
        }

        const address = await AddressModel.create({
            user_id,
            name: data.name,
            mobile: data.mobile,
            pincode: data.pincode,
            address: data.address,
            locality: data.locality,
            city: data.city,
            state: data.state,
            landmark: data.landmark || "",
            address_type: data.address_type || "home",
            is_default: shouldBeDefault,
        });

        const addresses = await getAddressList(user_id);
        res.send({
            flag: 1,
            msg: "address added successfully",
            address,
            addresses,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// get address
const getAddresses = async (req, res) => {
    try {
        const user_id = req.user._id;
        await ensureOneDefault(user_id);
        const addresses = await getAddressList(user_id);
        res.send({
            flag: 1,
            addresses,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// update address
const updateAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        const data = req.body;
        const user_id = req.user._id;

        const address = await AddressModel.findOne({ _id: address_id, user_id });

        if (!address) {
            return res.send(message.general_error("address not found"));
        }

        if (data.is_default) {
            await AddressModel.updateMany({ user_id }, { is_default: false });
        }

        const allowedFields = ["name", "mobile", "pincode", "address", "locality", "city", "state", "landmark", "address_type", "is_default"];
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) address[field] = data[field];
        });
        await address.save();
        await ensureOneDefault(user_id);

        const addresses = await getAddressList(user_id);
        res.send({
            flag: 1,
            msg: "address updated",
            address,
            addresses,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

// delete address
const deleteAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        const user_id = req.user._id;

        await AddressModel.findOneAndDelete({ _id: address_id, user_id });
        await ensureOneDefault(user_id);
        const addresses = await getAddressList(user_id);

        res.send({
            flag: 1,
            msg: "address deleted successfully",
            addresses,
        });
    } catch (error) {
        console.log(error);
        res.send(message.catch_error);
    }
};

module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
};
