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

  const deliveryOptions = (allProducts || [])
    .filter((p) => p?.category === 'Delivery')
    .map((p) => ({
      key: p.id,
      label: p.name,
      price: Number(p.price || 0),
    }))
    .sort((a, b) => a.price - b.price); // 👈 orden por precio (asc)

  const generateId = uniqid();
  const dispatch = useDispatch();
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
      envioTarifa: 0, // 0 | 1000 | 1500
      envioOpcion: null,
      direccion: 'Retiro', // 'envio1' | 'envio2' | null
    },
  });

  function validateEfectivo() {
    const mode = getValues('modePago');
    if (mode !== 'efectivo') return true;
    const val = Number(getValues('pago') || 0);
    if (val <= 0) {
      setError('pago', { type: 'manual', message: 'Debe ser mayor a 0' });
      return false;
    }
    clearErrors('pago');
    return true;
  }

  // Formateador seguro: convierte falsy/"" a 0
  const fmt = (v) => formatPrice(Number(v || 0));

  const pagoState = useSelector((state) => state.actions.pago);
  const isEfectivo = useSelector((state) => state.actions.toggleEfectivo);
  const isRetiro = useSelector((state) => state.actions.toggleAddress);
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

    const ef = Number(getValues('pagoEfectivo') || 0);
    const mp = Number(getValues('pagoMp') || 0);
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
    if (!validateMixtoTotal() || !validateEfectivo()) {
      // no seguimos con el flujo: NO crear orden, NO avanzar
      return;
    }
    // no cierres acá; cerramos en finally
    dispatch(toggleFinishOrder(true));

    const dir = getValues('direccion') || 'Retiro';
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
      envioOpcion: getValues('envioOpcion'), // nuevo: 'envio1' | 'envio2'
      pago: isEfectivo ? pagoState : 'Transferencia',
      cambio: Number((pagoState || 0) - (price || 0)),
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
        pago: 'Mixto',
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
      orderToSave = {
        ...orderToSave,
        pago: Number(pagoState || 0), // tu UI venía guardando el importe pagado en efectivo
        cambio: Math.max(0, Number(pagoState || 0) - orderToSave.total),
      };
      methodForOrder = 'efectivo';
      paidAmountForDaily = { efectivo: Number(pagoState || 0) }; // tu UI puede permitir >, = o <
      // revenueAmount = total
    } else {
      // TRANSFERENCIA
      orderToSave = {
        ...orderToSave,
        pago: 'Transferencia',
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
      console.error('PB detail:', err?.status, err?.data || err);
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
      formEl.style.setProperty('--summary-h', `${h}px`);
    });
    ro.observe(totalEl);
    // kick inicial
    formEl.style.setProperty('--summary-h', `${totalEl.offsetHeight || 0}px`);
    return () => ro.disconnect();
  }, []);

  return (
    <ContentForm ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
                  {cambio > 0 && <StatusPill kind="warn">Cambio {formatPrice(cambio)}</StatusPill>}
                  {falta > 0 && <StatusPill kind="bad">Falta {formatPrice(falta)}</StatusPill>}
                  {cambio === 0 && falta === 0 && (
                    <StatusPill kind="ok" style={{ fontSize: 15 }}>
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
                  {pagoState > finalTotal && (
                    <StatusPill kind="warn">
                      Cambio {formatPrice(pagoState - finalTotal)}
                    </StatusPill>
                  )}
                  {pagoState < finalTotal && (
                    <StatusPill kind="bad">Falta {formatPrice(finalTotal - pagoState)}</StatusPill>
                  )}
                  {pagoState === finalTotal && (
                    <StatusPill kind="ok" style={{ fontSize: 15 }}>
                      Abona justo
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
                  Transferencia
                </Pill>
              </Row>
            </AnimSection>
          )}
        </SummaryBox>
        <ButtonNext type="submit">Crear Pedido</ButtonNext>
      </TotalFinish>
    </ContentForm>
  );
};

export default ContainerFinish;
