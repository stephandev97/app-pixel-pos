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
      pagoEfectivo: '',
      pagoMp: '',
    },
  });

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

  const totalPagado =
    modePagoWatch === 'mixto' ? efWatch + mpWatch : isEfectivo ? Number(pagoState || 0) : totalNum;

  const cambio = Math.max(0, totalPagado - totalNum);
  const falta = Math.max(0, totalNum - totalPagado);

  const updatePago = (e) => {
    const value = e.target.value;
    dispatch(changePago(value));
    setValue('pago', value, { shouldValidate: true });
    console.log(value);
  };

  function validateMixtoTotal() {
    const mode = getValues('modePago'); // "mixto" | "efectivo" | "transferencia"
    if (mode !== 'mixto') return true;

    const ef = Number(getValues('pagoEfectivo') || 0);
    const mp = Number(getValues('pagoMp') || 0);
    const tot = Number(price) || 0; // asumo que price = total de la orden

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
    if (!validateMixtoTotal()) {
      // no seguimos con el flujo: NO crear orden, NO avanzar
      return;
    }
    // no cierres acá; cerramos en finally
    dispatch(toggleFinishOrder(true));

    const dir = getValues('direccion');
    const { mode, address } = detectFulfillment(dir);

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const businessDate = toDayString(getBusinessDate(now, CUTOFF_HOUR));

    // Base de la orden (común a todos los modos)
    const baseOrder = {
      number: typeof generateId === 'function' ? generateId() : generateId,
      items: cartItems,
      direccion: dir,
      total: Number(price || 0),
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
    let revenueAmount = orderToSave.total;

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
      paidAmountForDaily = { efectivo: Number(pagoState || 0) };
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
    }
  };

  return (
    <ContentForm onSubmit={handleSubmit(onSubmit)}>
      <ContentTabs>
        <TabDireccion isRetiro={isRetiro} register={register} setValue={setValue} required />
        <TabPago
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
      <TotalFinish>
        <SummaryBox>
          <Row>
            <Label>Total</Label>
            <Value>{fmt(price)}</Value>
          </Row>

          {watch('modePago') === 'mixto' ? (
            <>
              <Row>
                <Label>Paga</Label>
                <RightChips>
                  {Number(watch('pagoEfectivo') || 0) > 0 && (
                    <Pill kind="ef"> ... {fmt(watch('pagoEfectivo'))}</Pill>
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
              <Row>
                <Label>Estado</Label>
                {cambio > 0 && <StatusPill kind="warn">Cambio {formatPrice(cambio)}</StatusPill>}
                {falta > 0 && <StatusPill kind="bad">Falta {formatPrice(falta)}</StatusPill>}
                {cambio === 0 && falta === 0 && <StatusPill kind="ok">Justo</StatusPill>}
              </Row>
            </>
          ) : isEfectivo ? (
            <>
              <Row>
                <Label>Paga</Label>
                <Value>{fmt(pagoState)}</Value>
              </Row>
              <Row>
                <Label>Estado</Label>
                {pagoState > price && (
                  <StatusPill kind="warn">Cambio {formatPrice(pagoState - price)}</StatusPill>
                )}
                {pagoState < price && (
                  <StatusPill kind="bad">Falta {formatPrice(price - pagoState)}</StatusPill>
                )}
                {pagoState === price && <StatusPill kind="ok">Justo</StatusPill>}
              </Row>
            </>
          ) : (
            <Row>
              <Label>Paga</Label>
              <Pill style={{ background: '#2563eb', color: 'white' }}>Transferencia</Pill>
            </Row>
          )}
        </SummaryBox>
        <ButtonNext type="submit">Crear Pedido</ButtonNext>
      </TotalFinish>
    </ContentForm>
  );
};

export default ContainerFinish;
