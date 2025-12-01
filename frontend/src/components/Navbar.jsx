import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

    const navigate = useNavigate()

    const {token, setToken, userData} = useContext(AppContext)

    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const logout = () => {
      setToken(false)
      localStorage.removeItem('token')
    }


  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img onClick={()=>navigate('/')} className='cursor-pointer' src={assets.logo} alt="" />
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to={'/'}>
            <li className='py-1'>HOME</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to={'/services'}>
            <li className='py-1'>ALL SERVICES</li> 
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to={'/events'}>
            <li className='py-1'>ÉVÉNEMENTS</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to={'/about'}>
            <li className='py-1'>ABOUT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to={'/contact'}>
            <li className='py-1'>CONTACT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
        {
            token && userData
            ? <div className='flex items-center gap-2 cursor-pointer group relative' onClick={()=>setShowProfileMenu(!showProfileMenu)}>
                <img className='w-8 rounded-full' src={userData.image} alt="" />
                <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block' style={{display: showProfileMenu ? 'block' : 'none'}}>
                    <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                        <p onClick={()=>navigate('my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                        <p onClick={()=>navigate('my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                        <p onClick={()=>navigate('my-calendar-bookings')} className='hover:text-black cursor-pointer'>My Appointments</p>
                        <p onClick={()=>navigate('my-events')} className='hover:text-black cursor-pointer'>Mes Événements</p>
                        <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                    </div>
                </div>
            </div>
            :<button onClick={()=>navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>CREATE ACOUNT</button>
        }
        <img onClick={()=>setShowMobileMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
        {/* mobile menu */}
        <div className={`${showMobileMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='' src={assets.logo} alt="" />
            <img className='w-7' onClick={()=>setShowMobileMenu(false)} src={assets.cross_icon} alt="" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={()=>setShowMobileMenu(false)} to={'/'}>
              <li> <p className='px-4 py-2 rounded inline-block'>HOME</p></li>
            </NavLink>
            <NavLink onClick={()=>setShowMobileMenu(false)} to={'/services'}>
              <li> <p className='px-4 py-2 rounded inline-block'>ALL SERVICES</p></li>
            </NavLink>
            <NavLink onClick={()=>setShowMobileMenu(false)} to={'/events'}>
              <li> <p className='px-4 py-2 rounded inline-block'>ÉVÉNEMENTS</p></li>
            </NavLink>
            <NavLink onClick={()=>setShowMobileMenu(false)} to={'/about'}>
              <li> <p className='px-4 py-2 rounded inline-block'>ABOUT</p></li>
            </NavLink>
            <NavLink onClick={()=>setShowMobileMenu(false)} to={'/contact'}>
              <li> <p className='px-4 py-2 rounded inline-block'>CONTACT</p></li>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar