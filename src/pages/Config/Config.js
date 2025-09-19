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

  return (
    <Container>
      <PageInner>
        {save ? (
          <>
            <Background />
            <MsjNav style={{ background: '#04a485' }}>
              <span>¿Guardar pedidos?</span>
              <div>
                <MsjButton onClick={() => clickSave()} style={{ color: '#4CCD99' }}>
                  <Check />
                </MsjButton>
                <MsjButton onClick={() => setSave(false)} style={{ color: '#4CCD99' }}>
                  <X />
                </MsjButton>
              </div>
            </MsjNav>
          </>
        ) : (
          <>
            <Background style={{ display: 'none' }} />
            <MsjNav style={{ transform: 'translateY(800px)' }} />
          </>
        )}
        {remove ? (
          <>
            <Background />
            <MsjNav style={{ background: '#D20062' }}>
              <span>¿Borrar pedidos?</span>
              <div>
                <MsjButton onClick={() => clickRemove()}>
                  <Check />
                </MsjButton>
                <MsjButton onClick={() => setRemove(false)}>
                  <X />
                </MsjButton>
              </div>
            </MsjNav>
          </>
        ) : (
          <>
            <Background style={{ display: 'none' }} />
            <MsjNav style={{ transform: 'translateY(800px)' }} />
          </>
        )}
        <TitlePage>
          <a>Config</a>
        </TitlePage>
        <ContainerPages>
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
