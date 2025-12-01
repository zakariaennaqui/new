import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const VerifyPayment = () => {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const appointmentId = searchParams.get('appointmentId')

  const { token, getServicesData } = useContext(AppContext)
  const navigate = useNavigate()

  const verifyStripe = async () => {
    try {
      if (!token || !appointmentId) return

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/verifyStripe`,
        { success, appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getServicesData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
        navigate('/my-appointments')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    verifyStripe()
  }, [token])

  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const provider = urlParams.get("provider");
  const appointmentId = urlParams.get("appointmentId");
  const success = urlParams.get("success");

  if (provider === "payzone" && success === "true") {
    verifyPayzone(appointmentId);
  }
}, []);

const verifyPayzone = async (appointmentId) => {
  try {
    const { data } = await axios.post(backendUrl + '/api/user/verifyPayzone', { appointmentId }, {
      headers: { token }
    });

    if (data.success) {
      toast.success(data.message);
      navigate('/my-appointments');
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
}

  return (
    <div className='flex justify-center items-center h-[50vh]'>
      <p className='text-lg text-gray-600'>Processing payment...</p>
    </div>
  )
}

export default VerifyPayment
