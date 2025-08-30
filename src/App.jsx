import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Trips from './components/Trips'
import TripLayout from './components/TripLayout'
import TripDetails from './components/TripDetails'
import TripMap from './components/TripMap'
import FormAI from './components/FormAI'
import Suggestions from './components/Suggestions'
import NotFound from './components/NotFound'


function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/trips" element={<Trips />}/>

        <Route path="/trips/:tripId" element={<TripLayout />}>
          <Route index element={<TripDetails />}/>
          <Route path="map" element={<TripMap />}/>
        </Route>

        <Route path="/find-destination" element={<FormAI />}/>
        <Route path="/suggestions" element={<Suggestions />}/>
        <Route path="*" element={<NotFound />}/>
      </Route>
    </Routes>
  )
}

export default App
