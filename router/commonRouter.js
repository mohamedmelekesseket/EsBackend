import express from 'express'
import {  addToCart, getCart, removeFromCart, singUp, singIn, Subscribe, updateCartItem, getFilters, getProduct, ConfirmSubscribe, ResetEmail, CheckEmail, Newpassword, createOrder, ContactMessage } from '../Controls/common/common.js'
import { getAllSubCategory, getProductById, getProductCart } from '../Controls/admin/admin.js'
import { protect } from '../MidelWer/auth.js'

const router=express.Router()

router.post('/SignUp',singUp)
router.post("/SignIn",singIn)
router.get("/Get-product/:id",getProductById)
router.get("/Get-ProductCart",getProductCart)
router.get('/getAllSubCategory',getAllSubCategory)
router.post('/Subscribe',Subscribe)
router.get('/confirm-subscribe/:token',ConfirmSubscribe )
router.get('/GetProduct',getProduct)
router.post('/ResetEmail',ResetEmail)
router.post('/CheckEmail',CheckEmail)
router.post('/NewPassword',Newpassword)
router.post('/Contactez-nous',ContactMessage)

// Cart routes
router.post('/AddToCart', protect, addToCart)
router.post('/create-order/:id', protect, createOrder)
router.get('/GetProductCart/:userId', protect, getCart)
router.put('/cart-update', updateCartItem)
router.delete('/DeletePrdCart', removeFromCart)
router.get("/filters", getFilters);

export default router