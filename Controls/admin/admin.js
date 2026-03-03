import Category from "../../models/Category.js"
import Message from "../../models/Messages.js"
import Subcategory from "../../models/subcategory.js"
import Product from "../../models/Product.js"
import Cart from "../../models/Cart.js"
import Order from "../../models/Order.js"
import Bug from "../../models/Bug.js"

export const Messages = async (req, res) => {
  if (req.user.role !== "Owner" && req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }
  try {
    const messages = await Message.find();
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error("[Messages]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const AddCategory = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { name, slug, icon } = req.body;

  try {
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(409).json({ success: false, message: "A category with this name already exists." });
    }

    const imagePaths = req.files?.map(file => file.path);
    const normalizedIcon = typeof icon === "string" ? icon.trim() : undefined;
    const category = new Category({ name, icon: normalizedIcon, slug, images: imagePaths });
    await category.save();

    return res.status(201).json({ success: true, message: "Category created successfully.", data: category });
  } catch (error) {
    console.error("[AddCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error("[getCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const AddSubcategory = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { name, slug, categoryId, genre } = req.body;

  try {
    if (!name?.trim() || !categoryId) {
      return res.status(400).json({ success: false, message: "Subcategory name and category ID are required." });
    }

    const imagePath = req.file ? req.file.path : undefined;
    const subcategory = new Subcategory({ name, slug, categoryId, image: imagePath, genre });
    await subcategory.save();

    return res.status(201).json({ success: true, message: "Subcategory created successfully.", data: subcategory });
  } catch (error) {
    console.error("[AddSubcategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getSubCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const subcategories = await Subcategory.find({ categoryId: id });
    return res.status(200).json({ success: true, count: subcategories.length, data: subcategories });
  } catch (error) {
    console.error("[getSubCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getAllSubCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    return res.status(200).json({ success: true, count: subcategories.length, data: subcategories });
  } catch (error) {
    console.error("[getAllSubCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const deleSubCategory = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { id } = req.params;
  try {
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found." });
    }

    await subcategory.deleteOne({ _id: id });
    return res.status(200).json({ success: true, message: "Subcategory deleted successfully." });
  } catch (error) {
    console.error("[deleSubCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const deleCategory = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    await Category.deleteOne({ _id: id });
    return res.status(200).json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("[deleCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Product ====================

export const getProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("[getProduct]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const deleteProduct = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await Product.deleteOne({ _id: id });
    return res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("[deleteProduct]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("[getProductById]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const AddProduct = async (req, res) => {
  const { name, price, categoryId, subcategoryId, size, genre, color, stock, isFeatured } = req.body;

  let parsedColor = [];
  try {
    parsedColor = typeof color === "string" ? JSON.parse(color) : color;
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid color format. Expected a JSON array." });
  }

  const images = [];
  if (Array.isArray(parsedColor)) {
    for (const c of parsedColor) {
      const files = (req.files || []).filter(f => f.fieldname === `images[${c}][]`);
      const urls = files.map(f => `/uploads/${f.filename}`);
      if (urls.length > 0) images.push({ color: c, urls });
    }
  }

  try {
    const product = new Product({
      name,
      price,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      size: size || [],
      genre,
      color: parsedColor || [],
      stock: stock || 0,
      images,
      isFeatured: isFeatured || false,
    });

    await product.save();
    return res.status(201).json({ success: true, message: "Product created successfully.", data: product });
  } catch (error) {
    console.error("[AddProduct]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const UpdateProduct = async (req, res) => {
  const { name, price, categoryId, subcategoryId, size, genre, color, stock, isFeatured } = req.body;
  const { id } = req.params;

  let parsedColor = color;
  try {
    if (typeof color === "string") parsedColor = JSON.parse(color);
  } catch {
    return res.status(400).json({ success: false, message: "Invalid color format. Expected a JSON array." });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    let currentImages = product.images || [];
    const images = [];

    if (parsedColor && Array.isArray(parsedColor)) {
      for (const c of parsedColor) {
        let existing = req.body[`existingImages[${c}]`];
        if (existing) {
          try {
            if (typeof existing === "string") existing = JSON.parse(existing);
          } catch {
            existing = [existing];
          }
        }
        if (!Array.isArray(existing)) existing = existing ? [existing] : [];

        const files = (req.files || []).filter(f => f.fieldname === `images[${c}][]`);
        const newUrls = files.map(f => `/uploads/${f.filename}`);
        const currentColorObj = currentImages.find(img => img.color === c);
        let mergedUrls = [];

        if (currentColorObj) {
          if (existing !== undefined && existing !== null) {
            const normalizeUrl = (u) => u ? String(u).replace(/^.*\/uploads\//, "/uploads/") : "";
            const normalizedExisting = existing.map(normalizeUrl).filter(Boolean);
            mergedUrls = currentColorObj.urls.filter(url => normalizedExisting.includes(normalizeUrl(url)));
          } else {
            mergedUrls = [...currentColorObj.urls];
          }
        }

        mergedUrls = [...mergedUrls, ...newUrls];
        if (mergedUrls.length > 0 || newUrls.length > 0) images.push({ color: c, urls: mergedUrls });
      }
    }

    const untouchedColors = currentImages.filter(img => !parsedColor.includes(img.color));
    images.push(...untouchedColors);

    product.name = name;
    product.price = price;
    product.categoryId = categoryId;
    product.subcategoryId = subcategoryId;
    product.size = size;
    product.genre = genre;
    product.color = parsedColor || [];
    product.stock = stock;
    product.images = images;
    product.isFeatured = isFeatured;

    await product.save();
    return res.status(200).json({ success: true, message: "Product updated successfully.", data: product });
  } catch (error) {
    console.error("[UpdateProduct]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const getProductCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.find({ userId: id });
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("[getProductCart]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Orders ====================

export const getOrders = async (req, res) => {
  if (req.user.role !== "Owner" && req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }
  try {
    const orders = await Order.find({}).populate("userId").populate("products.productId");
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("[getOrders]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

export const updateOrderStatus = async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Owner") {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
  }

  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ success: false, message: "Order status is required." });
    }

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.status = status;
    await order.save();
    return res.status(200).json({ success: true, message: "Order status updated successfully.", data: order });
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};

// ==================== Bugs ====================

export const AddBug = async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title?.trim() || !description?.trim() || !priority) {
    return res.status(400).json({ success: false, message: "Title, description, and priority are required." });
  }

  try {
    const bug = await Bug.create({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "To do",
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, message: "Bug reported successfully.", data: bug });
  } catch (error) {
    console.error("[AddBug]", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};