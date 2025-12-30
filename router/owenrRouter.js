import express from 'express'
import { deleteuser, getUser, UpdateUSer } from '../Controls/owner/owner.js'
import { protect } from '../MidelWer/auth.js'
const router=express.Router()

router.get('/getUser',protect,getUser)
router.put('/Update-User/:id',protect,UpdateUSer)
router.delete("/DeleteUser/:id",protect,deleteuser)
export default router