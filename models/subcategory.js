import mongoose from 'mongoose';
import slugify from 'slugify';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  genre: {
    type: String,
    enum: ['men', 'women', 'unisex'], 
    required: true
  },
  image: { type: String }
}, {
  timestamps: true
});

// Auto-slug
subcategorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('genre') || this.isModified('categoryId')) {
    const categoryFragment = this.categoryId.toString().slice(-6); // shorter ID
    this.slug = slugify(`${this.name}-${this.genre}-${categoryFragment}`, { lower: true, strict: true });
  }
  next();
});


export default mongoose.model('Subcategory', subcategorySchema);
