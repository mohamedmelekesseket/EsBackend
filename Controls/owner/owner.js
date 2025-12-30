import User from "../../models/User.js"




export const getUser = async(req,res)=>{    
    if (req.user.role !== "Owner" && req.user.role !== "Admin" ) {
        return res.status(500).json({message : "You don't have access to do that"})
    }
    try {
        const users= await User.find()        
        return res.status(200).json(users)
    } catch (error) {
        console.log(error);
        return res.status(404).json({Message:"Internal server error",error})
    }
}
export const deleteuser = async (req , res) => {
    if (req.user.role !== "Owner" ) {
        return res.status(500).json({message : "You don't have access to do that"})
    }
    const { id } = req.params
    try {
        const user = await User.findById(id)
        await user.deleteOne({_id : id})
        return res.status(200).json({message : 'User deleted'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message : 'Internal server error'})
    }
}
export const UpdateUSer = async(req,res) =>{
    if (req.user.role !== "Owner") {
        return res.status(500).json({message : "You don't have access to do that"})
    }
    const {id}=req.params
    const {role}=req.body
    try {
        await User.updateOne({ _id: id }, { $set: { role } });
        res.status(200).json({Message:"Updatet"})
    } catch (error) {
        console.log(error)
    }

}
