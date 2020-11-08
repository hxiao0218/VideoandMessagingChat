import React from "react";
import ReactDOM from "react-dom";
import Profile from "./components/Profile";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <Profile />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
