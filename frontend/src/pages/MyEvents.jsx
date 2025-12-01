import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyEvents = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserEvents = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/event/user-events', {
        headers: { token }
      });
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

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return { status: 'À venir', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'En cours', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Terminé', color: 'bg-gray-100 text-gray-800' };
    }
  };

  useEffect(() => {
    if (token) {
      getUserEvents();
    }
  }, [token]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement de vos événements...</p>
      </div>
    );
  }

  return (
    <div className='py-8'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>Mes Événements</h1>

      {events.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg mb-4'>Vous n'êtes inscrit à aucun événement</p>
          <a 
            href='/events' 
            className='text-blue-500 hover:text-blue-600 underline'
          >
            Découvrir les événements disponibles
          </a>
        </div>
      ) : (
        <div className='space-y-6'>
          {events.map((event) => {
            const userParticipation = event.participants.find(p => p.userId === token);
            const eventStatus = getEventStatus(event);
            
            return (
              <div key={event._id} className='bg-white border rounded-lg shadow-sm p-6'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center'>
                    <img 
                      src={event.serviceData.image} 
                      alt={event.serviceData.name}
                      className='w-12 h-12 rounded-full mr-3'
                    />
                    <div>
                      <h3 className='text-xl font-semibold text-gray-800'>{event.title}</h3>
                      <p className='text-gray-600'>{event.serviceData.name} - {event.serviceData.speciality}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${eventStatus.color}`}>
                    {eventStatus.status}
                  </span>
                </div>

                <p className='text-gray-600 mb-4'>{event.description}</p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div className='space-y-2 text-sm'>
                    <div>
                      <span className='font-medium text-gray-700'>Lieu:</span>
                      <span className='ml-2 text-gray-600'>{event.location}</span>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Début:</span>
                      <span className='ml-2 text-gray-600'>{formatDate(event.startDate)}</span>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Fin:</span>
                      <span className='ml-2 text-gray-600'>{formatDate(event.endDate)}</span>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div>
                      <span className='font-medium text-gray-700'>Participants:</span>
                      <span className='ml-2 text-gray-600'>{event.participants.length}/{event.maxParticipants}</span>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Prix payé:</span>
                      <span className='ml-2 text-gray-600'>
                        {userParticipation?.finalPrice === 0 ? 'Gratuit' : `$${userParticipation?.finalPrice}`}
                      </span>
                    </div>
                    {userParticipation?.promoCode && (
                      <div>
                        <span className='font-medium text-gray-700'>Code promo utilisé:</span>
                        <span className='ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs'>
                          {userParticipation.promoCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='text-xs text-gray-500'>
                  Inscrit le: {formatDate(userParticipation?.registrationDate)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvents;