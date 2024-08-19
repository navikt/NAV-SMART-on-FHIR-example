import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import "./index.css";
import Launch from "./routes/launch/Launch.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/launch",
    element: <Launch/>
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
