import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ArrowDownCircle, Sparkles } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import pkg from '../../../package.json';
import { pb } from '../../lib/pb';
import { isAndroid } from '../../utils/printBluetooth';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.95rem;
  color: #333;
`;

const VersionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;

  .from {
    color: #64748b;
  }
  .arrow {
    color: #94a3b8;
  }
  .to {
    color: #16a34a;
    font-weight: 700;
  }
`;

const NotesBox = styled.div`
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #92400e;
`;

function compareVersions(v1, v2) {
  const p1 = (v1 || '').replace(/^v/, '').split('.').map(Number);
  const p2 = (v2 || '').replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n2 > n1) return -1;
  }
  return 0;
}

export default function AndroidUpdatePrompt() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [open, setOpen] = useState(false);

  const checkUpdates = useCallback(async () => {
    if (!isAndroid()) return;

    try {
      const result = await pb.collection('versions').getList(1, 1, {
        sort: '-created',
      });

      if (result.items && result.items.length > 0) {
        const latest = result.items[0];
        const currentVer = pkg.version || '1.0.0';

        if (compareVersions(latest.version, currentVer) > 0) {
          let downloadUrl = latest.url;
          if (!downloadUrl && latest.apk) {
            downloadUrl = pb.files.getUrl(latest, latest.apk);
          }

          if (downloadUrl) {
            setUpdateInfo({
              currentVersion: currentVer,
              newVersion: latest.version,
              notes: latest.notes,
              url: downloadUrl,
            });
            setOpen(true);
          }
        }
      }
    } catch (err) {
      console.warn('[AndroidUpdatePrompt] Error comprobando actualizaciones:', err);
    }
  }, []);

  useEffect(() => {
    // Comprobar 3 segundos después del inicio
    const timer = setTimeout(() => {
      checkUpdates();
    }, 3000);

    // Y volver a comprobar periódicamente cada 30 minutos
    const interval = setInterval(checkUpdates, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkUpdates]);

  const handleDownload = () => {
    if (updateInfo?.url) {
      window.open(updateInfo.url, '_system');
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!open || !updateInfo) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          borderRadius: 16,
          padding: '8px',
          maxWidth: 420,
          width: '90%',
        },
      }}
    >
      <DialogTitle
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 800,
          color: '#4d0012',
        }}
      >
        <Sparkles size={22} color="#d97706" />
        Nueva versión disponible
      </DialogTitle>
      <DialogContent>
        <InfoContainer>
          <VersionBadge>
            <span className="from">v{updateInfo.currentVersion}</span>
            <span className="arrow">➔</span>
            <span className="to">v{updateInfo.newVersion}</span>
          </VersionBadge>

          {updateInfo.notes && (
            <NotesBox>
              <strong>Novedades:</strong> {updateInfo.notes}
            </NotesBox>
          )}

          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Descarga e instala el archivo APK para mantener la aplicación actualizada con las últimas mejoras.
          </p>
        </InfoContainer>
      </DialogContent>
      <DialogActions style={{ padding: '12px 16px', gap: 8 }}>
        <Button onClick={handleClose} color="inherit" style={{ textTransform: 'none' }}>
          Más tarde
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<ArrowDownCircle size={18} />}
          style={{
            backgroundColor: '#4d0012',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 8,
            padding: '8px 16px',
          }}
        >
          Descargar e Instalar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
