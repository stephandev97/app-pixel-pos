import { useEffect, useState } from 'react';

import { PB_URL, pb } from '../../lib/pb';

const panelStyle = {
  width: 'min(100% - 32px, 380px)',
  padding: 24,
  boxSizing: 'border-box',
  borderRadius: 16,
  background: '#fff',
  boxShadow: '0 16px 48px rgba(0,0,0,.18)',
  color: '#1f2937',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const inputStyle = {
  width: '100%',
  minHeight: 44,
  padding: '0 12px',
  boxSizing: 'border-box',
  border: '1px solid #cbd5e1',
  borderRadius: 9,
  font: 'inherit',
};

function isPosStaff(record) {
  return record?.isPosStaff === true;
}

export default function PocketBaseAuthGate({ children }) {
  const [status, setStatus] = useState('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreTerminalSession = async () => {
      const terminal = window.electron?.posTerminal;
      if (!terminal?.authenticate) return;

      const automaticAuth = await terminal.authenticate(PB_URL);
      if (!automaticAuth?.authenticated || !active) return;

      pb.authStore.save(automaticAuth.token, automaticAuth.record);
      if (isPosStaff(automaticAuth.record)) {
        setStatus('ready');
        return;
      }

      pb.authStore.clear();
      setError('La cuenta guardada no esta habilitada para el POS.');
      setStatus('login');
    };

    // La cuenta de la terminal se lee desde el almacenamiento cifrado de Windows.
    // La sesi\u00f3n de versiones anteriores sigue funcionando como respaldo.
    restoreTerminalSession();

    const cachedRecord = pb.authStore.model;
    if (!pb.authStore.isValid) {
      setStatus('login');
      return () => {
        active = false;
      };
    }

    pb.collection('users')
      .authRefresh()
      .then(({ record }) => {
        if (!active) return;
        if (!isPosStaff(record)) {
          pb.authStore.clear();
          setError('Esta cuenta no está habilitada para el POS. Contactá al administrador.');
          setStatus('login');
          return;
        }
        setStatus('ready');
      })
      .catch((authError) => {
        console.error('No se pudo renovar la sesión de PocketBase:', authError);
        if (!active) return;
        if (isPosStaff(cachedRecord)) {
          setStatus('ready');
          return;
        }
        pb.authStore.clear();
        setStatus('login');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const { record } = await pb.collection('users').authWithPassword(email.trim(), password);
      if (!isPosStaff(record)) {
        pb.authStore.clear();
        setError('Esta cuenta no está habilitada para el POS. Contactá al administrador.');
        return;
      }
      const credentials = { email: email.trim(), password };
      setPassword('');
      await window.electron?.posTerminal?.saveCredentials?.(credentials);
      setStatus('ready');
    } catch (authError) {
      console.error('Error autenticando el POS en PocketBase:', authError);
      setError('No se pudo iniciar sesión. Revisá las credenciales y la conexión.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'ready') return children;

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #33000c, #780000)',
      }}
    >
      <section style={panelStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Conectar POS</h1>
        <p style={{ margin: '0 0 20px', color: '#64748b', lineHeight: 1.5 }}>
          {status === 'checking'
            ? 'Verificando la sesión guardada...'
            : 'Ingresá una vez con la cuenta POS de PocketBase. La sesión quedará guardada en este dispositivo.'}
        </p>
        {status === 'checking' ? (
          <div role="status">Conectando...</div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
              Usuario o email
              <input
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
                required
              />
            </label>
            {error && (
              <p role="alert" style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              style={{
                ...inputStyle,
                marginTop: 4,
                border: 0,
                background: '#780000',
                color: '#fff',
                fontWeight: 700,
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              {busy ? 'Conectando...' : 'Conectar'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
