import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getEvents = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/event/all');
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = (event) => {
    return new Date() <= new Date(event.registrationDeadline) && 
           event.participants.length < event.maxParticipants;
  };

  const handleRegister = (eventId) => {
    if (!token) {
      toast.warn('Veuillez vous connecter pour vous inscrire');
      navigate('/login');
      return;
    }
    navigate(`/event-register/${eventId}`);
  };

  useEffect(() => {
    getEvents();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement des événements...</p>
      </div>
    );
  }

  return (
    <div className='py-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Événements Disponibles</h1>
        <p className='text-gray-600'>Découvrez et inscrivez-vous aux événements organisés par nos services</p>
      </div>

      {events.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>Aucun événement disponible pour le moment</p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => (
            <div key={event._id} className='bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow'>
              <div className='p-6'>
                <div className='flex items-center mb-4'>
                  <img 
                    src={event.serviceData.image} 
                    alt={event.serviceData.name}
                    className='w-12 h-12 rounded-full mr-3'
                  />
                  <div>
                    <p className='font-medium text-gray-800'>{event.serviceData.name}</p>
                    <p className='text-sm text-gray-500'>{event.serviceData.speciality}</p>
                  </div>
                </div>

                <h3 className='text-xl font-semibold text-gray-800 mb-2'>{event.title}</h3>
                <p className='text-gray-600 mb-4 line-clamp-3'>{event.description}</p>

                <div className='space-y-2 text-sm text-gray-600 mb-4'>
                  <div className='flex items-center'>
                    <span className='font-medium w-20'>Lieu:</span>
                    <span>{event.location}</span>
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium w-20'>Début:</span>
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium w-20'>Fin:</span>
                    <span>{formatDate(event.endDate)}</span>
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium w-20'>Places:</span>
                    <span>{event.participants.length}/{event.maxParticipants}</span>
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium w-20'>Prix:</span>
                    <span className={event.isFree ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                      {event.isFree ? 'Gratuit' : `$${event.price}`}
                    </span>
                  </div>
                </div>

                <div className='mb-4'>
                  <p className='text-xs text-gray-500'>
                    Inscription jusqu'au: {formatDate(event.registrationDeadline)}
                  </p>
                </div>

                <div className='flex justify-between items-center'>
                  {isRegistrationOpen(event) ? (
                    <button
                      onClick={() => handleRegister(event._id)}
                      className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
                    >
                      S'inscrire
                    </button>
                  ) : (
                    <button
                      disabled
                      className='bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed'
                    >
                      {event.participants.length >= event.maxParticipants ? 'Complet' : 'Inscriptions fermées'}
                    </button>
                  )}
                  
                  <div className='text-right'>
                    <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                      event.participants.length >= event.maxParticipants 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.participants.length >= event.maxParticipants ? 'Complet' : 'Places disponibles'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;