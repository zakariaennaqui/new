import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { ServiceContext } from '../context/ServiceContext'

const Navbar = () => {

    const {aToken, setAToken} = useContext(AdminContext)
    const {sToken, setSToken} = useContext(ServiceContext)

    const navigate = useNavigate()

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
        sToken && setSToken('')
        sToken && localStorage.removeItem('sToken')
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='cursor-pointer' src={assets.logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Service'}</p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>logout</button>
    </div>
  )
}

export default Navbar
