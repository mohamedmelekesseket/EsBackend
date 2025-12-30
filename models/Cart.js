import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      size: String,
      color:String  // or [String] if you want multiple colors

    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Cart', cartSchema);
