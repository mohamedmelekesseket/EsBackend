import Category from "../../models/Category.js"
import Message from "../../models/Messages.js"
import Subcategory from "../../models/subcategory.js"
import Product from "../../models/Product.js"
import Cart from "../../models/Cart.js"
import Order from "../../models/Order.js"

  export const Messages = async(req,res)=>{    
      if (req.user.role !== "Owner" && req.user.role !== "Admin" ) {
          return res.status(500).json({message : "You don't have access to do that"})
      }
      try {
          const message= await Message.find()        
          return res.status(200).json(message)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }


  export const AddCategory = async (req,res) => {
      const {name,slug,images,icon} = req.body
      if (req.user.role !== "Admin" && req.user.role !== "Owner") {
        return res.status(403).json({ message: "You don't have access to do that" }); // use 403 Forbidden
      }

      try {
          if(!name) {
              return res.status(400).json({message : 'Category Name required'})
          }
          const exist = await Category.findOne({name})
          if (exist) {
              return res.status(400).json({message : 'Category Name existe'})
          }
          const imagePaths = req.files?.map(file=>file.path)
          const normalizedIcon = typeof icon === 'string' ? icon.trim() : undefined
          const category = new Category({name,icon: normalizedIcon,slug,images:imagePaths})
          await category.save()
          return res.status(200).json({ message : 'Field Created successfully'  ,category})
      } catch (error) {
          console.log(error);
          return res.status(500).json({message : 'Cannot add a new field'})

      }
  }
  export const getCategory = async(req,res)=>{    

      try {
          const category= await Category.find()        
          return res.status(200).json(category)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }
  // export const deleteCategory = async (req , res) => {
  //     if (req.user.role !== "Admin" && req.user.role !== "Owner") {
  //             return res.status(500).json({message : "You don't have access to do that"})
  //     }
  //     const { id } = req.params
  //     try {
  //         const category = await Category.findById(id)
  //         await category.deleteOne({_id : id})
  //         return res.status(200).json({message : 'User deleted'})
  //     } catch (error) {
  //         console.log(error)
  //         res.status(500).json({message : 'Internal server error'})
  //     }
  // }
  export const AddSubcategory = async (req, res) => {
      const { name, slug, categoryId,genre } = req.body;
      if (req.user.role !== "Admin" && req.user.role !== "Owner") {
          return res.status(500).json({ message: "You don't have access to do that" });
      }
      try {
          if (!name || !categoryId) {
              return res.status(400).json({ message: 'Fields required' });
          }
          const imagePath = req.file ? req.file.path : undefined;
          const subcategory = new Subcategory({ name, slug, categoryId, image: imagePath ,genre});
          await subcategory.save();
          return res.status(201).json({ message: 'Subcategory created successfully', subcategory });
      } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Cannot add a new subcategory', error });
      }
  }
  export const getSubCategory = async(req,res)=>{    

      const {id}=req.params
      try {
          const subcategory= await Subcategory.find({ categoryId: id })     
          return res.status(200).json(subcategory)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }
  export const getAllSubCategory = async(req,res)=>{    
    try {
        const subcategory= await Subcategory.find()     
        return res.status(200).json(subcategory)
    } catch (error) {
        console.log(error);
        return res.status(404).json({Message:"Internal server error",error})
    }
  }
  export const deleSubCategory= async (req , res) => {
      if (req.user.role !== "Admin" && req.user.role !== "Owner") {
          return res.status(500).json({message : "You don't have access to do that"})
      }
      const { id } = req.params
      try {
          const subcategory = await Subcategory.findById(id)
          await subcategory.deleteOne({_id : id})
          return res.status(200).json({message : 'Subcategory deleted'})
      } catch (error) {
          console.log(error)
          res.status(500).json({message : 'Internal server error'})
      }
  }
  export const deleCategory = async (req, res) => {
    if (req.user.role !== "Admin" && req.user.role !== "Owner") {
      return res.status(403).json({ message: "You don't have access to do that" });
    }

    const { id } = req.params;
    console.log("Deleting category id:", id);

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({ message: "Invalid category ID" });
    // }

    try {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await Category.deleteOne({ _id: id });
      return res.status(200).json({ message: "Category deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

////////////////////// Product ////////////////////////

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
  export const deleteProduct= async (req , res) => {
      if (req.user.role !== "Admin" && req.user.role !== "Owner") {
          return res.status(500).json({message : "You don't have access to do that"})
      }
      const { id } = req.params
      try {
          await Product.deleteOne({_id : id})
          return res.status(200).json({message : 'Product deleted'})
      } catch (error) {
          console.log(error)
          res.status(500).json({message : 'Internal server error'})
      }
  }

  export const getProductById = async(req,res)=>{    
      const {id}=req.params
      try {
          const product= await Product.findById({_id:id}) 
          if (!product) {
              return res.status(404).json({message: "Product not found"})
          }
          return res.status(200).json(product)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }

export const AddProduct = async (req, res) => {
  const {
    name,
    price,
    categoryId,
    subcategoryId,
    size,
    genre,
    color,
    stock,
    isFeatured
  } = req.body;

  let parsedColor = [];

  try {
    parsedColor = typeof color === 'string' ? JSON.parse(color) : color;
  } catch (err) {
    console.log("Error parsing color:", err);
  }

  const images = [];

  if (Array.isArray(parsedColor)) {
    for (const c of parsedColor) {
      const files = (req.files || []).filter(
        f => f.fieldname === `images[${c}][]`
      );

      // ✅ CORRECT URL
      const urls = files.map(f => `/uploads/${f.filename}`);

      if (urls.length > 0) {
        images.push({ color: c, urls });
      }
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
      isFeatured: isFeatured || false
    });

    await product.save();

    return res.status(200).json({
      message: 'Product Created successfully',
      product
    });
  } catch (error) {
    console.log("Error creating product:", error);
    return res.status(500).json({
      message: 'Cannot add a new Product',
      error: error.message
    });
  }
};

  export const UpdateProduct = async (req, res) => {
    const { name, price, categoryId, subcategoryId, size, genre, color, stock, isFeatured } = req.body;

    // Parse colors
    let parsedColor = color;
    try {
      if (typeof color === 'string') {
        parsedColor = JSON.parse(color);
      }
    } catch (parseError) {
      console.log("Error parsing color:", parseError);
    }

    const { id } = req.params;

    try {
      // Fetch current product
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let currentImages = product.images || [];
      const images = [];

      if (parsedColor && Array.isArray(parsedColor)) {
        for (const c of parsedColor) {
          // 🔹 Parse existing images sent from frontend
        let existing = req.body[`existingImages[${c}]`];
          if (existing) {
            try {
              // If frontend sent JSON string → parse
              if (typeof existing === "string") {
                existing = JSON.parse(existing);
              }
            } catch (err) {
              // If it's a plain string (single URL), wrap in array
              existing = [existing];
            }
          }

        // Always ensure it's an array
        if (!Array.isArray(existing)) {
          existing = [existing];
        }


          // 🔹 New uploaded files
          const files = (req.files || []).filter(f => f.fieldname === `images[${c}][]`);
          const newUrls = files.map(f => f.filename );

          // 🔹 Find already stored images for this color
          const currentColorObj = currentImages.find(img => img.color === c);
          let mergedUrls = [];

          if (currentColorObj) {
            // Keep only the ones that are still in "existing"
            mergedUrls = currentColorObj.urls.filter(url => existing.includes(url));
          }

          // Add new uploads
          mergedUrls = [...mergedUrls, ...newUrls];

          // Final push
          images.push({ color: c, urls: mergedUrls });
        }
      }

      // ✅ Preserve old colors that are not in parsedColor
      const untouchedColors = currentImages.filter(img => !parsedColor.includes(img.color));
      images.push(...untouchedColors);

      // 🔹 Update product
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

      return res.status(200).json({ message: 'Product updated successfully', product });

    } catch (error) {
      console.log("Error updating product:", error);
      return res.status(500).json({ message: 'Cannot update Product', error: error.message });
    }
  };


  export const getProductCart = async(req,res)=>{    
      const {id}=req.params
      try {
          const cart= await Cart.find({userId : id})     
          return res.status(200).json(cart)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }


  ////////////////////// Orders ////////////////////////
  export const getOrders= async(req,res)=>{    
      const {id}=req.params
      try {
          const order= await Order.find({}).populate('userId').populate('products.productId')     
          return res.status(200).json(order)
      } catch (error) {
          console.log(error);
          return res.status(404).json({Message:"Internal server error",error})
      }
  }

  export const updateOrderStatus = async(req,res)=>{    
      if (req.user.role !== "Admin" && req.user.role !== "Owner") {
          return res.status(403).json({message : "You don't have access to do that"})
      }
      const {id}=req.params
      const {status}=req.body
      try {
          if(!status) {
              return res.status(400).json({message : 'Status is required'})
          }
          const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled']
          if(!validStatuses.includes(status)) {
              return res.status(400).json({message : 'Invalid status'})
          }
          const order= await Order.findById(id)
          if(!order) {
              return res.status(404).json({message : 'Order not found'})
          }
          order.status = status
          await order.save()
          return res.status(200).json({message : 'Order status updated successfully', order})
      } catch (error) {
          console.log(error);
          return res.status(500).json({Message:"Internal server error",error})
      }
  }