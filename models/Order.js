import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ✅ full customer info
  customerInfo: {
    nom: String,
    prenom: String,
    email: String,
    telephone: String,
  },

  // ✅ shipping address
  shippingAddress: {
    rue: String,
    complement: String,
    ville: String,
    province: String,
    postal: String,
  },

  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      size: String,
      color: String,
    },
  ],

  totalAmount: Number,
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
  