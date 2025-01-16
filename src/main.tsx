import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from "./routes/App.tsx";
import Launch from "./routes/launch/Launch.tsx";
import FhirTester from "./routes/fhir-tester.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/launch",
    element: <Launch/>
  },
  {
    path: "/fhir-tester",
    element: <FhirTester/>
  }
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </React.StrictMode>
);
