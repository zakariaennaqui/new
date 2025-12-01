import React, { useContext, useEffect, useState } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ServiceEvents = () => {
  const { sToken, backendUrl } = useContext(ServiceContext);
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    registrationDeadline: '',
    isFree: true,
    price: ''
  });

  const getEvents = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/event/service-events', { 
        headers: { sToken } 
      });
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/event/create', formData, {
        headers: { sToken }
      });
      if (data.success) {
        toast.success(data.message);
        setShowCreateForm(false);
        resetForm();
        getEvents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        backendUrl + `/api/event/update/${currentEvent._id}`,
        formData,
        { headers: { sToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setShowEditForm(false);
        resetForm();
        getEvents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { data } = await axios.delete(backendUrl + `/api/event/delete/${eventId}`, {
          headers: { sToken }
        });
        if (data.success) {
          toast.success(data.message);
          getEvents();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      maxParticipants: '',
      registrationDeadline: '',
      isFree: true,
      price: ''
    });
  };

  const handleEditClick = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      maxParticipants: event.maxParticipants,
      registrationDeadline: new Date(event.registrationDeadline).toISOString().slice(0, 16),
      isFree: event.isFree,
      price: event.price
    });
    setShowEditForm(true);
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

  useEffect(() => {
    if (sToken) {
      getEvents();
    }
  }, [sToken]);

  const renderEventForm = (isEdit = false) => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <h2 className='text-xl font-bold mb-4'>
          {isEdit ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
        </h2>
        <form onSubmit={isEdit ? updateEvent : createEvent} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Titre</label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className='w-full border rounded px-3 py-2'
              required
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-1'>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className='w-full border rounded px-3 py-2 h-24'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Lieu</label>
            <input
              type='text'
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className='w-full border rounded px-3 py-2'
              placeholder='Adresse physique ou "En ligne"'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Date de début</label>
              <input
                type='datetime-local'
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className='w-full border rounded px-3 py-2'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Date de fin</label>
              <input
                type='datetime-local'
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className='w-full border rounded px-3 py-2'
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Nombre max de participants</label>
              <input
                type='number'
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                className='w-full border rounded px-3 py-2'
                min='1'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Date limite d'inscription</label>
              <input
                type='datetime-local'
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                className='w-full border rounded px-3 py-2'
                required
              />
            </div>
          </div>

          <div>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.isFree}
                onChange={(e) => setFormData({
                  ...formData, 
                  isFree: e.target.checked, 
                  price: e.target.checked ? '' : formData.price
                })}
                className='mr-2'
              />
              Événement gratuit
            </label>
          </div>

          {!formData.isFree && (
            <div>
              <label className='block text-sm font-medium mb-1'>Prix par réservation ($)</label>
              <input
                type='number'
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className='w-full border rounded px-3 py-2'
                min='0'
                step='0.01'
                required={!formData.isFree}
              />
            </div>
          )}

          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => {
                if (isEdit) setShowEditForm(false);
                else setShowCreateForm(false);
                resetForm();
              }}
              className='px-4 py-2 text-gray-600 border rounded hover:bg-gray-50'
            >
              Annuler
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              {isEdit ? 'Mettre à jour' : 'Créer l\'Événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Mes Événements</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Créer un Événement
        </button>
      </div>

      {showCreateForm && renderEventForm(false)}
      {showEditForm && renderEventForm(true)}

      <div className='grid gap-6'>
        {events.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>Aucun événement créé</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className='bg-white border rounded-lg p-6 shadow-sm'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-xl font-semibold text-gray-800'>{event.title}</h3>
                  <p className='text-gray-600 mt-1'>{event.description}</p>
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => handleEditClick(event)}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteEvent(event._id)}
                    className='text-red-500 hover:text-red-700'
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p><span className='font-medium'>Lieu:</span> {event.location}</p>
                  <p><span className='font-medium'>Début:</span> {formatDate(event.startDate)}</p>
                  <p><span className='font-medium'>Fin:</span> {formatDate(event.endDate)}</p>
                </div>
                <div>
                  <p><span className='font-medium'>Participants:</span> {event.participants.length}/{event.maxParticipants}</p>
                  <p><span className='font-medium'>Limite inscription:</span> {formatDate(event.registrationDeadline)}</p>
                  <p><span className='font-medium'>Prix:</span> {event.isFree ? 'Gratuit' : `$${event.price}`}</p>
                </div>
              </div>

              {event.participants.length > 0 && (
                <div className='mt-4'>
                  <h4 className='font-medium mb-2'>Participants inscrits:</h4>
                  <div className='space-y-2'>
                    {event.participants.map((participant, index) => (
                      <div key={index} className='flex items-center justify-between bg-gray-50 p-2 rounded'>
                        <div className='flex items-center space-x-2'>
                          <img 
                            src={participant.userData.image} 
                            alt={participant.userData.name}
                            className='w-8 h-8 rounded-full'
                          />
                          <span>{participant.userData.name}</span>
                        </div>
                        <div className='text-sm text-gray-600'>
                          {participant.promoCode && <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2'>{participant.promoCode}</span>}
                          <span>${participant.finalPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceEvents;