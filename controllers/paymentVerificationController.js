// controllers/paystackController.js

const https = require("https");
const Order = require("../models/Order");

const paystackController = {
  verifyPayment: async (req, res) => {
    try {
      const { reference } = req.body;

      if (!reference) {
        return res.status(400).json({ error: "Payment reference is required" });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY_LIVE;

      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      };

      const paystackRequest = https.request(options, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", async () => {
          try {
            const responseData = JSON.parse(data);

            if (responseData.status && responseData.data.status === "success") {
              // Find the order by reference and update it
              // const orderId = responseData.data.metadata.order_id;

              // if (orderId) {
              //   const order = await Order.findOne({ orderId });

              //   if (order) {
              //     order.paymentStatus = "Paid";
              //     order.paymentReference = reference;
              //     order.paymentDate = new Date();
              //     await order.save();
              //   }
              // }

              // Return success response
              res.status(200).json({
                status: "success",
                message: "Payment verified successfully",
                data: responseData.data,
              });
            } else {
              // Transaction failed
              res.status(400).json({
                status: "failed",
                message: "Payment verification failed",
              });
            }
          } catch (error) {
            console.error("Error parsing response:", error);
            res.status(500).json({
              status: "error",
              message: "Error processing payment verification",
            });
          }
        });
      });

      paystackRequest.on("error", (error) => {
        console.error("Error verifying payment:", error);
        res.status(500).json({
          status: "error",
          message: error.message,
        });
      });

      paystackRequest.end();
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({
        status: "error",
        message: "An unexpected error occurred",
      });
    }
  },

  // initializePayment: async (req, res) => {
  //   try {
  //     const { email, amount, orderId, metadata } = req.body;

  //     if (!email || !amount || !orderId) {
  //       return res.status(400).json({
  //         error: "Email, amount, and orderId are required",
  //       });
  //     }

  //     const secretKey = process.env.PAYSTACK_SECRET_KEY;

  //     // Create payload
  //     const params = JSON.stringify({
  //       email,
  //       amount: amount * 100, // Convert to lowest currency unit
  //       metadata: {
  //         order_id: orderId,
  //         ...metadata,
  //       },
  //       callback_url: process.env.PAYSTACK_CALLBACK_URL,
  //     });

  //     const options = {
  //       hostname: "api.paystack.co",
  //       port: 443,
  //       path: "/transaction/initialize",
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${secretKey}`,
  //         "Content-Type": "application/json",
  //         "Content-Length": params.length,
  //       },
  //     };

  //     const paystackRequest = https.request(options, (response) => {
  //       let data = "";

  //       response.on("data", (chunk) => {
  //         data += chunk;
  //       });

  //       response.on("end", () => {
  //         const responseData = JSON.parse(data);

  //         if (responseData.status) {
  //           res.status(200).json({
  //             status: "success",
  //             message: "Payment initialized",
  //             data: responseData.data,
  //           });
  //         } else {
  //           res.status(400).json({
  //             status: "failed",
  //             message: responseData.message,
  //           });
  //         }
  //       });
  //     });

  //     paystackRequest.on("error", (error) => {
  //       console.error("Error initializing payment:", error);
  //       res.status(500).json({
  //         status: "error",
  //         message: error.message,
  //       });
  //     });

  //     paystackRequest.write(params);
  //     paystackRequest.end();
  //   } catch (error) {
  //     console.error("Unexpected error:", error);
  //     res.status(500).json({
  //       status: "error",
  //       message: "An unexpected error occurred",
  //     });
  //   }
  // },
};

module.exports = paystackController;
