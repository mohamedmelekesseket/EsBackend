import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  genre: { type: String,enum: ['women', 'men'],required: true},
  size: [String], // e.g., ["S", "M", "L"]
  color: [String], // e.g., ["Black", "Beige"]
  stock: { type: Number, default: 0 },
  images: [
    {
      color: String,
      urls: [String]
    }
  ], // images grouped by color
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
