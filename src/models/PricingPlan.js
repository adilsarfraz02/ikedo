import mongoose from 'mongoose';

const PricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  cashback: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  textColor: {
    type: String,
    required: true
  },
  buttonColor: {
    type: String,
    required: true
  },
  popular: {
    type: Boolean,
    default: false
  }
});

export default mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema);
