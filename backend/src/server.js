import app from "./app.js";

const PORT = 5001; // 👈 change port

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
