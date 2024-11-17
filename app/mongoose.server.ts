import mongoose from "mongoose";

// Connect to your MongoDB instance
// mongodb://127.0.0.1:27017/linakess_pos
// "mongodb+srv://HueyWhyte:Famous10@whyte.wdm4x.mongodb.net/Linakess"
// mongoose.connect(process.env.MONGODB_URI as string);
mongoose.connect(process.env.MONGODB_URI as string);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Database connection error:"));
db.once("open", () => {
  console.log("Connected to Database, App is ready for use.");
});

export default mongoose;
