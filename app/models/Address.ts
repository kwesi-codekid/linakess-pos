import mongoose from "../mongoose.server"

// mage new changes
const AddressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        title: String,
        address: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        default: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

export { AddressSchema }
