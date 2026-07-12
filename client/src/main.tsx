// import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "./lib/store";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import "antd/dist/reset.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
