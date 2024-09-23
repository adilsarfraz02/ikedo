// models/PaymentInfo.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    role:{
        type: String,
        default: "admin"
    },
    easypasia: {
        type: String,
        default : "0300-1234567"
    },
    jazzcash: {
        type: String,
        default : "0300-1234567"
    },
    bank: {
        type: String,
        default : "0300-1234567"
    },
});
        const PaymentInfo =
    mongoose.models.Payment ||
    mongoose.model("Payment", PaymentSchema);

export default PaymentInfo ;
