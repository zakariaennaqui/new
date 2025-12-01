import React from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllApointments from './pages/Admin/AllApointments';
import AddService from './pages/Admin/AddService';
import ServiceList from './pages/Admin/ServiceList';
import { ServiceContext } from './context/ServiceContext';
import ServiceDashboard from './pages/Service/ServiceDashboard';
import ServiceAppointments from './pages/Service/ServiceAppointments';
import ServiceProfile from './pages/Service/ServiceProfile';
import ServiceEvents from './pages/Service/ServiceEvents';
import ServicePromoCodes from './pages/Service/ServicePromoCodes';
import ServiceCalendar from './pages/Service/ServiceCalendar';

const App = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken} = useContext(ServiceContext)

  return aToken || sToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer/>
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          {/* admin route */}
          <Route path='/' element={<></>}/>
          <Route path='/admin-dashboard' element={<Dashboard/>}/>
          <Route path='/all-appointments' element={<AllApointments/>}/>
          <Route path='/add-service' element={<AddService/>}/>
          <Route path='/service-list' element={<ServiceList/>}/>
          {/* service route */}
          <Route path='/service-dashboard' element={<ServiceDashboard/>}/>
          <Route path='/service-appointments' element={<ServiceAppointments/>}/>
          <Route path='/service-calendar' element={<ServiceCalendar/>}/>
          <Route path='/service-events' element={<ServiceEvents/>}/>
          <Route path='/service-promo-codes' element={<ServicePromoCodes/>}/>
          <Route path='/service-profile' element={<ServiceProfile/>}/>
        </Routes>
      </div>
    </div>
  ) : (
    <>
     <Login/>
     <ToastContainer/>
    </>
  )
}

export default App
