import express from 'express'
import { protect } from '../MidelWer/auth.js'
import {  AddCategory, AddProduct, AddSubcategory, deleCategory, deleSubCategory, deleteProduct, getCategory, getOrders, getProduct, getProductById, getProductCart, getSubCategory, Messages, UpdateProduct, updateOrderStatus, AddBug } from '../Controls/admin/admin.js'
import upload from '../MidelWer/multer.js'

const router=express.Router()
// Category
router.post('/Add-category',protect,upload.array('images',5),AddCategory)
router.get('/Get-category',getCategory)
router.delete('/Delete-category/:id',protect,deleCategory)


// SubCategory

router.post('/Add-CategorySub',protect,upload.single('images'),AddSubcategory)
router.get('/Get-Subcategory/:id',getSubCategory)
router.delete('/Delete-SubCategory/:id',protect,deleSubCategory)

// Product
router.post("/Add-Product",protect,upload.any(),AddProduct)
router.get('/getMessage',protect,Messages)
router.delete('/Delete-Product/:id',protect,deleteProduct)
router.get("/Get-products",getProduct)
router.get("/Get-product/:id", getProductById)
router.put('/UpdateProduct/:id',protect,upload.any(),UpdateProduct)
// Order
router.get('/Get-Orders',protect,getOrders)
router.put('/Update-Order-Status/:id',protect,updateOrderStatus)


// Bugs
router.post("/bug",protect,AddBug)


export default router