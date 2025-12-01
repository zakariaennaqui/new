import React, { useContext, useEffect, useState } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ServiceCalendar = () => {
  const { sToken, backendUrl } = useContext(ServiceContext);
  const [config, setConfig] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfig, setShowConfig] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Configuration par défaut
  const [configForm, setConfigForm] = useState({
    defaultDuration: 60,
    workingDays: [1, 2, 3, 4, 5],
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    breakTimes: []
  });

  const [newBreak, setNewBreak] = useState({
    name: '',
    start: '',
    end: ''
  });

  const daysOfWeek = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  const getCalendarConfig = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/calendar/config', {
        headers: { sToken }
      });
      if (data.success) {
        setConfig(data.config);
        setConfigForm(data.config);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateConfig = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/calendar/config', configForm, {
        headers: { sToken }
      });
      if (data.success) {
        toast.success(data.message);
        setConfig(data.config);
        setShowConfig(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const generateSlots = async () => {
    setGenerating(true);
    try {
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30); // Générer pour 30 jours

      const { data } = await axios.post(backendUrl + '/api/calendar/generate-slots', {
        startDate,
        endDate: endDate.toISOString().split('T')[0]
      }, {
        headers: { sToken }
      });

      if (data.success) {
        toast.success(data.message);
        getSlots();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const getSlots = async () => {
    try {
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30); // Afficher 7 jours

      const { data } = await axios.get(backendUrl + '/api/calendar/service-slots', {
        params: {
          startDate,
          endDate: endDate.toISOString().split('T')[0]
        },
        headers: { sToken }
      });

      if (data.success) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = async (slotId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/calendar/toggle-slot', {
        slotId
      }, {
        headers: { sToken }
      });

      if (data.success) {
        toast.success(data.message);
        getSlots();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const addBreakTime = () => {
    if (newBreak.name && newBreak.start && newBreak.end) {
      setConfigForm(prev => ({
        ...prev,
        breakTimes: [...prev.breakTimes, { ...newBreak }]
      }));
      setNewBreak({ name: '', start: '', end: '' });
    }
  };

  const removeBreakTime = (index) => {
    setConfigForm(prev => ({
      ...prev,
      breakTimes: prev.breakTimes.filter((_, i) => i !== index)
    }));
  };

  const handleWorkingDayChange = (dayValue) => {
    setConfigForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayValue)
        ? prev.workingDays.filter(d => d !== dayValue)
        : [...prev.workingDays, dayValue]
    }));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  useEffect(() => {
    if (sToken) {
      getCalendarConfig();
    }
  }, [sToken]);

  useEffect(() => {
    if (config) {
      getSlots();
    }
  }, [config, selectedDate]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement...</p>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Gestion du Calendrier</h1>
        <div className='flex space-x-4'>
          <button
            onClick={() => setShowConfig(true)}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
          >
            Configuration
          </button>
          <button
            onClick={generateSlots}
            disabled={generating}
            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50'
          >
            {generating ? 'Génération...' : 'Générer Créneaux'}
          </button>
        </div>
      </div>

      {/* Sélecteur de date */}
      <div className='mb-6'>
        <label className='block text-sm font-medium mb-2'>Date de début:</label>
        <input
          type='date'
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className='border rounded px-3 py-2'
        />
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4'>Configuration du Calendrier</h2>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Durée par défaut (minutes)</label>
                <select
                  value={configForm.defaultDuration}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, defaultDuration: Number(e.target.value) }))}
                  className='w-full border rounded px-3 py-2'
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 heure</option>
                  <option value={90}>1h30</option>
                  <option value={120}>2 heures</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Jours de travail</label>
                <div className='grid grid-cols-2 gap-2'>
                  {daysOfWeek.map(day => (
                    <label key={day.value} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={configForm.workingDays.includes(day.value)}
                        onChange={() => handleWorkingDayChange(day.value)}
                        className='mr-2'
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Heure de début</label>
                  <input
                    type='time'
                    value={configForm.workingHours.start}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className='w-full border rounded px-3 py-2'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Heure de fin</label>
                  <input
                    type='time'
                    value={configForm.workingHours.end}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className='w-full border rounded px-3 py-2'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Pauses</label>
                <div className='space-y-2'>
                  {configForm.breakTimes.map((breakTime, index) => (
                    <div key={index} className='flex items-center justify-between bg-gray-50 p-2 rounded'>
                      <span>{breakTime.name}: {breakTime.start} - {breakTime.end}</span>
                      <button
                        onClick={() => removeBreakTime(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className='mt-2 grid grid-cols-4 gap-2'>
                  <input
                    type='text'
                    placeholder='Nom de la pause'
                    value={newBreak.name}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, name: e.target.value }))}
                    className='border rounded px-2 py-1'
                  />
                  <input
                    type='time'
                    value={newBreak.start}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, start: e.target.value }))}
                    className='border rounded px-2 py-1'
                  />
                  <input
                    type='time'
                    value={newBreak.end}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, end: e.target.value }))}
                    className='border rounded px-2 py-1'
                  />
                  <button
                    onClick={addBreakTime}
                    className='bg-blue-500 text-white px-2 py-1 rounded text-sm'
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-4 mt-6'>
              <button
                onClick={() => setShowConfig(false)}
                className='px-4 py-2 text-gray-600 border rounded hover:bg-gray-50'
              >
                Annuler
              </button>
              <button
                onClick={updateConfig}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affichage des créneaux */}
      <div className='space-y-6'>
        {Object.keys(groupedSlots).length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg mb-4'>Aucun créneau généré</p>
            <p className='text-gray-400'>Cliquez sur "Générer Créneaux" pour créer vos créneaux</p>
          </div>
        ) : (
          Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date} className='bg-white border rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>
                {formatDate(date)}
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'>
                {dateSlots.map(slot => (
                  <div
                    key={slot._id}
                    className={`p-2 rounded text-center text-sm cursor-pointer transition-colors ${
                      slot.isBooked
                        ? slot.cancelled
                          ? 'bg-red-100 text-red-800 cursor-not-allowed'
                          : slot.isCompleted
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : slot.payment
                          ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                        : slot.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => !slot.isBooked && toggleSlot(slot._id)}
                  >
                    <div className='font-medium'>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className='text-xs mt-1'>
                      {slot.isBooked ? (
                        slot.cancelled ? (
                          <span>Annulé</span>
                        ) : slot.isCompleted ? (
                          <span>Terminé</span>
                        ) : slot.payment ? (
                          <span>Payé</span>
                        ) : (
                          <span>Réservé</span>
                        )
                      ) : slot.isActive ? (
                        <span>Actif</span>
                      ) : (
                        <span>Inactif</span>
                      )}
                    </div>
                    {slot.isBooked && slot.bookingData && (
                      <div className='text-xs mt-1 text-blue-600'>
                        {slot.bookingData.userData.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceCalendar;