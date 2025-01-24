import mongoose from "mongoose";

const PlansSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    price: {
        type: String,
    },
    percentage:{
        type: String,
},
});
        const PlansInfo =
    mongoose.models.Plans ||
    mongoose.model("Plans", PlansSchema);

export default PlansInfo ;