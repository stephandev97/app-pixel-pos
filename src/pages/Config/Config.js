import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react';
import { Check, ChevronRight, Settings, X } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import LoginModal from '../../components/LoginModal/LoginModal';
import { setShowLoginModal } from '../../redux/actions/actionsSlice';
import {
  addFileSabores,
  addListPro,
  removeProducts,
  removeSabores,
} from '../../redux/data/dataSlice';
import { formatPrice } from '../../utils/formatPrice';
import {
  Background,
  ButtonPage,
  ButtonUpload,
  Container,
  ContainerPages,
  ContentInput,
  ContentUploadFile,
  IconButton,
  InputFile,
  MsjButton,
  MsjNav,
  PageInner,
  TitlePage,
  TitleUpload,
} from './ConfigStyles';
import pkg from '../../../package.json'; // ajustá el path
const appVersion = pkg.version;

const ImportFile = ({ open, setOpen }) => {
  //const groupedOptionsHelado = useSelector((state) => state.sabores.sabores[0])

  const dispatch = useDispatch();
  const [text, setText] = useState();

  let fileReader;

  const onChange = (e) => {
    let file = e.target.files;
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file[0]);
  };

  const handleFileRead = () => {
    let content = fileReader.result;
    // let text = deleteLines(content, 3);
    // … do something with the 'content' …
    setText(content);
  };

  const clickBtnSabores = () => {
    if (text) {
      dispatch(removeSabores());
      dispatch(addFileSabores(JSON.parse(text)));
      setOpen(false);
    }
  };
  const clickBtnProducts = () => {
    if (text) {
      dispatch(removeProducts());
      dispatch(addListPro(JSON.parse(text)));
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ sx: { background: '#F7F7FF' } }}
    >
      <DialogContent>
        <ContentUploadFile>
          <TitleUpload>
            <a>Productos</a>
          </TitleUpload>
          <ContentInput>
            <InputFile type="file" name="myfile" onChange={onChange} />
            <ButtonUpload onClick={() => clickBtnProducts()}>
              <ArrowCircleUpIcon />
            </ButtonUpload>
          </ContentInput>
        </ContentUploadFile>
        <ContentUploadFile>
          <TitleUpload>
            <a>Sabores de helado</a>
          </TitleUpload>
          <ContentInput>
            <InputFile type="file" name="myfile" onChange={onChange} />
            <ButtonUpload onClick={() => clickBtnSabores()}>
              <ArrowCircleUpIcon />
            </ButtonUpload>
          </ContentInput>
        </ContentUploadFile>
      </DialogContent>
    </Dialog>
  );
};

const Config = () => {
  const orders = useSelector((state) => state.orders.orders);
  const dispatch = useDispatch();
  const [save, setSave] = useState(false);
  const [remove, setRemove] = useState(false);
  const [open, setOpen] = useState(false);
  const date = new Date().toLocaleDateString();
  const pedidos = orders.length;
  const total = orders.reduce((acc, order) => acc + order.total, 0);
  const efectivo = orders
    .filter((order) => order.pago !== 'Transferencia')
    .reduce((acc, order) => acc + order.total, 0);
  const mercadopago = orders
    .filter((order) => order.pago === 'Transferencia')
    .reduce((acc, order) => acc + order.total, 0);

  const items = orders.map((order) => order.items.map((x) => x));
  const lista = items.flat();
  const listaduplicados = lista.reduce((acumulador, valorActual) => {
    const elementoYaExiste = acumulador.find((elemento) => elemento.name === valorActual.name);
    if (elementoYaExiste) {
      return acumulador.map((elemento) => {
        if (elemento.name == valorActual.name) {
          return {
            ...elemento,
            quantity: elemento.quantity + valorActual.quantity,
          };
        }

        return elemento;
      });
    }

    return [...acumulador, valorActual];
  }, []);

  let productosVendidos = [];
  //   for (const [key, value] of Object.entries(listaduplicados)) {
  //    productosVendidos.push(`${key} *(${value})*`)
  //  productosVendidos.join('\r\n')
  //}
  const prueba2 = () => {
    listaduplicados.map((item) => {
      productosVendidos.push(item.name + ' (' + item.quantity + ')');
    });
    productosVendidos.join('\r\n');
    return productosVendidos;
  };

  const clickCopyOrders = () => {
    const resumeOrder = {
      fecha: date,
      pedidos: pedidos,
      efectivo: formatPrice(efectivo),
      mercadopago: formatPrice(mercadopago),
      total: `*${formatPrice(total)}*`,
      productos: prueba2(),
    };

    let result = [];
    for (const [key, value] of Object.entries(resumeOrder)) {
      result.push(`${key}: ${value}`);
      console.log(result);
    }
    navigator.clipboard.writeText(result.join('\r\n'));
  };

  const clickSave = () => {
    clickCopyOrders();
    setSave(false);
  };

  const clickRemove = () => {
    //dispatch(removeOrders())
    setRemove(false);
  };

  const ipcRenderer =
    (typeof window !== 'undefined' &&
      window.require &&
      window.require('electron') &&
      window.require('electron').ipcRenderer) ||
    null;

  const [updateStatus, setUpdateStatus] = useState('');

  const checkForUpdates = async () => {
    if (!ipcRenderer) {
      setUpdateStatus('IPC no disponible (¿corriendo en navegador?)');
      return;
    }
    try {
      setUpdateStatus('Buscando actualizaciones...');
      const res = await ipcRenderer.invoke('check-for-updates');
      if (res?.error) setUpdateStatus('Error: ' + res.error);
      else if (res.updateAvailable) setUpdateStatus('Nueva versión disponible: v' + res.version);
      else setUpdateStatus('Ya estás en la última versión');
    } catch (e) {
      setUpdateStatus('Error: ' + (e?.message || e));
    }
  };

  const installUpdate = () => {
    if (!ipcRenderer) return;
    ipcRenderer.send('quit-and-install');
  };

  return (
    <Container>
      <PageInner>
        <TitlePage>
          <a>Config</a>
          <span style={{ fontSize: '0.8em', marginLeft: '8px', opacity: 0.7 }}>v{appVersion}</span>
        </TitlePage>
        <ContainerPages>
          <ButtonPage onClick={checkForUpdates}>
            <IconButton>
              <ArrowCircleUpIcon />
            </IconButton>
            <a>Buscar actualización</a>
            <span>
              <ChevronRight />
            </span>
          </ButtonPage>
          {updateStatus && (
            <div style={{ padding: '8px 12px', fontSize: '0.85em' }}>
              {updateStatus}
              {updateStatus.includes('Nueva versión') && (
                <button
                  style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 6 }}
                  onClick={installUpdate}
                >
                  Instalar
                </button>
              )}
            </div>
          )}
          <ButtonPage onClick={() => dispatch(setShowLoginModal(true))}>
            <IconButton>
              <Settings />
            </IconButton>
            <a>Ver Daily Stats</a>
            <span>
              <ChevronRight />
            </span>
          </ButtonPage>
        </ContainerPages>
        <ImportFile setOpen={setOpen} open={open} />
      </PageInner>
      <LoginModal />
    </Container>
  );
};

export default Config;
