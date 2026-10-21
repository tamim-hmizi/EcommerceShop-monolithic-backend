import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
