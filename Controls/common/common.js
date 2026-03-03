import User from "../../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Cart from "../../models/Cart.js"
import Order from "../../models/Order.js"
import Abonne from "../../models/Abonne.js"
import validator from 'validator'
import Product from "../../models/Product.js"
import mongoose from "mongoose"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== Auth ====================

export const signUp = async (req, res) => {
  try {
    let { email, password, phoneNumber } = req.body;

    if (!email || !password || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Email, password, and phone number are required." });
    }

    phoneNumber = phoneNumber.trim();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address format." });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      const field = existingUser.email === email ? "email address" : "phone number";
      return res.status(409).json({ success: false, message: `That ${field} is already associated with an account.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, phoneNumber, role: "Client" });

    const token = generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: { id: newUser._id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("[signUp]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    const validPassword = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !validPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[signIn]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("[logout]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





export const CheckEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email address." });
    }

    return res.status(200).json({ success: true, message: "Email address verified." });
  } catch (error) {
    console.error("[CheckEmail]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const Newpassword = async (req, res) => {
  const { password, email } = req.body;
  try {
    if (!password || !email) {
      return res.status(400).json({ success: false, message: "Email and new password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "No account found with that email address." });
    }

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("[Newpassword]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const ResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email address." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await User.findOneAndUpdate({ email }, { resetCode: code, resetCodeExpiry: expiry });
    await SendEmailReset(code, email);

    return res.status(200).json({ success: true, message: "A verification code has been sent to your email." });
  } catch (error) {
    console.error("[ResetEmail]", error);
    return res.status(500).json({ success: false, message: "Failed to send reset email. Please try again later." });
  }
};

export const VerifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email address." });
    }

    if (user.resetCode?.trim() !== code?.trim()) {
      return res.status(400).json({ success: false, message: "The verification code is incorrect." });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "The verification code has expired. Please request a new one." });
    }

    await User.findOneAndUpdate({ email }, { resetCode: null, resetCodeExpiry: null });
    return res.status(200).json({ success: true, message: "Verification code confirmed successfully." });
  } catch (error) {
    console.error("[VerifyCode]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

async function SendEmailReset(code, email) {
  await resend.emails.send({
    from: 'meleksaket2003@gmail.com',
    to: email,
    subject: '🔐 Vérification en deux étapes - KickOff',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0B0D10; color: #fff; padding: 30px; border-radius: 10px; width: 100%; margin: auto;">
        <h2 style="text-align:center; color:#00E6AD;">Vérification en deux étapes</h2>
        <p style="text-align:center; color:#ddd; font-size:14px;">
          Un code de vérification a été envoyé à votre email <br/>
          <span style="color:#00E6AD; font-weight:bold;">${email}</span>
        </p>
        <p style="text-align:center; color:#aaa; font-size:13px; margin-bottom: 20px;">
          Veuillez saisir ce code, il expirera dans 15 minutes.
        </p>
        <h2 style="text-align:center; color:#00E6AD;">${code}</h2>
        <p style="text-align:center; font-size:12px; color:#888; margin-top:25px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
        </p>
      </div>
    `
  });
}

// ==================== Cart ====================

export const addToCart = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: "User ID and a valid products array are required." });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      for (const newProduct of products) {
        const existingIndex = cart.products.findIndex(
          p => p.productId.toString() === newProduct.productId &&
               p.size === newProduct.size &&
               p.color === newProduct.color
        );
        if (existingIndex !== -1) {
          cart.products[existingIndex].quantity += newProduct.quantity;
        } else {
          cart.products.push(newProduct);
        }
      }
    } else {
      cart = new Cart({ userId, products });
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({ success: true, message: "Product added to cart successfully.", data: cart });
  } catch (error) {
    console.error("[addToCart]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(200).json({ success: true, data: { products: [] } });
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("[getCart]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const updateCartItem = async (req, res) => {
  const { userId, productId, size, color, quantity, cartItemId, originalSize, originalColor } = req.body;

  try {
    if (!userId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "User ID and quantity are required." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this user." });
    }

    let productIndex = -1;

    if (cartItemId) {
      productIndex = cart.products.findIndex(p => p._id.toString() === cartItemId.toString());
    }
    if (productIndex === -1 && productId && originalSize && originalColor) {
      productIndex = cart.products.findIndex(
        p => p.productId.toString() === productId.toString() &&
             p.size.toLowerCase() === originalSize.toLowerCase() &&
             p.color.toLowerCase() === originalColor.toLowerCase()
      );
    }
    if (productIndex === -1 && productId && size && color) {
      productIndex = cart.products.findIndex(
        p => p.productId.toString() === productId.toString() &&
             p.size.toLowerCase() === size.toLowerCase() &&
             p.color.toLowerCase() === color.toLowerCase()
      );
    }

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart." });
    }

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
      if (size && cart.products[productIndex].size !== size) cart.products[productIndex].size = size;
      if (color && cart.products[productIndex].color !== color) cart.products[productIndex].color = color;
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({ success: true, message: "Cart updated successfully.", data: cart });
  } catch (error) {
    console.error("[updateCartItem]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const removeFromCart = async (req, res) => {
  const { userId, productId, size, color } = req.body;

  try {
    if (!userId || !productId || !size || !color) {
      return res.status(400).json({ success: false, message: "User ID, product ID, size, and color are required." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this user." });
    }

    cart.products = cart.products.filter(
      p => !(p.productId.toString() === productId && p.size === size && p.color === color)
    );

    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({ success: true, message: "Product removed from cart successfully.", data: cart });
  } catch (error) {
    console.error("[removeFromCart]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Orders ====================

export const createOrder = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, rue, complement, ville, province, postal } = req.body;

  try {
    if (!id || !nom || !prenom || !rue || !ville) {
      return res.status(400).json({ success: false, message: "Name, surname, street, and city are required to place an order." });
    }

    const cart = await Cart.findOne({ userId: id }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty. Add items before placing an order." });
    }

    const totalAmount = cart.products.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * item.quantity;
    }, 0);

    const newOrder = new Order({
      id,
      customerInfo: { nom, prenom, email, telephone },
      shippingAddress: { rue, complement, ville, province, postal },
      products: cart.products.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      totalAmount,
    });

    await newOrder.save();
    await Cart.findOneAndUpdate({ userId: id }, { products: [] });

    return res.status(201).json({ success: true, message: "Order placed successfully.", data: newOrder });
  } catch (error) {
    console.error("[createOrder]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Products ====================

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ subcategoryId: id });
    if (!product) {
      return res.status(404).json({ success: false, message: "No product found for this subcategory." });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("[getProductById]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("[getProduct]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Newsletter ====================

export const Subscribe = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address format." });
    }

    const exists = await Abonne.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "This email address is already subscribed." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await new Abonne({ email, confirmed: false, confirmationToken: token }).save();

    const confirmUrl = `http://localhost:2025/confirm-subscribe/${token}`;
    SendConfirmationEmail(email, confirmUrl);

    return res.status(201).json({ success: true, message: "A confirmation link has been sent to your email address." });
  } catch (error) {
    console.error("[Subscribe]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const ConfirmSubscribe = async (req, res) => {
  const { token } = req.params;

  try {
    const subscriber = await Abonne.findOne({ confirmationToken: token });
    if (!subscriber) {
      return res.status(400).json({ success: false, message: "This confirmation link is invalid or has already been used." });
    }

    subscriber.confirmed = true;
    subscriber.confirmationToken = undefined;
    await subscriber.save();

    return res.status(200).json({ success: true, message: "Your subscription has been confirmed. Welcome!" });
  } catch (error) {
    console.error("[ConfirmSubscribe]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

function SendConfirmationEmail(recipientEmail, confirmUrl) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: 'meleksaket2003@gmail.com', pass: 'ghqx emfa jzan lvrn' }
  });

  transporter.sendMail({
    from: `"ES Brand"`,
    to: recipientEmail,
    subject: "Confirm your subscription to ES Newsletter",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f9fafb;padding:30px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:black;color:white;padding:20px;text-align:center;font-size:20px;font-weight:bold;">
            Confirm your subscription
          </div>
          <div style="padding:20px;">
            <p style="font-size:14px;color:#444;line-height:1.6;">
              Click the button below to confirm your subscription to <b>ES Brand</b>'s newsletter:
            </p>
            <a href="${confirmUrl}" style="display:inline-block;background:black;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;margin-top:15px;font-weight:bold;">
              Confirm Subscription
            </a>
          </div>
        </div>
      </div>
    `
  }, (error, info) => {
    if (error) console.error("[SendConfirmationEmail]", error);
    else console.log("[SendConfirmationEmail] Sent:", info.response);
  });
}

// ==================== Filters ====================

export const getFilters = async (req, res) => {
  try {
    const { subcategoryId, genre } = req.query;
    const matchStage = {};
    if (subcategoryId) matchStage.subcategoryId = new mongoose.Types.ObjectId(subcategoryId);
    if (genre) matchStage.genre = genre;

    const result = await Product.aggregate([
      { $match: matchStage },
      {
        $facet: {
          colors: [
            { $unwind: "$color" },
            { $group: { _id: "$color", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          sizes: [
            { $unwind: "$size" },
            {
              $project: {
                sizeArray: {
                  $cond: [
                    { $regexMatch: { input: "$size", regex: /^\[.*\]$/ } },
                    { $map: { input: { $split: [{ $trim: { input: "$size", chars: '[]"' } }, '","'] }, as: "s", in: "$$s" } },
                    ["$size"]
                  ]
                }
              }
            },
            { $unwind: "$sizeArray" },
            { $group: { _id: "$sizeArray", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
        }
      }
    ]);

    return res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[getFilters]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Contact ====================

export const ContactMessage = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ success: false, message: "Request body is missing." });
  }

  const { message, phone, name, email, subject } = req.body;

  if (!message || !name || !email || !subject) {
    return res.status(400).json({ success: false, message: "Name, email, subject, and message are required." });
  }

  try {
    await SendEmail(message, phone, name, email, subject);
    return res.status(200).json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("[ContactMessage]", error);
    return res.status(500).json({ success: false, message: "Failed to send your message. Please try again later." });
  }
};

async function SendEmail(message, Number, Name, email, subject) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "meleksaket2003@gmail.com", pass: "luxa gacz fkyb sryy" },
  });

  return transporter.sendMail({
    from: `"${Name}" <${email}>`,
    to: "melekesseket4@gmail.com",
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #0f766e;">New Partner Inquiry 📩</h2>
        <p><strong>Name:</strong> ${Name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone Number:</strong> ${Number}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${message}</p>
        <hr/>
        <p style="font-size: 12px; color: #999;">Sent automatically from the Sport Booking website.</p>
      </div>
    `,
  });
}

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });