import React, { useContext, useState, } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ServiceContext } from '../context/ServiceContext'

const Login = () => {

    const [state, setState] = useState('Service')
    const [registerStep, setRegisterStep] = useState(1)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [speciality, setSpeciality] = useState('coach')
    const [customSpeciality, setCustomSpeciality] = useState('') // Nouvelle state pour spécialité personnalisée
    const [isCustomSpeciality, setIsCustomSpeciality] = useState(false) // Toggle pour spécialité personnalisée
    const [degree, setDegree] = useState('')
    const [experience, setExperience] = useState('1 year')
    const [about, setAbout] = useState('')
    const [fees, setFees] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [image, setImage] = useState(false)
    const [otp, setOtp] = useState('')
    const [tempData, setTempData] = useState(null)
    const [isRegistering, setIsRegistering] = useState(false)

    const {setAToken, backendUrl} = useContext(AdminContext)

    const {setSToken} = useContext(ServiceContext)

    const resetForm = () => {
        setEmail('')
        setPassword('')
        setName('')
        setSpeciality('coach')
        setCustomSpeciality('')
        setIsCustomSpeciality(false)
        setDegree('')
        setExperience('1 year')
        setAbout('')
        setFees('')
        setAddress1('')
        setAddress2('')
        setImage(false)
        setOtp('')
        setTempData(null)
        setRegisterStep(1)
        setIsRegistering(false)
    }

    const onSubmitHandler = async (event) => {

    event.preventDefault()

    try {
        if (state === 'Admin') {
            const {data} = await axios.post(backendUrl + '/api/admin/login' , {email, password})
            if (data.success) {
            localStorage.setItem('aToken', data.token)
            setAToken(data.token)
            } else {
              toast.error(data.message)
            }
        } else if (state === 'Service') {
          const {data} = await axios.post(backendUrl + '/api/service/login' , {email, password})
          if (data.success) {
            localStorage.setItem('sToken', data.token)
            setSToken(data.token)
            console.log(data.token)
            } else {
              toast.error(data.message)
            }
        }
    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }

    }

    const onRegisterStep1 = async (event) => {
        event.preventDefault()
        setIsRegistering(true)

        try {
            if (!image) {
                toast.error("Veuillez sélectionner une image")
                setIsRegistering(false)
                return
            }

            // Utiliser la spécialité personnalisée si elle est définie, sinon utiliser celle sélectionnée
            const finalSpeciality = isCustomSpeciality ? customSpeciality.trim() : speciality

            if (isCustomSpeciality && !customSpeciality.trim()) {
                toast.error("Veuillez saisir votre spécialité")
                setIsRegistering(false)
                return
            }

            const formData = new FormData()
            formData.append('image', image)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('speciality', finalSpeciality)
            formData.append('degree', degree)
            formData.append('experience', experience)
            formData.append('about', about)
            formData.append('fees', Number(fees))
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            const {data} = await axios.post(backendUrl + '/api/service/register-step1', formData)
            
            if (data.success) {
                setTempData(data.tempData)
                setRegisterStep(2)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsRegistering(false)
        }
    }

    const onRegisterStep2 = async (event) => {
        event.preventDefault()
        setIsRegistering(true)

        try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('email', email)
            formData.append('otp', otp)
            formData.append('serviceData', JSON.stringify(tempData))

            const {data} = await axios.post(backendUrl + '/api/service/register-step2', formData)
            
            if (data.success) {
                toast.success(data.message)
                resetForm()
                setState('Service')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsRegistering(false)
        }
    }

    const resendOTP = async () => {
        try {
            const {data} = await axios.post(backendUrl + '/api/service/resend-otp', {email})
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handleSpecialityChange = (value) => {
        if (value === 'custom') {
            setIsCustomSpeciality(true)
            setSpeciality('')
        } else {
            setIsCustomSpeciality(false)
            setSpeciality(value)
            setCustomSpeciality('')
        }
    }


  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <div className='flex justify-center mb-4'>
          <button onClick={() => {setState('Admin'); resetForm()}} className={`px-4 py-2 mr-2 rounded ${state === 'Admin' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Admin</button>
          <button onClick={() => {setState('Service'); resetForm()}} className={`px-4 py-2 mr-2 rounded ${state === 'Service' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Service</button>
          <button onClick={() => {setState('Register'); resetForm()}} className={`px-4 py-2 rounded ${state === 'Register' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>S'inscrire</button>
        </div>

        {state === 'Register' ? (
          registerStep === 1 ? (
            <form onSubmit={onRegisterStep1}>
              <p className='text-xl font-bold mb-4'>Inscription Service Provider</p>

              <div className='mb-4'>
                <label className='block mb-2'>Photo de profil</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Spécialité</label>
                {!isCustomSpeciality ? (
                  <div>
                    <select value={speciality} onChange={(e) => handleSpecialityChange(e.target.value)} className='w-full border rounded px-3 py-2 mb-2'>
                      <option value="teacher">teacher</option>
                      <option value="doctor">doctor</option>
                      <option value="electrician">electrician</option>
                      <option value="lawyer">lawyer</option>
                      <option value="barber">barber</option>
                      <option value="coach">coach</option>
                      <option value="custom">Autre (saisir manuellement)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      value={customSpeciality} 
                      onChange={(e) => setCustomSpeciality(e.target.value)} 
                      placeholder="Saisissez votre spécialité"
                      required 
                      className='w-full border rounded px-3 py-2 mb-2'
                    />
                    <button 
                      type="button" 
                      onClick={() => {setIsCustomSpeciality(false); setSpeciality('coach'); setCustomSpeciality('')}}
                      className='text-sm text-blue-500 hover:text-blue-700'
                    >
                      Choisir dans la liste prédéfinie
                    </button>
                  </div>
                )}
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Diplôme</label>
                <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Expérience</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} className='w-full border rounded px-3 py-2'>
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={`${i+1} year${i > 0 ? 's' : ''}`}>{i+1} an{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Tarifs</label>
                <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Adresse ligne 1</label>
                <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Adresse ligne 2</label>
                <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} required className='w-full border rounded px-3 py-2'/>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>À propos</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} required rows={3} className='w-full border rounded px-3 py-2'/>
              </div>

              <button type='submit' disabled={isRegistering} className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50'>
                {isRegistering ? 'Envoi...' : 'Envoyer le code OTP'}
              </button>
            </form>

          ) : (

            <form onSubmit={onRegisterStep2}>
              <p className='text-xl font-bold mb-4'>Vérification Email</p>
              <p className='mb-4 text-gray-600'>Un code OTP a été envoyé à {email}</p>
              
              <div className='mb-4'>
                <label className='block mb-2'>Code OTP (6 chiffres)</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required className='w-full border rounded px-3 py-2 text-center text-2xl tracking-widest' placeholder="000000"/>
              </div>

              <button type='submit' disabled={isRegistering} className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50 mb-2'>
                {isRegistering ? 'Vérification...' : 'Vérifier et créer le compte'}
              </button>

              <button type='button' onClick={resendOTP} className='w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 mb-2'>
                Renvoyer le code
              </button>

              <button type='button' onClick={() => setRegisterStep(1)} className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>
                Retour
              </button>
            </form>
          )
        ) : (
          <form onSubmit={onSubmitHandler}>
            <p className='text-xl font-bold mb-4'>{state} Login</p>

            <div className='mb-4'>
              <label className='block mb-2'>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className='w-full border rounded px-3 py-2'/>
            </div>

            <div className='mb-4'>
              <label className='block mb-2'>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className='w-full border rounded px-3 py-2'/>
            </div>

            <button type='submit' className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>
              Se connecter
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login