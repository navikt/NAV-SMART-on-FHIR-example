import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Validation from './routes/Validation.tsx'
import Launch from './routes/launch/Launch.tsx'
import FhirTester from './routes/fhir-tester.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FhirCreateTester from './routes/fhir-create-tester.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Validation />,
  },
  {
    path: '/launch',
    element: <Launch />,
  },
  {
    path: '/fhir-tester',
    element: <FhirTester />,
  },
  {
    path: '/fhir-creator',
    element: <FhirCreateTester />,
  },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
