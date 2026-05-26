const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { message } = require("../library/helper");

// register admin users
const register = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password || role == undefined) {
            return res.send(message.general_error("all fields required"));
        }


        const adminExists = await AdminModel.findOne({ email });

        if (adminExists) {
            return res.send(message.general_error("admin already exists"));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await AdminModel.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        return res.send(message.general_success("registered successfully"));

    } catch (error) {
        console.log(error);
        return res.send(message.catch_error);

    }
};




// login admin
const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.send(message.general_error("email and password are required to login"));
        }

        const admin = await AdminModel.findOne({ email });

        if (!admin) {
            return res.send(message.general_error("admin not found"));
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.send(message.general_error("password incorrect"));
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.send({
            flag: 1,
            msg: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        return res.send(message.catch_error);
    }
};

// getting all admins
const getAllAdmins = async (req, res) => {
    try {
        
        if (req.admin.role !== 0) {
            return res.send({ flag: 0, msg: "Access denied" });
        }

        const admins = await AdminModel.find().select("-password").sort({ createdAt: -1 });

        return res.send(
            {
                flag: 1,
                admins
            }
        )
    } catch (error) {
        return res.send({ flag: 0, msg: "Error fetching admins" });
    }
}
// updating admin status
const updateAdminStatus = async (req, res) => {
    try {
        // console.log("api hitting");
        const { id } = req.params;
        if (req.admin.role !== 0) {
            return res.send({ flag: 0, msg: "Access denied" });
        }

        const admin = await AdminModel.findById(id);
        if (!admin) {
            return res.send({ flag: 0, msg: "admin not found" });
        }
        if (admin.role==0) {
            return res.send({
                flag:0,
                msg:"super admin can not be inactive"
            });
        }
        console.log(admin.status);

        admin.status = !admin.status;
        await admin.save();

        return res.send(
            {
                flag: 1,
                msg: "status updated",
                status: admin.status,
            }
        )
    } catch (error) {
        return res.send({ flag: 0, msg: "Error updating status" });
    }
}

// get single admin
const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const admin = await AdminModel.findById(id).select("-password");

        if (!admin) {
            return res.send({ flag: 0, msg: "Admin not found" });
        }
        return res.send({
            flag: 1,
            admin
        })
    } catch (error) {
        return res.send({ flag: 0, msg: "Error fetching admin" });
    }
}

// updating admin
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, status } = req.body;
        const admin = await AdminModel.findById(id);

        if (!admin) {
            return res.send({ flag: 0, msg: "Admin not found" });
        }

        admin.name = name ?? admin.name;
        admin.role = role ?? admin.role;
        admin.status = status ?? admin.status;

        await admin.save();

        return res.send({
            flag: 1,
            msg: "Admin updated successfully"
        });
    } catch (error) {
        return res.send({ flag: 0, msg: "Server error" });
    }
}

// getting admin profile bt req.admin
const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.admin._id).select("-password");
        return res.send({
            flag: 1,
            admin
        });
    } catch (error) {
        return res.send({ flag: 0, msg: "Error fetching profile" });
    }
}
// changing password
const changePassword = async (req, res) => {
    try {
        console.log("hitting");
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.send({ flag: 0, msg: "All fields required" });
        }

        const admin = await AdminModel.findById(req.admin._id);
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.send({ flag: 0, msg: "Old password is incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        admin.password = hashed;
        await admin.save();
        return res.send({
            flag: 1,
            msg: "password updated successfully"
        });


    } catch (error) {

        return res.send({ flag: 0, msg: "Server error" });

    }
}




module.exports = { register, login,getAdminById,getAdminProfile,getAllAdmins,updateAdmin,updateAdminStatus,changePassword };
