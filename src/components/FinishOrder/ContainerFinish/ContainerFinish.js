import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import uniqid from 'uniqid';

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
  BottomSpacer,
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
} from './ContainerFinishStyles';
import { useMemo, useEffect, useRef } from 'react';
import { BsCash } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import { MdOutlineClear, MdOutlineCurrencyExchange } from 'react-icons/md';

function getMixtoFromForm(getValues) {
  const ef = Number(getValues('pagoEfectivo') || 0);
  const mp = Number(getValues('pagoMp') || 0);
  return {
    ef,
    mp,
    detalle: `EF $${ef} + MP $${mp}`,
    paidMap: {
      ...(ef > 0 ? { efectivo: ef } : {}),
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

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      modePago: 'efectivo',
      pago: '',
      pagoEfectivo: '',
      pagoMp: '',
      envioTarifa: 0,
      envioOpcion: null,
      direccion: isRetiro ? 'Retiro' : '', // 👈 ahora respeta el toggle
    },
  });

  function validateEfectivo() {
    const mode = getValues('modePago');
    if (mode !== 'efectivo') return true;
    const val = Number(getValues('pago') || 0);
    const tot = Number(price || 0) + Number(getValues('envioTarifa') || 0);
    if (val <= 0) {
      setError('pago', { type: 'manual', message: 'Debe ser mayor a 0' });
      return false;
    }
    if (val < tot) {
      setError('pago', { type: 'manual', message: 'El efectivo no cubre el total' });
      // opcional: enfocar el input
      try {
        document.querySelector('input[name="pago"]')?.focus();
      } catch {}
      return false;
    }
    clearErrors('pago');
    return true;
  }

  // Formateador seguro: convierte falsy/"" a 0
  const fmt = (v) => formatPrice(Number(v || 0));

  const pagoState = useSelector((state) => state.actions.pago);
  const isEfectivo = useSelector((state) => state.actions.toggleEfectivo);
  const CUTOFF_HOUR = 3; // 3 AM

  const modePagoWatch = watch('modePago');
  const efWatch = Number(watch('pagoEfectivo') || 0);
  const mpWatch = Number(watch('pagoMp') || 0);
  const totalNum = Number(price || 0);
  const shippingWatch = Number(watch('envioTarifa') || 0);
  const finalTotal = totalNum + shippingWatch;

  const totalPagado =
    modePagoWatch === 'mixto'
      ? efWatch + mpWatch
      : isEfectivo
        ? Number(pagoState || 0)
        : finalTotal;
  const cambio = Math.max(0, totalPagado - finalTotal);
  const falta = Math.max(0, finalTotal - totalPagado);

  const updatePago = (e) => {
    const value = e.target.value;
    dispatch(changePago(value));
    setValue('pago', value, { shouldValidate: true });
    console.log(value);
  };

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
    const mode = getValues('modePago'); // "mixto" | "efectivo" | "transferencia"
    if (mode !== 'mixto') return true;

    const parseNum = (v) => Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
    const ef = parseNum(getValues('pagoEfectivo'));
    const mp = parseNum(getValues('pagoMp'));
    const tot = Number(price || 0) + Number(getValues('envioTarifa') || 0);
    let ok = true;

    // EF > 0
    if (ef <= 0) {
      setError('pagoEfectivo', { type: 'manual', message: 'Debe ser mayor a 0' });
      ok = false;
    } else {
      clearErrors('pagoEfectivo');
    }

    // MP > 0
    if (mp <= 0) {
      setError('pagoMp', { type: 'manual', message: 'Debe ser mayor a 0' });
      ok = false;
    } else {
      clearErrors('pagoMp');
    }

    // EF + MP >= total
    if (ef + mp < tot) {
      // marcá ambos para resaltar los dos campos
      setError('pagoEfectivo', { type: 'manual', message: 'La suma debe cubrir el total' });
      setError('pagoMp', { type: 'manual', message: 'La suma debe cubrir el total' });
      ok = false;
    }

    return ok;
  }

  const onSubmit = async () => {
    // validaciones específicas por modo
    const modePago = getValues('modePago');
    const tot = Number(price || 0) + Number(getValues('envioTarifa') || 0);

    // 🔒 EFECTIVO: debe ser ≥ total + envío
    if (modePago === 'efectivo') {
      const val = Number(getValues('pago') || 0);
      if (!(val >= tot)) {
        setError('pago', { type: 'manual', message: 'El efectivo debe ser ≥ Total + Envío' });
        try {
          document.querySelector('input[name="pago"]')?.focus();
        } catch {}
        return; // 🚫 CORTA EL SUBMIT
      }
    }

    // Mixto mantiene su validación actual
    if (!validateMixtoTotal()) return;
    // no cierres acá; cerramos en finally
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

    // Base de la orden (común a todos los modos)
    const baseOrder = {
      number: typeof generateId === 'function' ? generateId() : generateId,
      items: cartItems,
      direccion: dir,
      total: finalTotal,
      envio: shippingWatch, // nuevo: guarda el costo de envío
      ...(getValues('envioOpcion') ? { envioOpcion: getValues('envioOpcion') } : {}),
      pago: 0, // ← SIEMPRE número; lo seteamos por modo abajo
      cambio: 0, // ← se recalcula abajo
      check: mode === 'retiro',
      hora: time,
    };

    const modePagoSel = getValues('modePago');
    let orderToSave = { ...baseOrder };

    // Variables para el daily / metadatos
    let methodForOrder = null; // para guardar en la orden si querés (opcional)
    let paidAmountForDaily = {}; // MAPA -> {efectivo: X, transferencia: Y}
    let revenueAmount = orderToSave.total; // ya incluye envío

    if (modePagoSel === 'mixto') {
      // Tomar valores del form (no uses 'target')
      const { ef, mp, detalle, paidMap } = getMixtoFromForm(getValues);
      const tot = Number(price) || 0;

      if (ef <= 0 || mp <= 0) {
        alert('En pago Mixto, EF y MP deben ser mayores a 0.');
        return;
      }
      if (ef + mp < tot) {
        alert('En pago Mixto, la suma no puede ser menor al total.');
        return;
      }

      orderToSave = {
        ...orderToSave,
        pago: ef + mp,
        pagoEfectivo: ef,
        pagoMp: mp,
        pagoDetalle: detalle,
        cambio: Math.max(0, ef + mp - orderToSave.total),
      };

      // Para daily: pasamos el MAPA y dejamos method nulo (lo distribuirá por paidAmount)
      methodForOrder = 'mixto'; // si querés etiquetar la orden
      paidAmountForDaily = paidMap; // <- clave para repartir en daily
      // revenueAmount ya es el total de la venta
    } else if (isEfectivo) {
      // EFECTIVO simple
      const pagoNum = Number(pagoState || 0);
      orderToSave = {
        ...orderToSave,
        pago: pagoNum,
        cambio: Math.max(0, pagoNum - orderToSave.total),
      };
      methodForOrder = 'efectivo';
      paidAmountForDaily = { efectivo: Number(pagoState || 0) }; // tu UI puede permitir >, = o <
      // revenueAmount = total
    } else {
      // TRANSFERENCIA
      orderToSave = {
        ...orderToSave,
        pago: orderToSave.total, // número
        pagoEfectivo: 0, // <- importante
        pagoMp: orderToSave.total, // <- acá lo marcamos como MP
        pagoDetalle: 'Transferencia', // opcional pero útil
        cambio: 0,
      };
      methodForOrder = 'transferencia';
      paidAmountForDaily = { transferencia: orderToSave.total };
      // revenueAmount = total
    }

    try {
      // 1) Crear orden en PB (incluyendo desglose)
      await dispatch(
        addOrderOnBoth({
          ...orderToSave,
          method: methodForOrder, // opcional, útil para analytics de la orden
          paidAmount: paidAmountForDaily, // puede ser MAPA (PB lo guarda como JSON)
          revenueAmount, // ingreso por la venta (== total)
          businessDate,
          mode,
          address,
        })
      ).unwrap();

      // 2) Actualizar DAILY (usa el MAPA para repartir por método)
      await Promise.allSettled([
        upsertDailyStatsJsonSmart({
          day: businessDate,
          addRevenue: revenueAmount,
          addOrders: 1,
          addItems: itemsCountFrom(cartItems),
          paidAmount: paidAmountForDaily, // 👈 acá va el MAPA
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
      ]);
    } catch (err) {
      // Intenta leer todas las formas típicas del error de PB
      const pb = err?.data || err?.response?.data || err?.originalError?.data || err;

      // Mensajes útiles
      const msg = pb?.message || err?.message || 'Unknown error';
      const fields = pb?.data || pb?.error || pb?.errors || null;

      // Log crudo y bonito
      console.group('PB create error');
      console.log('message:', msg);
      console.log('fields:', fields);
      console.log('raw error:', err);
      try {
        console.log(
          'raw error (stringified):',
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        );
      } catch {}
      // Muy útil: ver exactamente qué estás mandando
      console.log('payload sent:', {
        ...orderToSave,
        method: methodForOrder,
        paidAmount: paidAmountForDaily,
        revenueAmount,
        businessDate,
        mode,
        address,
      });
      console.groupEnd();
      return;
    } finally {
      // 3) Reset UI / estado
      dispatch(clearCart());
      dispatch(changePago('')); // deja el input vacío
      dispatch(toggleHiddenFinish(true));
      dispatch(toggleHiddenCart(true));
      dispatch(toggleAddress(true));
      dispatch(toggleEfectivo(true));
      setValue('direccion', 'Retiro');
      setValue('modePago', 'efectivo');
      setValue('pagoEfectivo', '');
      setValue('pagoMp', '');
      setValue('envioTarifa', 0);
      setValue('envioOpcion', null);
    }
  };

  // 🔧 Ajusta --summary-h según el alto real del TotalFinish (summary + botón)
  useEffect(() => {
    const formEl = formRef.current;
    const totalEl = totalRef.current;
    if (!formEl || !totalEl) return;
    const ro = new ResizeObserver(() => {
      const h = totalEl.offsetHeight || 0;
      const hRounded = Math.ceil(h); // evita 0.5px “fantasma”
      formEl.style.setProperty('--summary-h', `${hRounded}px`);
    });
    ro.observe(totalEl);
    // kick inicial
    formEl.style.setProperty('--summary-h', `${Math.ceil(totalEl.offsetHeight || 0)}px`);
    return () => ro.disconnect();
  }, []);

  return (
    <ContentForm ref={formRef} onSubmit={handleSubmit(onSubmit)} style={{ overflow: 'hidden' }}>
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
          isEfectivo={isEfectivo}
          price={price}
          updatePago={updatePago}
          register={register}
          setValue={setValue}
          getValues={getValues}
          /* NUEVO */
          errors={errors}
          required
        />
      </ContentTabs>
      {/* Reserva espacio para que no se tape con el summary fijo */}
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
        <ButtonNext type="submit" style={{ width: '90%', height: '55px' }}>
          Crear Pedido
        </ButtonNext>
      </TotalFinish>
    </ContentForm>
  );
};

export default ContainerFinish;
