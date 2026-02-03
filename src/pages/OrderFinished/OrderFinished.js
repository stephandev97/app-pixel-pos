// OrderFinished.js
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// ✅ mismo print que en Orders, con logo + pageStyle + tipografía
import { toggleFinishOrder } from '../../redux/actions/actionsSlice';
import { ButtonFinished, Container } from './OrderFinishedStyles';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const OrderFinished = () => {
  const dispatch = useDispatch();
  const showFinished = useSelector((s) => s.actions.finishOrder);
  const status = useSelector((s) => s.orders.status);
  const lastOrder = useSelector((s) => s.orders.lastCreatedOrder);

  const isSaving = status === 'loading';

  // mismo criterio que ya tenías
  const shouldPrint = useMemo(() => {
    return (
      showFinished &&
      status === 'succeeded' &&
      lastOrder?.mode === 'delivery' &&
      !lastOrder?.pending
    );
  }, [showFinished, status, lastOrder]);

  const [printed, setPrinted] = useState(false);
  const [printStatus, setPrintStatus] = useState('idle');
  // 'idle' | 'printing' | 'success' | 'failed' | 'skipped'

  // Reset cuando cambia el modal / pedido
  useEffect(() => {
    if (!showFinished) {
      setPrinted(false);
      setPrintStatus('idle');
      return;
    }

    // si no corresponde imprimir, habilitamos igual
    // 🔕 impresión desactivada temporalmente
    if (showFinished && status === 'succeeded') {
      setPrinted(true);
      setPrintStatus('skipped');
    }
  }, [showFinished, shouldPrint, status]);

  const canConfirm = !isSaving && printed;

  const handleClose = () => {
    if (!canConfirm) return;
    dispatch(toggleFinishOrder(false));
  };

  const message = isSaving
    ? 'Procesando pedido…'
    : printStatus === 'printing'
      ? 'Abriendo impresión…'
      : printStatus === 'success'
        ? 'Pedido creado e impreso ✅'
        : printStatus === 'failed'
          ? 'Pedido creado (no se imprimió) ⚠️'
          : 'Pedido creado con éxito';

  return (
    <Dialog slots={{ transition: Transition }} fullScreen open={showFinished} onClose={handleClose}>
      <Container>
        <div>
          {isSaving ? (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="white">Procesando pedido…</Typography>
            </>
          ) : (
            <>
              <Zoom in={showFinished} style={{ transitionDelay: showFinished ? '200ms' : '0ms' }}>
                <CheckCircleIcon sx={{ fontSize: 120, color: 'white', mb: '0.2em' }} />
              </Zoom>

              <a>{message}</a>

              <ButtonFinished
                onClick={handleClose}
                disabled={!canConfirm}
                style={{
                  opacity: canConfirm ? 1 : 0.5,
                  pointerEvents: canConfirm ? 'auto' : 'none',
                }}
              >
                Volver al inicio
              </ButtonFinished>
            </>
          )}
        </div>
        {/*
        {showFinished && status === 'succeeded' && lastOrder && shouldPrint && (
          <PrintTicket58
            // clave para que no “remezcle” refs si cambia el pedido
            key={lastOrder?.id || lastOrder?.created || 'order'}
            order={lastOrder}
            autoPrint={true}
            debugPreview={false}
            onAfterPrint={() => {
              setPrinted(true);
              setPrintStatus('success');
              dispatch(clearLastCreatedOrder());
            }}
            onError={(err) => {
              console.error('Error imprimiendo (dialog):', err);
              setPrinted(true);
              setPrintStatus('failed');
              // no bloqueamos el flujo
              alert(
                '⚠️ No se pudo imprimir el ticket.\n\n' +
                  (err?.message || 'Error desconocido') +
                  '\n\nPodés continuar igual.'
              );
            }}
          />
        )}
        */}
      </Container>
    </Dialog>
  );
};

export default OrderFinished;
