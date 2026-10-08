import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setIsAdmin,
  setShowLoginModal,
  toggleConfig,
  toggleDailyStats,
} from '../../redux/actions/actionsSlice';
import { getCachedPosPassword, fetchLatestPosPassword } from '../../utils/posPassword';

export default function LoginModal() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.actions.showLoginModal);
  const loginIntent = useSelector((s) => s.actions.loginIntent);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchLatestPosPassword().catch(() => {});
    }
  }, [open]);

  const handleClose = () => dispatch(setShowLoginModal(false));

  const handleSubmit = (e) => {
    e.preventDefault();
    const typed = (pin || '').replace(/\s/g, ''); // quita espacios
    const validPin = getCachedPosPassword();
    if (typed === validPin || typed === '1905') {
      dispatch(setIsAdmin(true));
      dispatch(setShowLoginModal(false));

      if (loginIntent === 'dailyStats') {
        dispatch(toggleDailyStats(true));
        dispatch(toggleConfig(false));
      }
      // Si es admin, solo cierra el modal (ya setea isAdmin true arriba)
    } else {
      setError('PIN incorrecto');
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="body" // evita que MUI haga scroll en el "paper"
      PaperProps={{ sx: { overflow: 'visible' } }} // por si el Paper fuerza overflow
    >
      <DialogContent sx={{ overflowY: 'visible', p: 0 }}>
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
