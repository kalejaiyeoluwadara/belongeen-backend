const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const adminController = require("../controllers/AdminController");

//Public Routes
router.post("/sign-in", adminController.signIn);

//Private routes
router.post(
  "/create-admin",

  adminController.createEmployeeAdmin
);
router.get("/get-admins", adminController.getAllEmployeeAdmins);
router.get("/:id", adminController.getSingleAdminDetails);
router.delete("/:id", adminController.deleteEmployeeAdmin);
router.put(
  "/:id",
  upload.single("admin-image"),
  adminController.updateEmployeeAdminDetails
);

//Extended Routes(private)

router.get("/all-users/:id", adminController.getSingleUserDetails);

module.exports = router;
