// src/components/LoginModal.js
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setIsAdmin,
  setShowLoginModal,
  toggleConfig,
  toggleDailyStats,
} from '../../redux/actions/actionsSlice';

export default function LoginModal() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.actions.showLoginModal);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const FIXED_PIN = '1905'; // 👈 tu PIN definido en el código

  const handleClose = () => dispatch(setShowLoginModal(false));

  const handleSubmit = (e) => {
    e.preventDefault();
    const typed = (pin || '').replace(/\s/g, ''); // quita espacios
    if (typed === FIXED_PIN) {
      dispatch(setIsAdmin(true));
      dispatch(setShowLoginModal(false));
      dispatch(toggleDailyStats(true));
      dispatch(toggleConfig(false));
    } else {
      setError('PIN incorrecto');
    }
  };
  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { background: '#F7F7FF' } }}>
      <DialogContent>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Acceso administrador</h3>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Ingresá tu PIN"
            style={{
              padding: 10,
              borderRadius: 10,
              border: error ? '2px solid #e53935' : '1px solid #ccc',
            }}
            autoFocus
          />
          {error && <small style={{ color: '#e53935' }}>{error}</small>}
          <button
            type="submit"
            style={{ padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
          >
            Entrar
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
