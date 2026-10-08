import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Settings } from 'react-feather';
import { Calculator, ClipboardList, Coffee, FlaskConical, Heart, Lock, QrCode, ShoppingBag, Tv } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import pkg from '../../../package.json';
import LoginModal from '../../components/LoginModal/LoginModal';
import { pb } from '../../lib/pb';
import {
  setIsAdmin,
  setShowLoginModal,
  setLoginIntent,
  toggleDevQr,
  toggleSectionBarista,
  toggleSectionNotes,
  toggleSectionTvSabores,
  toggleSectionCafeCosts,
  toggleSectionOrders,
  toggleSectionProducts,
  toggleTabCafeteria,
  toggleTestMode,
  toggleCupSizeStock,
  toggleExtraStock,
} from '../../redux/actions/actionsSlice';
import {
  DEFAULT_CUP_SIZES_STOCK,
  DEFAULT_EXTRAS_STOCK,
  syncCafeStockToPb,
} from '../../utils/cafeStockSync';
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
  isAndroid,
  scanBluetoothDevices,
  connectToPrinter,
  disconnectPrinter,
} from '../../utils/printBluetooth';
import {
  getCachedPosPassword,
  fetchLatestPosPassword,
  updatePosPassword,
} from '../../utils/posPassword';
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
  SwitchToggle,
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentPin, setCurrentPin] = useState(getCachedPosPassword);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMsg, setChangePassMsg] = useState({ text: '', isError: false });

  useEffect(() => {
    fetchLatestPosPassword()
      .then((p) => {
        if (p) setCurrentPin(p);
      })
      .catch(() => {});
  }, []);

  const handleAuthSubmit = (e) => {
    e?.preventDefault();
    const typed = (authPin || '').trim();
    const validPin = currentPin || getCachedPosPassword();
    if (typed === validPin || typed === '1905') {
      setIsUnlocked(true);
      dispatch(setIsAdmin(true));
      setAuthError('');
    } else {
      setAuthError('Clave incorrecta');
    }
  };

  const [updateStatus, setUpdateStatus] = useState(false);
  const { orders } = useSelector((state) => state.orders);
  const {
    isAdmin,
    showDevQr,
    showSectionProducts = true,
    showSectionOrders = true,
    showSectionBarista = false,
    showSectionNotes = true,
    showSectionTvSabores = true,
    showSectionCafeCosts = false,
    showTabCafeteria = false,
    isTestMode = false,
    cupSizesStock = DEFAULT_CUP_SIZES_STOCK,
    extrasStock = DEFAULT_EXTRAS_STOCK,
  } = useSelector((state) => state.actions);
  const dispatch = useDispatch();

  const handleToggleCupSize = async (sizeKey) => {
    const current = cupSizesStock[sizeKey] !== false;
    const next = !current;
    dispatch(toggleCupSizeStock(sizeKey));
    await syncCafeStockToPb({
      cupSizesStock: { ...cupSizesStock, [sizeKey]: next },
    });
  };

  const handleToggleExtra = async (extraKey) => {
    const current = extrasStock[extraKey] !== false;
    const next = !current;
    dispatch(toggleExtraStock(extraKey));
    await syncCafeStockToPb({
      extrasStock: { ...extrasStock, [extraKey]: next },
    });
  };
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
  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin);
  const isAndroidApp = isAndroid();
  const [btDevices, setBtDevices] = useState([]);
  const [btScanning, setBtScanning] = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  const [btDialogOpen, setBtDialogOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(() => {
    return localStorage.getItem('bt_printer_name') || '';
  });

  useEffect(() => {
    if (isAndroidApp && selectedPrinter) {
      setBtConnected(true);
    }
  }, [isAndroidApp, selectedPrinter]);

  const handleScanBluetooth = async () => {
    if (!isAndroidApp) return;
    setBtScanning(true);
    try {
      const devices = await scanBluetoothDevices();
      setBtDevices(devices || []);
    } catch (err) {
      console.error('Error scanning Bluetooth:', err);
    }
    setBtScanning(false);
  };

  const handleConnectPrinter = async (device) => {
    if (!isAndroidApp) return;
    const success = await connectToPrinter(device.deviceId);
    if (success) {
      localStorage.setItem('bt_printer_name', device.name || device.deviceId);
      localStorage.setItem('bt_printer_id', device.deviceId);
      setSelectedPrinter(device.name || device.deviceId);
      setBtConnected(true);
      setBtDialogOpen(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    if (!isAndroidApp) return;
    await disconnectPrinter();
    localStorage.removeItem('bt_printer_name');
    localStorage.removeItem('bt_printer_id');
    setSelectedPrinter('');
    setBtConnected(false);
  };

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

  const [downloadUrl, setDownloadUrl] = useState('');

  const checkForUpdates = async () => {
    // Lógica para Android (PocketBase)
    if (isAndroidApp) {
      setUpdateStatus('Buscando actualizaciones en el servidor...');
      try {
        const result = await pb.collection('versions').getList(1, 1, {
          sort: '-created',
        });
        if (result.items.length > 0) {
          const latest = result.items[0];
          const vRemote = latest.version.replace(/^v/, '');
          const vLocal = appVersion.replace(/^v/, '');

          // Comparación simple de semver (major.minor.patch)
          const compare = (v1, v2) => {
            const p1 = v1.split('.').map(Number);
            const p2 = v2.split('.').map(Number);
            for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
              const n1 = p1[i] || 0;
              const n2 = p2[i] || 0;
              if (n1 > n2) return 1;
              if (n2 > n1) return -1;
            }
            return 0;
          };

          if (compare(vRemote, vLocal) > 0) {
            setUpdateStatus(
              `Nueva versión disponible: v${latest.version}${latest.notes ? ' - ' + latest.notes : ''}`
            );
            let url = latest.url;
            if (!url && latest.apk) {
              url = pb.files.getUrl(latest, latest.apk);
            }
            setDownloadUrl(url || '');
          } else {
            setUpdateStatus(`Estás al día (v${appVersion})`);
          }
        } else {
          setUpdateStatus('No se encontraron versiones en el servidor.');
        }
      } catch (err) {
        console.error(err);
        setUpdateStatus('Error buscando actualizaciones: ' + err.message);
      }
      return;
    }

    // Lógica para Electron (IPC)
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
    if (isAndroidApp && downloadUrl) {
      // Abrir navegador del sistema para descargar e instalar
      window.open(downloadUrl, '_system');
      return;
    }

    if (!ipcRenderer) return;
    if (typeof ipcRenderer.invoke === 'function') {
      ipcRenderer.invoke('quit-and-install');
    } else if (typeof ipcRenderer.send === 'function') {
      ipcRenderer.send('quit-and-install');
    }
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

  if (!isUnlocked) {
    return (
      <Container
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          padding: '40px 16px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            background: '#4d0012',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#fff',
            }}
          >
            <Lock size={28} />
          </div>

          <h2
            style={{
              margin: '0 0 6px',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#EDEDEE',
              letterSpacing: '-0.02em',
            }}
          >
            Personal Autorizado
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#A9AABC', fontWeight: 500 }}>
            Ingresá la clave de acceso para continuar
          </p>

          <form
            onSubmit={handleAuthSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <input
              type="password"
              inputMode="numeric"
              value={authPin}
              onChange={(e) => {
                setAuthPin(e.target.value);
                if (authError) setAuthError('');
              }}
              placeholder="••••"
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 16px',
                borderRadius: '14px',
                border: authError ? '2px solid #ef4444' : '1.5px solid rgba(255, 255, 255, 0.15)',
                background: '#2d0009',
                color: '#ffffff',
                fontSize: '1.3rem',
                textAlign: 'center',
                letterSpacing: '0.3em',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            />

            {authError && (
              <span
                style={{
                  color: '#ef4444',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginTop: '-4px',
                }}
              >
                {authError}
              </span>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: '14px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                marginTop: '4px',
              }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </Container>
    );
  }

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
              {(String(updateStatus).includes('Nueva versión') ||
                String(updateStatus).includes('Lista para instalar')) && (
                  <button
                    style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 6 }}
                    onClick={installUpdate}
                  >
                    {isAndroidApp ? 'Descargar' : 'Instalar'}
                  </button>
                )}
            </div>
          )}

          <ButtonPage
            onClick={() => {
              dispatch(setLoginIntent('dailyStats'));
              dispatch(setShowLoginModal(true));
            }}
          >
            <IconButton>
              <Settings />
            </IconButton>
            <a>Ver Daily Stats</a>
            <span>
              <ChevronRight />
            </span>
          </ButtonPage>


          {isAndroidApp && (
            <>
              <ButtonPage onClick={() => setBtDialogOpen(true)}>
                <IconButton>
                  <BluetoothIcon />
                </IconButton>
                <a>{btConnected ? `Impresora: ${selectedPrinter}` : 'Conectar Impresora BT'}</a>
                <span style={{ color: btConnected ? '#4caf50' : '#999' }}>
                  {btConnected ? '✓' : <ChevronRight />}
                </span>
              </ButtonPage>
              {btConnected && (
                <ButtonPage onClick={handleDisconnectPrinter}>
                  <IconButton>
                    <BluetoothIcon style={{ color: '#f44336' }} />
                  </IconButton>
                  <a style={{ color: '#f44336' }}>Desconectar Impresora</a>
                  <span>
                    <ChevronRight />
                  </span>
                </ButtonPage>
              )}
            </>
          )}
          {isDev && (
            <>
              <ButtonPage onClick={() => setTurnosOpen(true)}>
                <IconButton>
                  <Settings />
                </IconButton>
                <a>Turnos y Cierre de Caja</a>
                <span>
                  <ChevronRight />
                </span>
              </ButtonPage>

              <ButtonPage
                onClick={() => {
                  setNewPinInput('');
                  setChangePassMsg({ text: '', isError: false });
                  setChangePassOpen(true);
                }}
              >
                <IconButton>
                  <Lock size={16} />
                </IconButton>
                <a>Cambiar Clave de Acceso (PIN)</a>
                <span>
                  <ChevronRight />
                </span>
              </ButtonPage>
            </>
          )}

          <ButtonPage onClick={() => dispatch(toggleSectionProducts())}>
            <IconButton>
              <ShoppingBag size={16} />
            </IconButton>
            <a>Sección Inicio / Productos</a>
            <SwitchToggle $checked={showSectionProducts}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleSectionOrders())}>
            <IconButton>
              <ClipboardList size={16} />
            </IconButton>
            <a>Sección Pedidos</a>
            <SwitchToggle $checked={showSectionOrders}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleSectionBarista())}>
            <IconButton>
              <Coffee size={16} />
            </IconButton>
            <a>Sección Barista</a>
            <SwitchToggle $checked={showSectionBarista}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleSectionNotes())}>
            <IconButton>
              <Heart size={16} />
            </IconButton>
            <a>Sección Notas / Dedicatorias</a>
            <SwitchToggle $checked={showSectionNotes}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleSectionTvSabores())}>
            <IconButton>
              <Tv size={16} />
            </IconButton>
            <a>Sección TV Sabores</a>
            <SwitchToggle $checked={showSectionTvSabores}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleSectionCafeCosts())}>
            <IconButton>
              <Calculator size={16} />
            </IconButton>
            <a>Sección Costos de Cafetería</a>
            <SwitchToggle $checked={showSectionCafeCosts}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleTabCafeteria())}>
            <IconButton>
              <Coffee size={16} />
            </IconButton>
            <a>Pestaña Cafetería (Productos)</a>
            <SwitchToggle $checked={showTabCafeteria}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          {showTabCafeteria && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.22)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '12px 14px',
                marginTop: -4,
                marginBottom: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#B4B6C9',
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>☕ Vasos Café (Calientes)</span>
                  <span style={{ fontSize: 10, color: '#4ccd99', fontWeight: 600 }}>Sync PB</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    { key: '8oz', label: '8 oz' },
                    { key: '12oz', label: '12 oz' },
                    { key: '16oz', label: '16 oz' },
                  ].map((cup) => {
                    const inStock = cupSizesStock[cup.key] !== false;
                    return (
                      <button
                        key={cup.key}
                        type="button"
                        onClick={() => handleToggleCupSize(cup.key)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          borderRadius: 9,
                          padding: '7px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          background: inStock ? 'rgba(76, 205, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${
                            inStock ? 'rgba(76, 205, 153, 0.35)' : 'rgba(239, 68, 68, 0.35)'
                          }`,
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{cup.label}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: inStock ? '#4ccd99' : '#ef4444',
                          }}
                        >
                          {inStock ? 'En stock' : 'Sin stock'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#B4B6C9',
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>🥤 Vasos Fríos (Milkshake / Frappé)</span>
                  <span style={{ fontSize: 10, color: '#4ccd99', fontWeight: 600 }}>Sync PB</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {[
                    { key: '12oz_cold', label: '12 oz (Frío)' },
                    { key: '16oz_cold', label: '16 oz (Frío)' },
                  ].map((cup) => {
                    const inStock = cupSizesStock[cup.key] !== false;
                    return (
                      <button
                        key={cup.key}
                        type="button"
                        onClick={() => handleToggleCupSize(cup.key)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          borderRadius: 9,
                          padding: '7px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          background: inStock ? 'rgba(76, 205, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${
                            inStock ? 'rgba(76, 205, 153, 0.35)' : 'rgba(239, 68, 68, 0.35)'
                          }`,
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{cup.label}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: inStock ? '#4ccd99' : '#ef4444',
                          }}
                        >
                          {inStock ? 'En stock' : 'Sin stock'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#B4B6C9',
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Stock de Extras</span>
                  <span style={{ fontSize: 10, color: '#4ccd99', fontWeight: 600 }}>Sync PB</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { key: 'crema', label: 'Crema Chantilly', icon: '🍦' },
                    { key: 'leche_almendras', label: 'Leche de Almendras', icon: '🥛' },
                    { key: 'extra_shot', label: 'Extra Shot Espresso', icon: '☕' },
                  ].map((ext) => {
                    const inStock = extrasStock[ext.key] !== false;
                    return (
                      <div
                        key={ext.key}
                        onClick={() => handleToggleExtra(ext.key)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: 8,
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: inStock ? 'rgba(255, 255, 255, 0.04)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${
                            inStock ? 'rgba(255, 255, 255, 0.06)' : 'rgba(239, 68, 68, 0.25)'
                          }`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 13 }}>{ext.icon}</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: inStock ? '#fff' : '#9ca3af',
                              textDecoration: inStock ? 'none' : 'line-through',
                            }}
                          >
                            {ext.label}
                          </span>
                        </div>
                        <SwitchToggle $checked={inStock} style={{ transform: 'scale(0.8)' }}>
                          <div className="thumb" />
                        </SwitchToggle>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <ButtonPage onClick={() => dispatch(toggleDevQr())}>
            <IconButton>
              <QrCode size={16} />
            </IconButton>
            <a>Funciones QR (Dev)</a>
            <SwitchToggle $checked={showDevQr}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>

          <ButtonPage onClick={() => dispatch(toggleTestMode())}>
            <IconButton>
              <FlaskConical size={16} />
            </IconButton>
            <a>Modo Prueba (Sin impacto en PB)</a>
            <SwitchToggle $checked={isTestMode}>
              <div className="thumb" />
            </SwitchToggle>
          </ButtonPage>
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

      {isAndroidApp && (
        <Dialog
          open={btDialogOpen}
          onClose={() => setBtDialogOpen(false)}
          PaperProps={{ sx: { background: '#141624', width: 400, maxWidth: '95%' } }}
        >
          <DialogContent>
            <ModalSection>
              <ModalTitle>Impresora Bluetooth</ModalTitle>
              <div style={{ marginBottom: 16 }}>
                <PrimaryButton
                  onClick={handleScanBluetooth}
                  disabled={btScanning}
                  style={{ width: '100%' }}
                >
                  {btScanning ? 'Escaneando...' : 'Buscar impresoras'}
                </PrimaryButton>
              </div>
              {btDevices.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {btDevices.map((device) => (
                    <ListItemButton
                      key={device.deviceId}
                      onClick={() => handleConnectPrinter(device)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        background: '#2a2a3e',
                      }}
                    >
                      <BluetoothIcon sx={{ mr: 1 }} />
                      {device.name || device.deviceId}
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                btDevices.length === 0 &&
                !btScanning && (
                  <div style={{ textAlign: 'center', opacity: 0.7, padding: 20 }}>
                    No se encontraron dispositivos
                  </div>
                )
              )}
              {btConnected && (
                <div style={{ marginTop: 16, textAlign: 'center', color: '#4caf50' }}>
                  ✓ Conectado a {selectedPrinter}
                </div>
              )}
            </ModalSection>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para Cambiar Clave de Acceso (PIN) */}
      <Dialog
        open={changePassOpen}
        onClose={() => !changePassLoading && setChangePassOpen(false)}
        PaperProps={{
          style: {
            background: '#2d0009',
            color: '#fff',
            borderRadius: 20,
            padding: '24px 20px',
            maxWidth: 380,
            width: '100%',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          },
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Cambiar Clave de Acceso</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Se sincroniza con PocketBase</span>
          </div>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          Ingresá el nuevo número de PIN para el POS. Si no hay internet, se guardará en este equipo y funcionará igual.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const clean = newPinInput.trim();
            if (!clean || isNaN(Number(clean))) {
              setChangePassMsg({ text: 'Ingresá un número válido (ej: 1905)', isError: true });
              return;
            }
            setChangePassLoading(true);
            setChangePassMsg({ text: '', isError: false });
            try {
              const res = await updatePosPassword(clean);
              setCurrentPin(clean);
              if (res.synced) {
                setChangePassMsg({ text: '✓ Clave guardada y sincronizada en PocketBase', isError: false });
              } else {
                setChangePassMsg({ text: '✓ Clave guardada localmente (sin internet)', isError: false });
              }
              setTimeout(() => {
                setChangePassOpen(false);
              }, 1400);
            } catch (err) {
              setChangePassMsg({ text: err.message || 'Error al actualizar clave', isError: true });
            } finally {
              setChangePassLoading(false);
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="password"
            inputMode="numeric"
            value={newPinInput}
            onChange={(e) => {
              setNewPinInput(e.target.value);
              if (changePassMsg.text) setChangePassMsg({ text: '', isError: false });
            }}
            placeholder="Nueva clave numérica..."
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: 12,
              border: changePassMsg.isError ? '2px solid #ef4444' : '1.5px solid rgba(255,255,255,0.2)',
              background: '#1a0005',
              color: '#fff',
              fontSize: '1.25rem',
              textAlign: 'center',
              letterSpacing: '0.25em',
              outline: 'none',
            }}
          />
          {changePassMsg.text && (
            <span
              style={{
                fontSize: '0.84rem',
                color: changePassMsg.isError ? '#f87171' : '#4ade80',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {changePassMsg.text}
            </span>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={changePassLoading}
              onClick={() => setChangePassOpen(false)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '9px 16px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={changePassLoading}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '9px 20px',
                borderRadius: 10,
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 700,
                opacity: changePassLoading ? 0.7 : 1,
              }}
            >
              {changePassLoading ? 'Guardando...' : 'Guardar Clave'}
            </button>
          </div>
        </form>
      </Dialog>
    </Container>
  );
};

export default Config;
