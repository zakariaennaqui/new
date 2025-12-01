import React, { useContext, useEffect, useState } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ServicePromoCodes = () => {
  const { sToken, backendUrl } = useContext(ServiceContext);
  const [promoCodes, setPromoCodes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    usageLimit: '',
    usagePerUser: '1',
    validFrom: '',
    validUntil: ''
  });

  const getPromoCodes = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/promo/service-codes', { 
        headers: { sToken } 
      });
      if (data.success) {
        setPromoCodes(data.promoCodes);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const createPromoCode = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/promo/create', formData, {
        headers: { sToken }
      });
      if (data.success) {
        toast.success(data.message);
        setShowCreateForm(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          usageLimit: '',
          usagePerUser: '1',
          validFrom: '',
          validUntil: ''
        });
        getPromoCodes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const deletePromoCode = async (promoId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo?')) {
      try {
        const { data } = await axios.delete(backendUrl + `/api/promo/delete/${promoId}`, {
          headers: { sToken }
        });
        if (data.success) {
          toast.success(data.message);
          getPromoCodes();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  useEffect(() => {
    if (sToken) {
      getPromoCodes();
    }
  }, [sToken]);

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Codes Promo</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Créer un Code Promo
        </button>
      </div>

      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Créer un Code Promo</h2>
            <form onSubmit={createPromoCode} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Code</label>
                <input
                  type='text'
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className='w-full border rounded px-3 py-2'
                  placeholder='PROMO2024'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium mb-1'>Type de réduction</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                >
                  <option value='percentage'>Pourcentage</option>
                  <option value='fixed'>Montant fixe</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Valeur de réduction {formData.discountType === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type='number'
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                  min='1'
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Limite d'utilisation totale (optionnel)</label>
                <input
                  type='number'
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                  min='1'
                  placeholder='Illimité si vide'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Limite par utilisateur</label>
                <input
                  type='number'
                  value={formData.usagePerUser}
                  onChange={(e) => setFormData({...formData, usagePerUser: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                  min='1'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Valide à partir du</label>
                  <input
                    type='datetime-local'
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    className='w-full border rounded px-3 py-2'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Valide jusqu'au</label>
                  <input
                    type='datetime-local'
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className='w-full border rounded px-3 py-2'
                    required
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-4'>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='px-4 py-2 text-gray-600 border rounded hover:bg-gray-50'
                >
                  Annuler
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Code</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Réduction</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Utilisations</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Période</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Statut</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan='6' className='px-6 py-4 text-center text-gray-500'>
                  Aucun code promo créé
                </td>
              </tr>
            ) : (
              promoCodes.map((promo) => (
                <tr key={promo._id}>
                  <td className='px-6 py-4 font-mono font-bold text-blue-600'>{promo.code}</td>
                  <td className='px-6 py-4'>
                    {promo.discountType === 'percentage' 
                      ? `${promo.discountValue}%` 
                      : `$${promo.discountValue}`
                    }
                  </td>
                  <td className='px-6 py-4'>
                    {promo.totalUsed} / {promo.usageLimit || '∞'}
                    <br />
                    <span className='text-xs text-gray-500'>
                      Max {promo.usagePerUser}/utilisateur
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      promo.isActive && new Date() <= new Date(promo.validUntil)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {promo.isActive && new Date() <= new Date(promo.validUntil) ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <button
                      onClick={() => deletePromoCode(promo._id)}
                      className='text-red-500 hover:text-red-700'
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicePromoCodes;