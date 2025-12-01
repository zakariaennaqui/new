import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const {backendUrl, token, setToken} = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('sign up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (state === 'sign up') {
        const {data} = await axios.post(backendUrl + '/api/user/register',{name,password,email})
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const {data} = await axios.post(backendUrl + '/api/user/login',{password,email})
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if (token) {
      navigate('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'sign up' ? 'create account' : 'login'}</p>
        <p>Please enter your email and password to {state === 'sign up' ? 'create an account' : 'login'}</p>
        {
          state === 'sign up' && <div className='w-full'>
          <p>full name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name}/>
        </div>
        }
        <div className='w-full'>
          <p>email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} required/>
        </div>
        <div className='w-full'>
          <p>password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} required/>
        </div>
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === 'sign up' ? 'create account' : 'login'}</button>
        {
          state === 'sign up'
          ? <p>Already have an account? <span onClick={()=>setState('login')} className='text-primary underline cursor-pointer'>Login</span> </p>
          : <p>Don't have an account? <span onClick={()=>setState('sign up')} className='text-primary underline cursor-pointer'>Sign Up</span></p>
        }
        {/* Are you an expert section */}
        <div className='mt-4'>
          <p className='text-green-600 font-semibold'>
            Are you an expert? <span 
            onClick={() => window.location.href = 'https://calendlyclone-high.vercel.app'}
            className='text-green-800 underline cursor-pointer'>Go to</span>
          </p>
        </div>
      </div>
      
    </form>
  )
}

export default Login

