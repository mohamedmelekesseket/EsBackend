import User from "../../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Cart from "../../models/Cart.js"
import Order from "../../models/Order.js"
import Abonne from "../../models/Abonne.js"
import validator from 'validator'
import Product from "../../models/Product.js"
import mongoose from "mongoose";
import nodemailer from "nodemailer"
import crypto from "crypto";
import { log } from "console"

export const singUp = async(req,res)=>{
    
    const {email,password,phoneNumber}=req.body
    try {

        if( !email || !password ){
            return res.status(400).json({Message:"All files are required"})
        }
        const exist2= await User.findOne({phoneNumber})
        if (exist2) {
            return res.status(400).json({ message: "Cette Number est déjà utilisée" });
        }
        const exist= await User.findOne({email})
        if (exist) {
            return res.status(400).json({ message: "Cette adresse e-mail est déjà utilisée" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Wrong E-mail" });
        }
          
        if (!validator.isLength(password, { min: 5 })) {
            return res.status(400).json({ message: "Wrong Password (min 5 characters)" });
        }
        const HashedPassword= await bcrypt.hash(password,10)
        const newuser= new User({email,password:HashedPassword,phoneNumber})
        await newuser.save()
       return res.status(201).json({
            id : newuser._id,
            email :newuser.email,
            phoneNumber: newuser.phoneNumber,
            token : GenerateToken(newuser._id),
            role : 'User',
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
      }


}

export const singIn = async (req, res) => {
    const {email , password} = req.body
    try {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Wrong E-mail" });
      }
      
      if (!validator.isLength(password, { min: 5 })) {
        return res.status(400).json({ message: "Wrong Password (min 5 characters)" });
      }
        const user = await User.findOne({ email })
        if (!user) {
          return res.status(400).json({ message: "Invalid email or password" });
          
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }


        if (isMatch && user) {
            return res.status(200).json({
              id : user._id,
              email :user.email,
              fullName : user.fullName,
              phoneNumber: user.phoneNumber,
              token : GenerateToken(user._id),
              role : user.role,
          })
        }
    } catch (error) {
      console.log(error)
       return res.status(500).json({ message: "Internal Server Error" });

    }
};
export const CheckEmail = async (req, res) => {
  const {email} = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "email are required" });
    }

  
    const find = await User.findOne({ email: email });

    if (!find) {
      return res.status(204).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Email Exist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const Newpassword = async (req, res) => {
  const { password, email } = req.body;

  try {
    if (!password || !email) {
      return res.status(400).json({ message: "Password and email are required" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password by email
    const updatedUser = await User.findOneAndUpdate(
      { email: email },                // filter by email
      { password: hashedPassword },    // set new password
      { new: true }                    // return updated user
    );

    if (!updatedUser) {
      return res.status(204).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const ResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send email
    await SendEmailReset(code, email);

    // Return the code in response (⚠️ only for dev/testing, in prod store in DB/session)
    res.status(200).json({ code });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

function SendEmailReset(code, email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "meleksaket2003@gmail.com",
      pass: "luxa gacz fkyb sryy" // app password
    }
  });

  const mailOptions = {
    from: `"KickOff Support" <meleksaket2003@gmail.com>`,
    to: email,
    subject: "🔐 Vérification en deux étapes - KickOff",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0B0D10; color: #fff; padding: 30px; border-radius: 10px;width: 100% ; margin: auto;">
        <h2 style="text-align:center; color:#00E6AD;">Vérification en deux étapes</h2>
        <p style="text-align:center; color:#ddd; font-size:14px;">
          Un code de vérification a été envoyé à votre email <br/>
          <span style="color:#00E6AD; font-weight:bold;">${email}</span>
        </p>
        <p style="text-align:center; color:#aaa; font-size:13px; margin-bottom: 20px;">
          Veuillez saisir ce code, il expirera dans 15 minutes.
        </p>

        <h2 style="text-align:center; color:#00E6AD;">
          ${code}
        </h2>

        <p style="text-align:center; font-size:12px; color:#888; margin-top:25px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}


// Cart functionality
export const addToCart = async (req, res) => {
    try {
        const { userId, products } = req.body;
        
        if (!userId || !products || !Array.isArray(products)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Check if user already has a cart
        let cart = await Cart.findOne({ userId });
        
        if (cart) {
            // Update existing cart
            for (const newProduct of products) {
                const existingProductIndex = cart.products.findIndex(
                    p => p.productId.toString() === newProduct.productId && 
                         p.size === newProduct.size && 
                         p.color === newProduct.color
                );
                
                if (existingProductIndex !== -1) {
                    // Update quantity if same product, size, and color
                    cart.products[existingProductIndex].quantity += newProduct.quantity;
                } else {
                    // Add new product
                    cart.products.push(newProduct);
                }
            }
        } else {
            // Create new cart
            cart = new Cart({ userId, products });
        }
        
        cart.updatedAt = new Date();
        await cart.save();
        
        return res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        return res.status(500).json({ message: 'Failed to add product to cart' });
    }
};

export const createOrder = async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    prenom,
    email,
    telephone,
    rue,
    complement,
    ville,
    province,
    postal,
  } = req.body;
  console.log(id);
  try {
    // 1️⃣ Check required info
    if (!id || !nom || !prenom || !rue || !ville) {
      return res.status(400).json({ message: "Informations incomplètes." });
    }

    // 2️⃣ Get user cart
    const cart = await Cart.findOne({ userId:id }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Votre panier est vide." });
    }

    // 3️⃣ Calculate total
    const totalAmount = cart.products.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // 4️⃣ Create new order
    const newOrder = new Order({
      id,
      customerInfo: { nom, prenom, email, telephone },
      shippingAddress: { rue, complement, ville, province, postal },
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      totalAmount,
    });

    await newOrder.save();

    // 5️⃣ Optionally clear the cart after order
    await Cart.findOneAndUpdate({ userId: id }, { products: [] });

    // 6️⃣ Respond success
    return res.status(201).json({
      message: "Commande enregistrée avec succès.",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur serveur lors de la commande." });
  }
};
export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        
        if (!cart) {
            return res.status(200).json({ cart: { products: [] } });
        }
        
        return res.status(200).json({ cart });
    } catch (error) {
        console.error('Error getting cart:', error);
        return res.status(500).json({ message: 'Failed to get cart' });
    }
};

export const updateCartItem = async (req, res) => {
  const { userId, productId, size, color, quantity, cartItemId, originalSize, originalColor } = req.body;
  console.log( userId, productId, size, color, quantity, cartItemId, originalSize, originalColor );
  
  try {
    if (!userId || quantity === undefined) {
      return res.status(400).json({ message: 'userId and quantity are required' });
    }

    const cart = await Cart.findOne({ userId });
    console.log(cart);
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    let productIndex = -1;

    // Method 1: Find by cartItemId (most reliable)
    if (cartItemId) {
      productIndex = cart.products.findIndex(
        p => p._id.toString() === cartItemId.toString()
      );
    }
    
    // Method 2: Find by original size/color (if cartItemId not provided or not found)
    if (productIndex === -1 && productId && originalSize && originalColor) {
      productIndex = cart.products.findIndex(
        p =>
          p.productId.toString() === productId.toString() &&
          p.size.toLowerCase() === originalSize.toLowerCase() &&
          p.color.toLowerCase() === originalColor.toLowerCase()
      );
    }
    
    // Method 3: Fallback to new size/color (for backward compatibility)
    if (productIndex === -1 && productId && size && color) {
      productIndex = cart.products.findIndex(
        p =>
          p.productId.toString() === productId.toString() &&
          p.size.toLowerCase() === size.toLowerCase() &&
          p.color.toLowerCase() === color.toLowerCase()
      );
    }

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Update quantity
    if (quantity <= 0) {
        cart.products.splice(productIndex, 1);
    } else {
        cart.products[productIndex].quantity = quantity;
        // Update size and color if provided and different
        if (size && cart.products[productIndex].size !== size) {
          cart.products[productIndex].size = size;
        }
        if (color && cart.products[productIndex].color !== color) {
          cart.products[productIndex].color = color;
        }
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
};


export const removeFromCart = async (req, res) => {
    const { userId, productId, size, color } = req.body;
    console.log(userId);
    console.log(productId);
    console.log(size);
    console.log(color);
    
    try {
        
        if (!userId || !productId || !size || !color) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        cart.products = cart.products.filter(
            p => !(p.productId.toString() === productId && 
                   p.size === size && 
                   p.color === color)
        );
        
        cart.updatedAt = new Date();
        await cart.save();
        
        return res.status(200).json({ message: 'Product removed from cart successfully', cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return res.status(500).json({ message: 'Failed to remove product from cart' });
    }
};


export const getProductById = async(req,res)=>{    
    const {id}=req.params
    try {
        const product= await Product.findOne({subcategoryId:id}) 
        if (!product) {
            return res.status(404).json({message: "Product not found"})
        }
        return res.status(200).json(product)
    } catch (error) {
        console.log(error);
        return res.status(404).json({Message:"Internal server error",error})
    }
}

export const getProduct = async(req,res)=>{    
    const {id}=req.params
    try {
        const product= await Product.find({})     
        return res.status(200).json(product)
    } catch (error) {
        console.log(error);
        return res.status(404).json({Message:"Internal server error",error})
    }
}



export const Subscribe = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const exist = await Abonne.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Cette adresse e-mail est déjà utilisée" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Wrong E-mail" });
    }

    // generate confirmation token
    const token = crypto.randomBytes(32).toString("hex");

    const newSubscribe = new Abonne({
      email,
      confirmed: false,
      confirmationToken: token
    });
    await newSubscribe.save();

    // send confirmation email with link
    const confirmUrl = `http://localhost:2025/confirm-subscribe/${token}`;
    SendConfirmationEmail(email, confirmUrl);

    return res.status(201).json({
      message: "Please confirm your email address. A confirmation link has been sent."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const ConfirmSubscribe = async (req, res) => {
  const { token } = req.params;

  try {
    const subscriber = await Abonne.findOne({ confirmationToken: token });
    if (!subscriber) {
      return res.status(400).json({ message: "Invalid or expired confirmation token" });
    }

    subscriber.confirmed = true;
    subscriber.confirmationToken = undefined;
    await subscriber.save();

    // now send welcome email
    SendNewsletterWelcome(subscriber.email);

    return res.status(200).json({ message: "Your subscription has been confirmed!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

function SendConfirmationEmail(recipientEmail, confirmUrl) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'meleksaket2003@gmail.com',
      pass: 'ghqx emfa jzan lvrn' 
    }
  });

  const mailOptions = {
    from: `"ES Brand" `,
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
              Click the button below to confirm your subscription to <b>ES Brand</b>’s newsletter:
            </p>
            <a href="${confirmUrl}" style="display:inline-block;background:black;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;margin-top:15px;font-weight:bold;">
              Confirm Subscription
            </a>
          </div>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("❌ Email error:", error);
    } else {
      console.log("✅ Confirmation email sent:", info.response);
    }
  });
}

export const getFilters = async (req, res) => {
  try {
    let { subcategoryId, genre } = req.query;
    // console.log("Incoming filters:", subcategoryId, genre);

    const matchStage = {};
    if (subcategoryId) matchStage.subcategoryId = new mongoose.Types.ObjectId(subcategoryId);
    if (genre) matchStage.genre = genre;

    const result = await Product.aggregate([
      { $match: matchStage },
      {
        $facet: {
          colors: [
            { $unwind: "$color" },
            { 
              $group: { 
                _id: "$color" ,// normalize lowercase
                count: { $sum: 1 }
              } 
            },
            { $sort: { _id: 1 } }
          ],
          sizes: [
            { $unwind: "$size" },
            {
              $project: {
                sizeArray: {
                  $cond: [
                    { $regexMatch: { input: "$size", regex: /^\[.*\]$/ } },
                    { $map: { input: { $split: [{ $trim: { input: "$size", chars: '[]"'} }, '","'] }, as: "s", in: "$$s" } },
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

    // console.log("Aggregation result:", result);

    res.json(result[0]);
  } catch (err) {
    console.error("getFilters error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const ContactMessage = async (req, res) => {
  console.log("📩 /Contactez-nous endpoint HIT");

  if (!req.body) {
    console.log("❌ No body received!");
    return res.status(400).json({ error: "No request body" });
  }

  console.log("Body received:", req.body);

  const { message, phone, name, email, subject } = req.body;

  try {
    await SendEmail(message, phone, name, email, subject);
    return res.status(200).json({ message: "Message sent successfully ✅" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send message ❌" });
  }
};


async function SendEmail(message, Number, Name, email, subject) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "meleksaket2003@gmail.com", // ✅ must match the account used for App Password
      pass: "luxa gacz fkyb sryy", // ✅ paste without spaces
    },
  });

  const mailOptions = {
    from: `"${Name}" <${email}>`,
    to: "melekesseket4@gmail.com",
    subject: subject,
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
  };

  // ✅ Return a Promise
  return transporter.sendMail(mailOptions);
}


const GenerateToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"})
}