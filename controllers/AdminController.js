const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const adminController = {
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(422).json({ error: "Invalid email or passsword" });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        return res.status(422).json({ error: "Invalid email or password" });
      }

      //Generate token
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "100d" }
      );

      const adminProfile = {
        id: admin._id,
        email: admin.email,
      };

      res.json({ token, adminProfile });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  createEmployeeAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Email:", email);
      // Validate required fields
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
      const saltRounds = 10;
      // Generate hash for the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const employeeAdmin = new Admin({
        email,
        password: hashedPassword,
      });

      await employeeAdmin.save();

      res
        .status(201)
        .json({ message: "Employee Admin account created successfully." });
    } catch (error) {
      console.error("Error creating Employee admin:", error);
      return res.status(500).json({ error: error.message });
    }
  },
  getAllEmployeeAdmins: async (req, res) => {
    try {
      //Find all Employee Admins
      const employeeAdmins = await Admin.find();
      res.json(employeeAdmins);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  getSingleAdminDetails: async (req, res) => {
    try {
      const adminId = req.params.id;

      const adminProfile = await Admin.findById(adminId);

      if (!adminProfile) {
        return res.status(404).json({ error: "Admin Profile not found" });
      }
      res.json(adminProfile);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  deleteEmployeeAdmin: async (req, res) => {
    try {
      const EmployeeAdminId = req.params.id;
      await Admin.findByIdAndDelete(EmployeeAdminId);
      res.json({ message: "Employee Admin account deleted Successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please try again" });
    }
  },

  getSingleUserDetails: async (req, res) => {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  updateEmployeeAdminDetails: async (req, res) => {
    try {
      const { password, email } = req.body;
      const EmployeeAdminId = req.params.id;

      let employeeAdmin = await Admin.findById(EmployeeAdminId);

      if (!employeeAdmin) {
        return res.status(404).json({ error: "Employee Admin not found" });
      }

      let imageUrl = null;

      //Check if a file was uploaded
      if (req.file) {
        try {
          //Upload employee photo to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "employee_photos",
          });
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Error uploading image to CLoudinary:", uploadError);
          return res
            .status(500)
            .json({ error: "Error uploading to Cloudinary" });
        }
      }
      if (password) {
        employeeAdmin.password = await bcrypt.hash(password, 10);
      }

      //Save the updated Employee Admin account
      employeeAdmin = await employeeAdmin.save();
      res.json({ message: "Employee Admin details updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
module.exports = adminController;
