import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Services from './pages/Services'
import Login from './pages/Login'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import About from './pages/About'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyPayment from './pages/VerifyPayment'
import Events from './pages/Events'
import EventRegister from './pages/EventRegister'
import MyEvents from './pages/MyEvents'
import VerifyEventPayment from './pages/VerifyEventPayment'
import CalendarBooking from './pages/CalendarBooking'
import MyCalendarBookings from './pages/MyCalendarBookings'
import Meet from './pages/Meet'
import VerifyCalendarPayment from './pages/VerifyCalendarPayment'
import PrivacyPolicy from './pages/PrivacyPolicy'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home /> } />
        <Route path='/services' element={<Services /> } />
        <Route path='/services/:speciality' element={<Services /> } />
        <Route path='/login' element={<Login /> } />
        <Route path='/contact' element={<Contact /> } />
        <Route path='/my-profile' element={<MyProfile /> } />
        <Route path='/my-appointments' element={<MyAppointments /> } />
        <Route path='/appointment/:docId' element={<Appointment /> } />
        <Route path='/about' element={<About /> } />
        <Route path="/verify-payment" element={<VerifyPayment />} />
        <Route path="/verify-calendar-payment" element={<VerifyCalendarPayment />} />
        <Route path='/events' element={<Events />} />
        <Route path='/event-register/:eventId' element={<EventRegister />} />
        <Route path='/my-events' element={<MyEvents />} />
        <Route path='/verify-event-payment' element={<VerifyEventPayment />} />
        <Route path='/calendar-booking/:serviceId' element={<CalendarBooking />} />
        <Route path='/my-calendar-bookings' element={<MyCalendarBookings />} />
        <Route path='/meet' element={<Meet />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
