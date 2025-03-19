require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send order confirmation email to admin
 * @param {Object} orderData - Order details
 * @param {String} adminEmail - Admin's email address
 */
const sendOrderAdminEmail = async (orderData, adminEmail) => {
  try {
    // Filter out invalid products and format order items
    const orderItemsHtml = orderData.orderItems
      .filter((item) => item.product) // Remove items with null products
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            item.product?.productTitle || "Unnamed Product"
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            item.qty
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${(
            item.product?.price * item.qty
          ).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    // Format condiments safely
    const condimentsHtml = orderData.orderItems.some(
      (item) => item.condiments && item.condiments.length > 0
    )
      ? `<h3 style="margin-top: 15px; color: #333;">Condiments/Add-ons:</h3>
         <ul style="padding-left: 20px; color: #555;">
         ${orderData.orderItems
           .flatMap(
             (item) =>
               item.condiments?.map(
                 (c) =>
                   `<li>${c.productTitle || "Unknown Condiment"} - ₦${
                     c.price?.toLocaleString() || "0"
                   }</li>`
               ) || []
           )
           .join("")}
         </ul>`
      : "";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Order Received (#${orderData.orderId})`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
      </head>
      <body style="background-color: #f4f4f4; padding: 20px;">
          <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 20px;">
              <tr>
                  <td align="left">
                      <img src="https://res.cloudinary.com/diccn7l1x/image/upload/v1731786393/belongeen_ico_mlm7gf.png"
                alt="Belongeen Logo" style="width: 60px; height:60px;margin-bottom: 20px;">
                  </td>
              </tr>
              <tr>
                  <td align="left">
                      <h2 style="color: #333; margin: 0;">New Order Received!</h2>
                  </td>
              </tr>
              <tr>
                  <td align="left" style="color: #555; font-size: 16px;">
                      <p>A new order has been placed. Here are the details:</p>
                  </td>
              </tr>
              <tr>
                  <td align="left" style="padding: 20px 0;">
                      <table width="100%" cellspacing="0" cellpadding="5" style="border-collapse: collapse; margin-bottom: 15px;">
                          <tr>
                              <td style="font-weight: bold; color: #555; width: 40%;">Order ID:</td>
                              <td style="color: #333;">${orderData.orderId}</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Customer:</td>
                              <td style="color: #333;">${
                                orderData.user.fullName
                              }</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Hall:</td>
                              <td style="color: #333;">${
                                orderData.user.hall
                              }</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Phone:</td>
                              <td style="color: #333;">${
                                orderData.user.phone_number
                              }</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Date:</td>
                              <td style="color: #333;">${new Date(
                                orderData.date
                              ).toLocaleString()}</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Total Amount:</td>
                              <td style="font-weight: bold; color: #1a8754;">₦${parseFloat(
                                orderData.orderPrice
                              ).toLocaleString()}</td>
                          </tr>
                      </table>
                      
                      <h3 style="color: #333; margin-bottom: 10px;">Order Items:</h3>
                      <table width="100%" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
                          <tr style="background-color: #f8f9fa;">
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Quantity</th>
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                          </tr>
                          ${
                            orderItemsHtml ||
                            '<tr><td colspan="3" style="padding: 8px; text-align: center;">No valid products in this order</td></tr>'
                          }
                      </table>
                      
                      ${condimentsHtml}
                  </td>
              </tr>
              <tr>
                  <td align="center" style="color: #555; font-size: 14px; padding-top: 20px; border-top: 1px solid #ddd;">
                      <p>This order requires your attention. Please process it as soon as possible.</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending admin email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email to customer
 * @param {Object} orderData - Order details
 */
const sendOrderCustomerEmail = async (orderData) => {
  try {
    // Format order items for display
    const orderItemsHtml = orderData.orderItems
      .map((item) => {
        const productName = item.product?.productTitle || "Unknown Product";
        const productPrice = item.product?.price || 0;

        return `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${(
        productPrice * item.qty
      ).toLocaleString()}</td>
    </tr>
  `;
      })
      .join("");

    // Format condiments if available
    const condimentsHtml = orderData.orderItems.some(
      (item) => item.condiments?.length > 0
    )
      ? `<h3 style="margin-top: 15px; color: #333;">Your Add-ons:</h3>
     <ul style="padding-left: 20px; color: #555;">
     ${orderData.orderItems
       .flatMap(
         (item) =>
           item.condiments?.map(
             (c) =>
               `<li>${c?.productTitle || "Unknown"} - ₦${
                 c?.price?.toLocaleString() || 0
               }</li>`
           ) || []
       )
       .join("")}
     </ul>`
      : "";

    // Calculate delivery fee and subtotal (assuming 1000 naira delivery fee)
    const deliveryFee = 1000;
    const subtotal = parseFloat(orderData.orderPrice) - deliveryFee;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.user.email,
      subject: `Order Confirmation - Belongeen #${orderData.orderId}`,
      html: `
      <!DOCTYPE html>
      <html lang="en" style="padding: 0; margin: 0; box-sizing: border-box; font-family: 'Nunito', 'Segoe UI', 'Arial Rounded MT', 'Open Sans', 'Helvetica', 'Arial', sans-serif;">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
      </head>
      <body style="background-color: #f4f4f4; padding: 20px;">
          <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 20px;">
              <tr>
                  <td align="left">
                      <img src="https://res.cloudinary.com/diccn7l1x/image/upload/v1731786393/belongeen_ico_mlm7gf.png"
                alt="Belongeen Logo" style="width: 60px; height:60px;margin-bottom: 20px;">
                  </td>
              </tr>
              <tr>
                  <td align="left">
                      <h2 style="color: #333; margin: 0;">Thank You for Your Order!</h2>
                  </td>
              </tr>
              <tr>
                  <td align="left" style="color: #555; font-size: 16px;">
                      <p>Hello ${orderData.user.fullName},</p>
                      <p>Your order has been received and is being processed. Here's a summary of your purchase:</p>
                  </td>
              </tr>
              <tr>
                  <td align="left" style="padding: 20px 0;">
                      <table width="100%" cellspacing="0" cellpadding="5" style="border-collapse: collapse; margin-bottom: 15px;">
                          <tr>
                              <td style="font-weight: bold; color: #555; width: 40%;">Order ID:</td>
                              <td style="color: #333;">${orderData.orderId}</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Order Date:</td>
                              <td style="color: #333;">${new Date(
                                orderData.date
                              ).toLocaleString()}</td>
                          </tr>
                          <tr>
                              <td style="font-weight: bold; color: #555;">Delivery Location:</td>
                              <td style="color: #333;">${
                                orderData.user.hall
                              }</td>
                          </tr>
                      </table>
                      
                      <h3 style="color: #333; margin-bottom: 10px;">Your Order:</h3>
                      <table width="100%" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
                          <tr style="background-color: #f8f9fa;">
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Quantity</th>
                              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                          </tr>
                          ${orderItemsHtml}
                      </table>
                      
                      ${condimentsHtml}
                      
                      <table width="100%" cellspacing="0" cellpadding="5" style="border-collapse: collapse; margin-top: 20px;">
                          <tr>
                              <td style="text-align: right; font-weight: bold; color: #555;">Subtotal:</td>
                              <td style="text-align: right; width: 30%; color: #333;">₦${subtotal.toLocaleString()}</td>
                          </tr>
                          <tr>
                              <td style="text-align: right; font-weight: bold; color: #555;">Delivery Fee:</td>
                              <td style="text-align: right; color: #333;">₦${deliveryFee.toLocaleString()}</td>
                          </tr>
                          <tr>
                              <td style="text-align: right; font-weight: bold; color: #555; border-top: 1px solid #ddd; padding-top: 10px;">Total:</td>
                              <td style="text-align: right; font-weight: bold; color: #1a8754; border-top: 1px solid #ddd; padding-top: 10px;">₦${parseFloat(
                                orderData.orderPrice
                              ).toLocaleString()}</td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 20px 0; border-top: 1px solid #ddd;">
                      <p style="color: #555; font-size: 14px;">Your order will be delivered to your location shortly.</p>
                      <p style="color: #555; font-size: 14px;">If you have any questions, please contact our support team:</p>
                      <a href="https://wa.me/2349159171382" style="display: inline-block; margin-top: 10px; padding: 8px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Contact Support on WhatsApp</a>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="color: #777; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd;">
                      <p>&copy; ${new Date().getFullYear()} Belongeen. All rights reserved.</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending customer email:", error);
    return { success: false, error: error.message };
  }
};
/**
 * Send order emails to both admin and customer
 * @param {Object} orderData - Complete order data
 * @param {String} adminEmail - Admin's email address
 */
const sendOrderEmails = async (orderData, adminEmail) => {
  try {
    // Send email to admin
    const adminEmailResult = await sendOrderAdminEmail(orderData, adminEmail);
    
    // Send email to customer
    const customerEmailResult = await sendOrderCustomerEmail(orderData);
    
    return { 
      success: adminEmailResult.success && customerEmailResult.success,
      adminEmailSent: adminEmailResult.success,
      customerEmailSent: customerEmailResult.success
    };
  } catch (error) {
    console.error("Error sending order emails:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = {
  sendOrderAdminEmail,
  sendOrderCustomerEmail,
  sendOrderEmails
};