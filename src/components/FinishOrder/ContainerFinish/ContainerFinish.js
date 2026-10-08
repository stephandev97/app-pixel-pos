import { CreditCard } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BsCash } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import { MdOutlineClear, MdOutlineCurrencyExchange } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import uniqid from 'uniqid';

import { pb } from '../../../lib/pb';
import mpIconWhite from '../../../assets/mercadopagowhite.png';
import {
  changePago,
  toggleAddress,
  toggleEfectivo,
  toggleFinishOrder,
  toggleHiddenCart,
  toggleHiddenFinish,
} from '../../../redux/actions/actionsSlice';
import { clearCart } from '../../../redux/cart/cartSlice';
import { addOrderOnBoth } from '../../../redux/orders/ordersSlice';
import { formatPrice } from '../../../utils/formatPrice';
import {
  detectFulfillment,
  getBusinessDate,
  itemsCountFrom,
  upsertCustomerFromOrder,
  upsertDailyStatsJsonSmart,
} from '../../../utils/stats';
import { ButtonNext } from '../../Checkout/styles/ProductsCheckoutStyles';
import TabDireccion from '../TabDireccion/TabDireccion';
import TabPago from '../TabPago/TabPago';
import {
  AnimSection,
  ContentForm,
  ContentTabs,
  Label,
  Pill,
  RightChips,
  Row,
  StatusPill,
  SummaryBox,
  TotalFinish,
  Value,
} from '../ContainerFinish/ContainerFinishStyles';

function parseCleanInt(v) {
  if (v === null || v === undefined) return 0;
  const str = String(v).trim();
  const withoutComma = str.includes(',') ? str.split(',')[0] : str;
  const digitsOnly = withoutComma.replace(/[^\d]/g, '');
  return digitsOnly ? Math.floor(Number(digitsOnly)) : 0;
}

function getMixtoFromForm(getValues) {
  const ef = parseCleanInt(getValues('pagoEfectivo'));
  const mp = parseCleanInt(getValues('pagoMp'));
  const deb = parseCleanInt(getValues('pagoDebito'));

  const parts = [];
  if (ef > 0) parts.push(`EF $${ef}`);
  if (deb > 0) parts.push(`DÉB $${deb}`);
  if (mp > 0) parts.push(`MP $${mp}`);

  return {
    ef,
    mp,
    deb,
    detalle: parts.join(' + '),
    paidMap: {
      ...(ef > 0 ? { efectivo: ef } : {}),
      ...(deb > 0 ? { debito: deb } : {}),
      ...(mp > 0 ? { transferencia: mp } : {}),
    },
  };
}

function toDayString(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const ContainerFinish = ({ cartItems, price }) => {
  const formRef = useRef(null);
  const totalRef = useRef(null);

  const fromRedux = useSelector((s) => s.products?.products);
  const fromCache = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_products_v1') || '[]');
    } catch {
      return [];
    }
  }, []);
  const allProducts = Array.isArray(fromRedux) && fromRedux.length ? fromRedux : fromCache;

  const deliveryOptions = useMemo(() => {
    return (allProducts || [])
      .filter((p) => p?.category === 'Delivery')
      .map((p) => ({ key: p.id, label: p.name, price: Number(p.price || 0) }))
      .sort((a, b) => a.price - b.price);
  }, [allProducts]);

  const generateId = uniqid();
  const dispatch = useDispatch();

  const isRetiro = useSelector((state) => state.actions.toggleAddress);
  const deliveryInfo = useSelector((state) => state.cart?.deliveryInfo);
  const pagoState = useSelector((state) => state.actions.pago);
  const isEfectivo = useSelector((state) => state.actions.toggleEfectivo);
  const isTestMode = useSelector((state) => state.actions.isTestMode);
  const orders = useSelector((state) => state.orders?.orders || []);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      modePago: 'efectivo',
      pago: '',
      pagoEfectivo: '',
      pagoMp: '',
      pagoDebito: '',
      envioTarifa: Number(deliveryInfo?.envioTarifa || 0),
      envioOpcion: deliveryInfo?.envioOpcion || null,
      direccion: deliveryInfo?.direccion || (isRetiro ? 'Retiro' : ''),
    },
  });

  useEffect(() => {
    if (deliveryInfo) {
      if (deliveryInfo.direccion) {
        setValue('direccion', deliveryInfo.direccion, { shouldValidate: true });
      }
      if (deliveryInfo.envioTarifa !== undefined) {
        setValue('envioTarifa', Number(deliveryInfo.envioTarifa || 0), { shouldValidate: true });
      }
      if (deliveryInfo.envioOpcion) {
        setValue('envioOpcion', deliveryInfo.envioOpcion, { shouldValidate: true });
      }
    }
  }, [deliveryInfo, setValue]);

  // Formateador seguro
  const fmt = (v) => formatPrice(Number(v || 0));

  const CUTOFF_HOUR = 3; // 3 AM

  const modePagoWatch = watch('modePago');
  const efWatch = parseCleanInt(watch('pagoEfectivo'));
  const mpWatch = parseCleanInt(watch('pagoMp'));
  const debWatch = parseCleanInt(watch('pagoDebito'));
  const shippingWatch = Math.round(Number(watch('envioTarifa') || 0));
  const totalNum = Math.round(Number(price || 0));
  const finalTotal = totalNum + shippingWatch;

  const prevFinalTotalRef = useRef(finalTotal);

  // Auto-ajuste de pago cuando cambia la tarifa de envío o el total
  useEffect(() => {
    const prevTot = prevFinalTotalRef.current;
    if (prevTot !== finalTotal) {
      // 1. Efectivo: si el pago cargado coincidía con el total anterior o quedó menor al nuevo total, actualizar al nuevo total
      const rawPago = getValues('pago');
      const numPago = parseCleanInt(rawPago);

      if (numPago > 0 && (numPago === prevTot || numPago < finalTotal)) {
        setValue('pago', finalTotal, { shouldValidate: true });
        dispatch(changePago(finalTotal));
      }

      // 2. Mixto: si ya había montos y cubrían el total anterior, ajustar automáticamente el método secundario
      const modePago = getValues('modePago');
      if (modePago === 'mixto') {
        const ef = parseCleanInt(getValues('pagoEfectivo'));
        const mp = parseCleanInt(getValues('pagoMp'));
        const deb = parseCleanInt(getValues('pagoDebito'));

        if (ef + mp + deb === prevTot) {
          if (ef > 0 && deb > 0) {
            setValue('pagoDebito', Math.max(0, finalTotal - ef), { shouldValidate: true });
          } else if (deb > 0 && mp > 0) {
            setValue('pagoMp', Math.max(0, finalTotal - deb), { shouldValidate: true });
          } else if (ef > 0 && mp > 0) {
            setValue('pagoMp', Math.max(0, finalTotal - ef), { shouldValidate: true });
          } else if (mp === prevTot) {
            setValue('pagoMp', finalTotal, { shouldValidate: true });
          } else if (deb === prevTot) {
            setValue('pagoDebito', finalTotal, { shouldValidate: true });
          } else if (ef === prevTot) {
            setValue('pagoEfectivo', finalTotal, { shouldValidate: true });
          }
        }
      }

      prevFinalTotalRef.current = finalTotal;
    }
  }, [finalTotal, getValues, setValue, dispatch]);

  // Validación extra Manual para Mixto (ya que useForm register a veces no tiene acceso a todo el scope fácil)
  const isMixtoValid = useMemo(() => {
    if (modePagoWatch !== 'mixto') return true;
    const activeCount = (efWatch > 0 ? 1 : 0) + (mpWatch > 0 ? 1 : 0) + (debWatch > 0 ? 1 : 0);
    if (activeCount < 2) return false;
    // Tolerancia de $1 por redondeos
    const diff = efWatch + mpWatch + debWatch - finalTotal;
    return diff >= -1;
  }, [modePagoWatch, efWatch, mpWatch, debWatch, finalTotal]);

  const isDisabled = !isValid || !isMixtoValid;

  const [justEnabled, setJustEnabled] = useState(false);

  useEffect(() => {
    if (justEnabled) {
      const timer = setTimeout(() => setJustEnabled(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [justEnabled]);

  useEffect(() => {
    if (!isDisabled) {
      setJustEnabled(true);
    }
  }, [isDisabled]);

  const totalPagado =
    modePagoWatch === 'mixto'
      ? efWatch + mpWatch + debWatch
      : isEfectivo
        ? Number(pagoState || 0)
        : finalTotal;

  const cambio = Math.max(0, totalPagado - finalTotal);
  const falta = Math.max(0, finalTotal - totalPagado);

  useEffect(() => {
    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevOverscroll = style.overscrollBehavior;
    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    return () => {
      style.overflow = prevOverflow;
      style.overscrollBehavior = prevOverscroll || '';
    };
  }, []);

  function validateMixtoTotal() {
    const mode = getValues('modePago');
    if (mode !== 'mixto') return true;

    const parseNum = (v) => Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
    const ef = parseNum(getValues('pagoEfectivo'));
    const mp = parseNum(getValues('pagoMp'));
    const deb = parseNum(getValues('pagoDebito'));
    const tot = Number(price || 0) + Number(getValues('envioTarifa') || 0);

    const activeCount = (ef > 0 ? 1 : 0) + (mp > 0 ? 1 : 0) + (deb > 0 ? 1 : 0);
    if (activeCount < 2) {
      return false;
    }
    if (ef + mp + deb < tot) {
      return false;
    }

    return true;
  }

  const onSubmit = async () => {
    const modePago = getValues('modePago');
    const tot = Number(price || 0) + Number(getValues('envioTarifa') || 0);

    // EFECTIVO: debe cubrir total + envío
    if (modePago === 'efectivo') {
      const val = parseCleanInt(getValues('pago'));
      if (!(val >= tot)) {
        setError('pago', { type: 'manual', message: 'El efectivo debe ser ≥ Total + Envío' });
        try {
          document.querySelector('input[name="pago"]')?.focus();
        } catch (e) {
          console.error('focus pago input error', e);
        }
        return;
      }
    }

    if (!validateMixtoTotal()) return;

    dispatch(toggleFinishOrder(true));

    const dir = getValues('direccion') || 'Retiro';
    if (!isRetiro && !dir.trim()) {
      setError('direccion', { type: 'manual', message: 'Ingresá la dirección' });
      return;
    }

    const { mode, address } = detectFulfillment(dir);

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const businessDate = toDayString(getBusinessDate(now, CUTOFF_HOUR));

    const baseOrder = {
      number: typeof generateId === 'function' ? generateId() : generateId,
      items: cartItems,
      direccion: dir,
      total: finalTotal,
      envio: shippingWatch,
      envioOpcion: getValues('envioOpcion'),
      pago: 0,
      cambio: 0,
      check: mode === 'retiro',
      hora: time,
    };
    console.log('DEBUG ContainerFinish - baseOrder:', baseOrder);

    const modePagoSel = getValues('modePago');
    let orderToSave = { ...baseOrder };

    let methodForOrder = null;
    let paidAmountForDaily = {};
    let revenueAmount = orderToSave.total;

    if (modePagoSel === 'mixto') {
      const { ef, mp, deb, detalle, paidMap } = getMixtoFromForm(getValues);
      const totMixto = orderToSave.total; // incluye envío
      const totalIngresado = ef + mp + deb;
      const activeCount = (ef > 0 ? 1 : 0) + (mp > 0 ? 1 : 0) + (deb > 0 ? 1 : 0);

      if (activeCount < 2) {
        alert('En pago Mixto, debes ingresar al menos 2 métodos de pago mayores a 0.');
        return;
      }
      if (totalIngresado < totMixto) {
        alert('En pago Mixto, la suma no puede ser menor al total.');
        return;
      }

      orderToSave = {
        ...orderToSave,
        pago: totalIngresado,
        pagoEfectivo: ef,
        pagoMp: mp,
        pagoDebito: deb,
        pagoDetalle: detalle,
        cambio: Math.max(0, totalIngresado - orderToSave.total),
      };

      methodForOrder = 'mixto';
      paidAmountForDaily = paidMap;
    } else if (modePagoSel === 'debito') {
      // DÉBITO
      orderToSave = {
        ...orderToSave,
        pago: orderToSave.total,
        pagoEfectivo: 0,
        pagoMp: 0,
        pagoDebito: orderToSave.total,
        pagoDetalle: 'Débito',
        cambio: 0,
      };

      methodForOrder = 'debito';
      paidAmountForDaily = { debito: orderToSave.total };
    } else if (isEfectivo) {
      // EFECTIVO simple
      const pagoNum = parseCleanInt(pagoState || getValues('pago'));
      orderToSave = {
        ...orderToSave,
        pago: pagoNum,
        pagoEfectivo: pagoNum,
        pagoMp: 0,
        pagoDebito: 0,
        cambio: Math.max(0, pagoNum - orderToSave.total),
      };

      methodForOrder = 'efectivo';
      paidAmountForDaily = { efectivo: pagoNum };
    } else {
      // TRANSFERENCIA
      orderToSave = {
        ...orderToSave,
        pago: orderToSave.total,
        pagoEfectivo: 0,
        pagoMp: orderToSave.total,
        pagoDebito: 0,
        pagoDetalle: 'Transferencia',
        cambio: 0,
      };

      methodForOrder = 'transferencia';
      paidAmountForDaily = { transferencia: orderToSave.total };
    }

    try {
      await dispatch(
        addOrderOnBoth({
          ...orderToSave,
          method: methodForOrder,
          paidAmount: paidAmountForDaily,
          revenueAmount,
          businessDate,
          mode,
          address,
        })
      ).unwrap();

      // Actualizar stats en background (sin await para no bloquear UI) solo si NO es modo prueba
      if (!isTestMode) {
        Promise.allSettled([
          upsertDailyStatsJsonSmart({
            day: businessDate,
            addRevenue: revenueAmount,
            addOrders: 1,
            addItems: itemsCountFrom(cartItems),
            paidAmount: paidAmountForDaily,
            method: Object.keys(paidAmountForDaily).length ? null : methodForOrder,
            mode,
            address,
            sign: +1,
            pruneZero: true,
            deleteIfEmpty: false,
          }),
          mode === 'delivery' && address
            ? upsertCustomerFromOrder({
                address,
                phone: getValues('telefono') ?? null,
                name: getValues('nombre') ?? null,
                total: revenueAmount,
                businessDate,
                sign: +1,
              })
            : Promise.resolve(),
        ]).catch((err) => {
          console.warn('Stats update failed (non-blocking):', err);
        });
      }
    } catch (err) {
      if (!isTestMode) {
        // Si falla y NO es modo prueba, reintentamos en background sin bloquear UI
        const orderData = {
          ...orderToSave,
          method: methodForOrder,
          paidAmount: paidAmountForDaily,
          revenueAmount,
          businessDate,
          mode,
          address,
          clientCreatedAt: Date.now(),
        };

        // Retry upload order (10 intentos, cada 5s)
        let attempts = 0;
        const maxAttempts = 10;
        const uploadOrderRetry = () => {
          if (attempts >= maxAttempts) return;
          attempts++;
          pb.collection('orders')
            .create(orderData)
            .then(() => console.log('Order synced to PB:', orderData.id))
            .catch(() => setTimeout(uploadOrderRetry, 5000));
        };
        uploadOrderRetry();

        // Retry stats
        attempts = 0;
        const statsData = {
          day: businessDate,
          addRevenue: revenueAmount,
          addOrders: 1,
          addItems: itemsCountFrom(cartItems),
          paidAmount: paidAmountForDaily,
          method: Object.keys(paidAmountForDaily).length ? null : methodForOrder,
          mode,
          address,
          sign: +1,
          pruneZero: true,
          deleteIfEmpty: false,
        };
        const statsRetry = () => {
          if (attempts >= maxAttempts) return;
          attempts++;
          upsertDailyStatsJsonSmart(statsData)
            .then(() => console.log('Stats synced to PB'))
            .catch(() => setTimeout(statsRetry, 5000));
        };
        statsRetry();
      }
    } finally {
      dispatch(clearCart());
      dispatch(changePago(''));
      dispatch(toggleHiddenFinish(true));
      dispatch(toggleHiddenCart(true));
      dispatch(toggleAddress(true));
      dispatch(toggleEfectivo(true));
      setValue('direccion', 'Retiro');
      setValue('modePago', 'efectivo');
      setValue('pagoEfectivo', '');
      setValue('pagoMp', '');
      setValue('pagoDebito', '');
      setValue('envioTarifa', 0);
      setValue('envioOpcion', null);
    }
  };

  // ResizeObserver removed as TotalFinish is now relative

  return (
    <ContentForm ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate>
      <ContentTabs>
        <TabDireccion
          isRetiro={isRetiro}
          register={register}
          setValue={setValue}
          watch={watch}
          required
          deliveryOptions={deliveryOptions}
        />
        <TabPago
          watch={watch}
          price={price}
          register={register}
          setValue={setValue}
          errors={errors}
          isRetiro={isRetiro}
          required
          trigger={trigger}
          clearErrors={clearErrors}
        />
      </ContentTabs>

      <TotalFinish ref={totalRef}>
        <SummaryBox>
          <Row>
            <Label>
              Total
              {shippingWatch > 0 && (
                <span
                  style={{
                    fontWeight: 800,
                    opacity: 0.6,
                    fontSize: 16,
                    marginLeft: 5,
                    color: '#23853cff',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 800 }}> (+{fmt(shippingWatch)} </span>
                  envío)
                </span>
              )}
            </Label>
            <Value>{fmt(finalTotal)}</Value>
          </Row>

          {watch('modePago') === 'mixto' ? (
            <>
              <AnimSection>
                <Row>
                  <Label>Paga</Label>
                  <RightChips>
                    {Number(watch('pagoEfectivo') || 0) > 0 && (
                      <Pill kind="ef">
                        <BsCash size={17} style={{ display: 'block', marginRight: '0.4em' }} />{' '}
                        {fmt(watch('pagoEfectivo'))}
                      </Pill>
                    )}
                    {Number(watch('pagoDebito') || 0) > 0 && (
                      <Pill style={{ background: '#0f766e', color: 'white', fontSize: 16 }}>
                        <CreditCard size={17} style={{ display: 'block', marginRight: '0.4em' }} />{' '}
                        {fmt(watch('pagoDebito'))}
                      </Pill>
                    )}
                    {Number(watch('pagoMp') || 0) > 0 && (
                      <Pill kind="mp">
                        <img
                          src={mpIconWhite}
                          alt="MercadoPago"
                          width="20"
                          height="20"
                          style={{ display: 'block', marginRight: '0.4em' }}
                        />{' '}
                        {fmt(watch('pagoMp'))}
                      </Pill>
                    )}
                    {Number(watch('pagoEfectivo') || 0) === 0 &&
                      Number(watch('pagoDebito') || 0) === 0 &&
                      Number(watch('pagoMp') || 0) === 0 && <Pill>Sin definir</Pill>}
                  </RightChips>
                </Row>
              </AnimSection>

              <AnimSection>
                <Row>
                  <Label>Estado</Label>
                  {cambio > 0 && (
                    <StatusPill kind="warn" style={{ fontSize: 16 }}>
                      <MdOutlineCurrencyExchange style={{ marginRight: 5 }} />
                      Cambio {formatPrice(cambio)}
                    </StatusPill>
                  )}
                  {falta > 0 && <StatusPill kind="bad">Falta {formatPrice(falta)}</StatusPill>}
                  {cambio === 0 && falta === 0 && (
                    <StatusPill kind="ok" style={{ fontSize: 16 }}>
                      <FaCheck style={{ marginRight: 5 }} />
                      Abona justo
                    </StatusPill>
                  )}
                </Row>
              </AnimSection>
            </>
          ) : isEfectivo ? (
            <>
              <AnimSection>
                <Row>
                  <Label>Paga</Label>
                  <Value>{fmt(pagoState)}</Value>
                </Row>
              </AnimSection>

              <AnimSection>
                <Row>
                  <Label>Estado</Label>
                  {Number(pagoState) > finalTotal && (
                    <StatusPill kind="warn" style={{ fontSize: 16 }}>
                      <MdOutlineCurrencyExchange style={{ marginRight: 5 }} />
                      Cambio {formatPrice(pagoState - finalTotal)}
                    </StatusPill>
                  )}
                  {pagoState < finalTotal && (
                    <StatusPill kind="bad" style={{ fontSize: 16 }}>
                      <MdOutlineClear style={{ marginRight: 5 }} />
                      Falta {formatPrice(finalTotal - pagoState)}
                    </StatusPill>
                  )}
                  {pagoState === finalTotal && (
                    <StatusPill kind="ok" style={{ fontSize: 16 }}>
                      <FaCheck style={{ marginRight: 5 }} /> Abona justo
                    </StatusPill>
                  )}
                </Row>
              </AnimSection>
            </>
          ) : watch('modePago') === 'debito' ? (
            <AnimSection>
              <Row>
                <Label>Paga</Label>
                <Pill style={{ background: '#0f766e', color: 'white', fontSize: 16, gap: 6 }}>
                  <CreditCard size={17} /> Débito
                </Pill>
              </Row>
            </AnimSection>
          ) : (
            <AnimSection>
              <Row>
                <Label>Paga</Label>
                <Pill style={{ background: '#2563eb', color: 'white', fontSize: 16 }}>
                  <img
                    src={mpIconWhite}
                    alt="MercadoPago"
                    width="20"
                    height="20"
                    style={{ display: 'block', marginRight: '0.4em' }}
                  />{' '}
                  Transferencia
                </Pill>
              </Row>
            </AnimSection>
          )}
        </SummaryBox>

        <ButtonNext
          type="submit"
          disabled={isDisabled}
          $justEnabled={justEnabled}
          style={{
            width: '100%',
            maxWidth: '580px',
            height: '56px',
            fontSize: '1.3rem',
            marginBottom: '12px',
          }}
        >
          <span>Crear Pedido</span>
        </ButtonNext>
      </TotalFinish>
    </ContentForm>
  );
};

export default ContainerFinish;
