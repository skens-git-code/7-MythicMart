import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/api/test")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>MythicMart 🚀</h1>
      <p>Check the console to see backend response</p>
    </div>
  );
}

export default App;
