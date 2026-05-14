import Dashboard from './pages/Dashboard'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#111113',
          color: '#fff',
          border: '1px solid #27272a',
        },
      }} />
      <Dashboard />
    </>
  )
}
