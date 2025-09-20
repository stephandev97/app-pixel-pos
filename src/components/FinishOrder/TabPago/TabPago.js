import React, { useEffect, useState } from 'react';
import { BsCash } from 'react-icons/bs';
import { FaEquals } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import mpIcon from '../../../assets/mercadopago.png';
import { changePago, toggleEfectivo } from '../../../redux/actions/actionsSlice';
import {
  AnimSection,
  ButtonPaste,
  ButtonToggle,
  Icon,
  Input,
  InputGroup,
  Prefix,
  StaggerList,
  Tab,
} from '../ContainerFinish/ContainerFinishStyles';
import { TabContainer } from './TabPagoStyles';

const stripLeadingZeros = (raw) => {
  const s = String(raw ?? '');
  if (s === '' || s === '0') return s === '0' ? '' : '';
  const cleaned = s.replace(/[^\d]/g, '');
  // Evitar "000", "0123" -> "123"
  const noZeros = cleaned.replace(/^0+/, '');
  return noZeros === '' ? '' : noZeros;
};

const TabPago = ({ watch, price, isEfectivo, register, setValue, errors }) => {
  const dispatch = useDispatch();
  const pagoState = useSelector((s) => s.actions.pago);
  const [isMixed, setIsMixed] = useState(false);
  const [mpAuto, setMpAuto] = useState(true);

  useEffect(() => {
    setValue('modePago', isMixed ? 'mixto' : isEfectivo ? 'efectivo' : 'transferencia');
  }, [isMixed, isEfectivo, setValue]);

  useEffect(() => {
    if (isMixed) {
      const envio = Number(watch('envioTarifa') || 0);
      const total = Number(price || 0) + envio;
      setValue('pagoEfectivo', '', { shouldValidate: true });
      setValue('pagoMp', total, { shouldValidate: true });
    }
  }, [isMixed, price, watch, setValue]);

  const clickPasteTotal = () => {
    const envio = Number(watch('envioTarifa') || 0);
    const tot = Number(price || 0) + envio;
    dispatch(changePago(tot));
    setValue('pago', tot, { shouldValidate: true });
  };

  const formatWithDollar = (val) => {
    if (!val) return ''; // vacío = no muestra nada
    return `$ ${val}`; // muestra con $
  };

  const stripDollar = (val) => {
    return val.replace(/[^\d]/g, ''); // elimina todo menos números
  };

  return (
    <TabContainer>
      <Tab>
        <ButtonToggle
          type="button"
          role="tab"
          aria-selected={!isMixed && isEfectivo}
          data-active={!isMixed && isEfectivo}
          onClick={() => {
            setIsMixed(false);
            dispatch(toggleEfectivo(true));
          }}
        >
          Efectivo
        </ButtonToggle>
        <ButtonToggle
          type="button"
          role="tab"
          aria-selected={!isMixed && !isEfectivo}
          data-active={!isMixed && !isEfectivo}
          onClick={() => {
            setIsMixed(false);
            dispatch(toggleEfectivo(false));
          }}
        >
          MercadoPago
        </ButtonToggle>
        <ButtonToggle
          type="button"
          role="tab"
          aria-selected={isMixed}
          data-active={isMixed}
          onClick={() => setIsMixed(true)}
        >
          Mixto
        </ButtonToggle>
      </Tab>

      <input type="hidden" {...register('modePago')} />

      {/* EFECTIVO */}
      {!isMixed && isEfectivo && (
        <AnimSection>
          <InputGroup>
            <Icon>
              <BsCash />
            </Icon>
            <Input
              {...register('pago')}
              aria-invalid={!!errors?.pago}
              value={formatWithDollar(watch('pago'))}
              onChange={(e) => {
                const raw = stripDollar(e.target.value);
                setValue('pago', raw, { shouldValidate: true });
                dispatch(changePago(raw));
              }}
              placeholder="Ingresa el monto recibido"
              inputMode="numeric"
              style={{ paddingLeft: '56px' }} // evita solaparse con el ícono
            />
            <ButtonPaste type="button" onClick={clickPasteTotal} title="Igualar al total">
              <FaEquals />
            </ButtonPaste>
          </InputGroup>
        </AnimSection>
      )}

      {/* TRANSFERENCIA */}
      {!isMixed && !isEfectivo && (
        <AnimSection>
          <InputGroup>
            <Icon>
              <img
                src={mpIcon}
                alt="MercadoPago"
                width="20"
                height="20"
                style={{ display: 'block' }}
              />
            </Icon>
            <Input disabled value="Transferencia" />
          </InputGroup>
        </AnimSection>
      )}

      {/* MIXTO */}
      {isMixed && (
        <AnimSection>
          <StaggerList>
            <InputGroup>
              <Icon>
                <BsCash />
              </Icon>
              <Input
                aria-invalid={!!errors?.pagoEfectivo}
                value={formatWithDollar(watch('pagoEfectivo'))} // 👈 mostrar con $
                onChange={(e) => {
                  const raw = stripDollar(e.target.value); // limpiar $
                  setValue('pagoEfectivo', raw, { shouldValidate: true }); // guardar solo número
                  if (!mpAuto) return;
                  const ef = Number(raw || 0);
                  const envio = Number(watch('envioTarifa') || 0);
                  const resto = Math.max(0, Number(price || 0) + envio - ef);
                  setValue('pagoMp', resto, { shouldValidate: true });
                }}
                placeholder="Efectivo"
                inputMode="numeric"
                style={{ paddingLeft: '56px' }}
              />
            </InputGroup>

            <InputGroup>
              <Icon style={{ color: '#2563eb' }}>
                <img
                  src={mpIcon}
                  alt="MercadoPago"
                  width="20"
                  height="20"
                  style={{ display: 'block' }}
                />
              </Icon>
              <Input
                aria-invalid={!!errors?.pagoMp}
                value={formatWithDollar(watch('pagoMp'))}
                onChange={(e) => {
                  const raw = stripDollar(e.target.value);
                  setValue('pagoMp', raw, { shouldValidate: true });
                  setMpAuto(false);
                }}
                placeholder="MercadoPago"
                inputMode="numeric"
                style={{ paddingLeft: '60px' }}
              />
            </InputGroup>
          </StaggerList>
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabPago;
