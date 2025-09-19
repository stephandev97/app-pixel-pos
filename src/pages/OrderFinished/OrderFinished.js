import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import { forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleFinishOrder } from '../../redux/actions/actionsSlice';
import { ButtonFinished, Container } from './OrderFinishedStyles';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const OrderFinished = () => {
  const dispatch = useDispatch();
  const showFinished = useSelector((state) => state.actions.finishOrder);
  const status = useSelector((s) => s.orders.status); // 'idle' | 'loading' | 'succeeded' | 'failed'
  const isSaving = status === 'loading';

  const handleClose = () => {
    dispatch(toggleFinishOrder(false));
  };

  return (
    <>
      <Dialog
        slots={{ transition: Transition }}
        fullScreen
        open={showFinished}
        onClose={handleClose}
      >
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
                <a>Pedido creado con éxito</a>
                <ButtonFinished onClick={handleClose}>Volver al inicio</ButtonFinished>
              </>
            )}
          </div>
        </Container>
      </Dialog>
    </>
  );
};

export default OrderFinished;
