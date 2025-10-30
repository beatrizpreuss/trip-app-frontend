import { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, AuthContext } from './components/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Layout from './components/Layout'
import Home from './components/Home'
import Trips from './components/Trips'
import TripLayout from './components/TripLayout'
import TripDetails from './components/TripDetails'
import TripMap from './components/TripMap'
import FormAI from './components/FormAI'
import DestinationIdeas from './components/DestinationIdeas'
import NotFound from './components/NotFound'


function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/trips" element={<TripLayout />}>
              <Route index element={<Trips />} />
              <Route path=":tripId" element={<TripDetails />} />
              <Route path=":tripId/map" element={<TripMap />} />
            </Route>
          </Route>

          <Route path="/find-destinations" element={<FormAI />} />
          <Route path="/destination-ideas" element={<DestinationIdeas />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext)
  return token ? <Outlet /> : <Navigate to="/login" replace/>
}

export default App
