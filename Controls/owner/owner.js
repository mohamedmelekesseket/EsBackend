import User from "../../models/User.js"

export const getUser = async (req, res) => {
  if (req.user.role !== "Owner" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Insufficient permissions."
    });
  }

  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("[getUser]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

export const deleteuser = async (req, res) => {
  if (req.user.role !== "Owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Owners can delete users."
    });
  }

  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    await user.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: "User deleted successfully."
    });
  } catch (error) {
    console.error("[deleteUser]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

export const UpdateUSer = async (req, res) => {
  if (req.user.role !== "Owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Owners can update user roles."
    });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role is required."
    });
  }

  const validRoles = ["Client", "Admin", "Owner"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(", ")}.`
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    await User.updateOne({ _id: id }, { $set: { role } });
    return res.status(200).json({
      success: true,
      message: "User role updated successfully."
    });
  } catch (error) {
    console.error("[UpdateUser]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};