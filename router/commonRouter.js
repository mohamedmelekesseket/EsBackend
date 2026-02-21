import express from 'express'
import {  addToCart, getCart, removeFromCart, Subscribe, updateCartItem, getFilters, getProduct, ConfirmSubscribe, ResetEmail, CheckEmail, Newpassword, createOrder, ContactMessage, signUp, signIn, VerifyCode,  } from '../Controls/common/common.js'
import { getAllSubCategory, getProductById, getProductCart } from '../Controls/admin/admin.js'
import { protect } from '../MidelWer/auth.js'
import rateLimit from 'express-rate-limit';


const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in 15 minutes." },
});

const router=express.Router()

router.post('/SignUp',signUp)
router.post("/SignIn",signIn)
router.get("/Get-product/:id",getProductById)
router.get("/Get-ProductCart",getProductCart)
router.get('/getAllSubCategory',getAllSubCategory)
router.post('/Subscribe',Subscribe)
router.get('/confirm-subscribe/:token',ConfirmSubscribe )
router.get('/GetProduct',getProduct)

router.post('/ResetEmail',resetLimiter,ResetEmail)
router.post('/CheckEmail',resetLimiter,CheckEmail)
router.post('/NewPassword',resetLimiter,Newpassword)
router.post('/VerifyCode',   resetLimiter, VerifyCode);

router.post('/Contactez-nous',ContactMessage)
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role
  });
});

// Cart routes
router.post('/AddToCart', protect, addToCart)
router.post('/create-order/:id', protect, createOrder)
router.get('/GetProductCart/:userId', protect, getCart)
router.put('/cart-update', updateCartItem)
router.delete('/DeletePrdCart', removeFromCart)
router.get("/filters", getFilters);

export default router