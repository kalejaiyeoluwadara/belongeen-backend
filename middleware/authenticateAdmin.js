const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const authenticateAdmin = async (req, res, next) => {
  //Extract the authorization header from the request
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("Authorization header is missing");
    return res.status(401).json({ error: "Authorization header missing" });
  }

  //Extract the token from the authorization header
  const token = authHeader.split(" ")[1];

  try {
    //Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded token:", decodedToken);

    //Find the admin by ID stored in the token
    const admin = await Admin.findById(decodedToken.id);

    if (!admin) {
      console.log("Not Authorized");
      return res.status(401).json({ error: "Admin not found" });
    }

    // if(admin.role !== 'Super Admin' || 'Employee Admin'){
    //     console.log('User is not an admin')
    //     return res.status(403).json({error: 'Not Authorized.'})
    // }

    //Attach the admin to the request object
    req.admin = admin;

    //Call the next middleware
    next();
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({ error: error.message });
  }
};
module.exports = authenticateAdmin;
