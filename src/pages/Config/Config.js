import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useMemo, useState, useEffect } from 'react';
import { ChevronRight, Settings } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';

import pkg from '../../../package.json'; // ajustá el path
import LoginModal from '../../components/LoginModal/LoginModal';
import { pb } from '../../lib/pb';
import { setShowLoginModal } from '../../redux/actions/actionsSlice';
import {
  addFileSabores,
  addListPro,
  removeProducts,
  removeSabores,
} from '../../redux/data/dataSlice';
import { formatPrice } from '../../utils/formatPrice';
import { getOrderCashNet } from '../../utils/payments';
import { computeBusinessDate } from '../../utils/stats';
import {
  ActionsRow,
  ButtonPage,
  ButtonUpload,
  Container,
  ContainerPages,
  ContentInput,
  ContentUploadFile,
  DenomInput,
  DenomItem,
  DenomLabel,
  DenomsGrid,
  DenomsTitle,
  IconButton,
  InputFile,
  ModalGridRows,
  ModalSection,
  ModalTitle,
  PageInner,
  PrimaryButton,
  RowLabel,
  RowLine,
  RowValue,
  SecondaryButton,
  TitlePage,
  TitleUpload,
} from './ConfigStyles';
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
  const [open, setOpen] = useState(false);
  const [turnosOpen, setTurnosOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [showDenoms, setShowDenoms] = useState(false);
  const [confirmFinalOpen, setConfirmFinalOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [lastCloseMs, setLastCloseMs] = useState(() => {
    const s = localStorage.getItem('shift_last_close_ms');
    return s ? Number(s) : null;
  });
  const isDev =
    typeof window !== 'undefined' && window.location && window.location.protocol === 'http:';
  const [denoms, setDenoms] = useState({
    20000: '',
    10000: '',
    2000: '',
    1000: '',
    500: '',
    200: '',
    100: '',
    50: '',
    20: '',
    10: '',
  });

  const getShiftWindow = () => {
    const now = new Date();
    const h = now.getHours();
    const atHourMs = (base, hour, addDays = 0) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + addDays);
      dt.setHours(hour, 0, 0, 0);
      return dt.getTime();
    };
    if (h >= 11 && h < 18) {
      return {
        kind: '11-18',
        active: true,
        startMs: atHourMs(now, 11, 0),
        endMs: atHourMs(now, 18, 0),
      };
    }
    if (h >= 18 || h < 3) {
      const startMs = h >= 18 ? atHourMs(now, 18, 0) : atHourMs(now, 18, -1);
      const endMs = h >= 18 ? atHourMs(now, 3, 1) : atHourMs(now, 3, 0);
      return { kind: '18-03', active: true, startMs, endMs };
    }
    return { kind: 'fuera', active: false, startMs: null, endMs: null };
  };
  const getShiftWindowForClosure = () => {
    const now = new Date();
    const h = now.getHours();
    const atHourMs = (base, hour, addDays = 0) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + addDays);
      dt.setHours(hour, 0, 0, 0);
      return dt.getTime();
    };
    if (h >= 11 && h < 18) {
      return {
        kind: '11-18',
        startMs: atHourMs(now, 11, 0),
        endMs: atHourMs(now, 18, 0),
      };
    }
    if (h >= 18) {
      return { kind: '18-03', startMs: atHourMs(now, 18, 0), endMs: atHourMs(now, 3, 1) };
    }
    if (h < 3) {
      return { kind: '18-03', startMs: atHourMs(now, 18, -1), endMs: atHourMs(now, 3, 0) };
    }
    return { kind: '11-18', startMs: atHourMs(now, 11, 0), endMs: atHourMs(now, 18, 0) };
  };
  const getShiftStartMs = () => {
    const now = new Date();
    const base = new Date(now);
    if (now.getHours() < 3) base.setDate(base.getDate() - 1);
    base.setHours(11, 0, 0, 0);
    const businessStartMs = base.getTime();
    const lc = Number(lastCloseMs || 0);
    if (!lc || !Number.isFinite(lc) || lc < 0) return businessStartMs;
    // Si el último cierre es anterior al inicio del día de negocio, ignorarlo
    // Si es dentro del día, usarlo para empezar desde ese momento
    return Math.max(lc, businessStartMs);
  };

  const denomValues = useMemo(() => [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10], []);

  const countedEf = useMemo(() => {
    return denomValues.reduce((acc, v) => {
      const qty = Number(denoms[v] || 0);
      return acc + v * qty;
    }, 0);
  }, [denoms, denomValues]);

  const efectivoForOrder = (o) => getOrderCashNet(o);

  const ordersDuringShift = useMemo(() => {
    const nowMs = Date.now();
    const startMs = getShiftStartMs();
    return orders.filter((o) => {
      const ms =
        typeof o.clientCreatedAt === 'number'
          ? o.clientCreatedAt
          : o.created
            ? Date.parse(o.created)
            : 0;
      return startMs ? ms >= startMs && ms < nowMs : false;
    });
  }, [orders, lastCloseMs]);

  const sumEf = useMemo(
    () => ordersDuringShift.reduce((a, o) => a + efectivoForOrder(o), 0),
    [ordersDuringShift]
  );
  const sumTotal = useMemo(
    () => ordersDuringShift.reduce((a, o) => a + Number(o.total || 0), 0),
    [ordersDuringShift]
  );
  const initialCash = 26000;

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

  const ipcRenderer =
    (typeof window !== 'undefined' && window.electron && window.electron.ipcRenderer) ||
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

  useEffect(() => {
    if (!ipcRenderer) return;
    const onProgress = (_e, percent) => {
      const p = Math.round(Number(percent) || 0);
      setUpdateStatus('Descargando actualización: ' + p + '%');
    };
    const onReady = () => {
      setUpdateStatus('Descarga completa. Lista para instalar');
    };
    ipcRenderer.on('update-progress', onProgress);
    ipcRenderer.on('update-ready', onReady);
    return () => {
      ipcRenderer.removeListener('update-progress', onProgress);
      ipcRenderer.removeListener('update-ready', onReady);
    };
  }, [ipcRenderer]);

  const installUpdate = () => {
    if (!ipcRenderer) return;
    ipcRenderer.send('quit-and-install');
  };

  const cerrarTurno = () => {
    const w = getShiftWindowForClosure();
    const endMs = Date.now();
    const report = {
      start: new Date(w.startMs).toLocaleString(),
      end: new Date(endMs).toLocaleString(),
      pedidos: ordersDuringShift.length,
      efectivoEsperado: sumEf,
      contadoEfectivo: countedEf,
      diferencia: countedEf - (sumEf + initialCash),
      total: sumTotal,
    };
    localStorage.setItem('shift_last_report', JSON.stringify(report));
    localStorage.setItem('shift_last_close_ms', String(endMs));
    setLastCloseMs(endMs);
    const lines = [
      `Turno: ${w.kind}`,
      `Inicio: ${report.start}`,
      `Cierre manual: ${report.end}`,
      `Pedidos: ${report.pedidos}`,
      `Total efectivo: ${formatPrice(report.efectivoEsperado)}`,
      `Contado efectivo: ${formatPrice(report.contadoEfectivo)}`,
      `Diferencia: ${formatPrice(report.diferencia)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));

    const startMs = lastCloseMs ?? w.startMs;
    const denominations = Object.fromEntries(
      Object.entries(denoms).map(([k, v]) => [k, Number(v || 0)])
    );
    const payload = {
      businessDay: computeBusinessDate(new Date(endMs), 3),
      shiftKind: w.kind,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      ordersCount: ordersDuringShift.length,
      totalCashExpected: Number(sumEf || 0),
      totalCashCounted: Number(countedEf || 0),
      difference: Number(countedEf - (sumEf + initialCash) || 0),
      denominations,
      operator: employeeName || null,
      notes: null,
    };
    pb.collection('shift_closures')
      .create(payload)
      .catch(() => { });
    setDenoms({
      20000: '',
      10000: '',
      2000: '',
      1000: '',
      500: '',
      200: '',
      100: '',
      50: '',
      20: '',
      10: '',
    });
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
              {(updateStatus.includes('Nueva versión') ||
                updateStatus.includes('Lista para instalar')) && (
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
          {isDev && (
            <ButtonPage onClick={() => setTurnosOpen(true)}>
              <IconButton>
                <Settings />
              </IconButton>
              <a>Turnos y Cierre de Caja</a>
              <span>
                <ChevronRight />
              </span>
            </ButtonPage>
          )}
        </ContainerPages>
        <ImportFile setOpen={setOpen} open={open} />
      </PageInner>
      <LoginModal />

      {isDev && (
        <Dialog
          open={turnosOpen}
          onClose={() => setTurnosOpen(false)}
          PaperProps={{ sx: { background: '#141624', width: 560, maxWidth: '95%' } }}
        >
          <DialogContent>
            <ModalSection>
              <ModalTitle>Turno {getShiftWindowForClosure().kind}</ModalTitle>
              <ModalGridRows>
                <RowLine>
                  <RowLabel>Inicio</RowLabel>
                  <RowValue>{new Date(getShiftStartMs()).toLocaleString()}</RowValue>
                </RowLine>
                <RowLine>
                  <RowLabel>Caja Inicial (Cambio)</RowLabel>
                  <RowValue>{formatPrice(initialCash)}</RowValue>
                </RowLine>
                <RowLine>
                  <RowLabel>Efectivo</RowLabel>
                  <RowValue>{formatPrice(sumEf)}</RowValue>
                </RowLine>
              </ModalGridRows>

              {!showDenoms ? (
                <ActionsRow>
                  <PrimaryButton onClick={() => setConfirmCloseOpen(true)}>
                    Cerrar turno
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => {
                      const now = new Date();
                      const base = new Date(now);
                      if (now.getHours() < 3) base.setDate(base.getDate() - 1);
                      base.setHours(11, 0, 0, 0);
                      const reset = base.getTime();
                      localStorage.setItem('shift_last_close_ms', String(reset));
                      setLastCloseMs(reset);
                    }}
                  >
                    Reiniciar turno (dev)
                  </SecondaryButton>
                  <SecondaryButton onClick={() => setTurnosOpen(false)}>Salir</SecondaryButton>
                </ActionsRow>
              ) : (
                <>
                  <DenomsTitle>Contar billetes</DenomsTitle>
                  <DenomsTitle>Pedidos en el turno</DenomsTitle>
                  <div style={{ maxHeight: 240, overflow: 'auto' }}>
                    <ModalGridRows>
                      {ordersDuringShift.slice(0, 50).map((o) => (
                        <RowLine key={o.id}>
                          <RowLabel>
                            #{String(o.number || o.id).slice(-6)}{' '}
                            {String(o.method || o.pago || '')
                              .toLowerCase()
                              .includes('transferencia')
                              ? 'Transferencia'
                              : String(o.method || o.pago || '')
                                .toLowerCase()
                                .includes('debito')
                                ? 'Débito'
                                : String(o.method || o.pago || '')
                                  .toLowerCase()
                                  .includes('mixto')
                                  ? 'Mixto'
                                  : 'Efectivo'}
                          </RowLabel>
                          <RowValue>{formatPrice(efectivoForOrder(o))}</RowValue>
                        </RowLine>
                      ))}
                    </ModalGridRows>
                  </div>
                  <DenomsGrid>
                    {denomValues.map((v) => (
                      <DenomItem key={v}>
                        <DenomLabel>${v}</DenomLabel>
                        <DenomInput
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={denoms[v]}
                          onChange={(e) =>
                            setDenoms((d) => ({
                              ...d,
                              [v]: e.target.value.replace(/[^\d]/g, ''),
                            }))
                          }
                        />
                      </DenomItem>
                    ))}
                  </DenomsGrid>
                  <ModalGridRows>
                    <RowLine>
                      <RowLabel>Efectivo Contabilizado</RowLabel>
                      <RowValue>{formatPrice(countedEf)}</RowValue>
                    </RowLine>
                    <RowLine>
                      <RowLabel>Diferencia</RowLabel>
                      <RowValue
                        data-variant={countedEf - (sumEf + initialCash) < 0 ? 'danger' : undefined}
                      >
                        {formatPrice(countedEf - (sumEf + initialCash))}
                      </RowValue>
                    </RowLine>
                  </ModalGridRows>
                  <ActionsRow>
                    <PrimaryButton
                      onClick={() => {
                        setConfirmFinalOpen(true);
                      }}
                    >
                      Confirmar cierre
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setTurnosOpen(false)}>Salir</SecondaryButton>
                  </ActionsRow>
                </>
              )}
            </ModalSection>
          </DialogContent>
        </Dialog>
      )}
      {isDev && (
        <Dialog
          open={confirmFinalOpen}
          onClose={() => setConfirmFinalOpen(false)}
          PaperProps={{ sx: { background: '#141624', width: 480, maxWidth: '95%' } }}
        >
          <DialogContent>
            <ModalSection>
              <ModalTitle>Confirmar cierre</ModalTitle>
              <ModalGridRows>
                <RowLine>
                  <RowLabel>Diferencia</RowLabel>
                  <RowValue
                    data-variant={countedEf - (sumEf + initialCash) < 0 ? 'danger' : undefined}
                  >
                    {formatPrice(countedEf - (sumEf + initialCash))}
                  </RowValue>
                </RowLine>
              </ModalGridRows>
              {countedEf - (sumEf + initialCash) < 0 && (
                <div style={{ marginTop: 12 }}>
                  <DenomLabel style={{ marginBottom: 10 }}>Empleado en caja</DenomLabel>
                  <DenomInput
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Nombre del empleado"
                    required
                  />
                  {String(employeeName).trim() === '' && (
                    <div style={{ color: '#D20062', marginTop: 6, fontSize: '0.9em' }}>
                      Ingresá el nombre del empleado
                    </div>
                  )}
                </div>
              )}
              <ActionsRow>
                <SecondaryButton onClick={() => setConfirmFinalOpen(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton
                  disabled={
                    countedEf - (sumEf + initialCash) < 0 && String(employeeName).trim() === ''
                  }
                  onClick={() => {
                    cerrarTurno();
                    setConfirmFinalOpen(false);
                    setShowDenoms(false);
                    setTurnosOpen(false);
                    setEmployeeName('');
                  }}
                >
                  Confirmar
                </PrimaryButton>
              </ActionsRow>
            </ModalSection>
          </DialogContent>
        </Dialog>
      )}
      {isDev && (
        <Dialog
          open={confirmCloseOpen}
          onClose={() => setConfirmCloseOpen(false)}
          PaperProps={{ sx: { background: '#141624', width: 420, maxWidth: '95%' } }}
        >
          <DialogContent>
            <ModalSection>
              <ModalTitle>Confirmar cierre de turno</ModalTitle>
              <div>
                Se contará hasta el momento actual y luego podrás ingresar las denominaciones para
                confirmar.
              </div>
              <ActionsRow>
                <SecondaryButton onClick={() => setConfirmCloseOpen(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => {
                    setConfirmCloseOpen(false);
                    setShowDenoms(true);
                  }}
                >
                  Continuar
                </PrimaryButton>
              </ActionsRow>
              <ActionsRow>
                <SecondaryButton
                  onClick={() => {
                    const now = new Date();
                    const base = new Date(now);
                    if (now.getHours() < 3) base.setDate(base.getDate() - 1);
                    base.setHours(11, 0, 0, 0);
                    const reset = base.getTime();
                    localStorage.setItem('shift_last_close_ms', String(reset));
                    setLastCloseMs(reset);
                  }}
                >
                  Reiniciar turno (dev)
                </SecondaryButton>
              </ActionsRow>
            </ModalSection>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default Config;
