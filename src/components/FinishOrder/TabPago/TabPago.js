import React, { useEffect, useState } from 'react';
import { BsCash } from 'react-icons/bs';
import { FaEquals } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import mpIcon from '../../../assets/mercadopago.png';
import { changePago, toggleEfectivo } from '../../../redux/actions/actionsSlice';
import {
  ButtonPaste,
  ButtonToggle,
  Icon,
  Input,
  InputGroup,
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

const TabPago = ({ price, updatePago, isEfectivo, register, setValue, errors }) => {
  const dispatch = useDispatch();
  const pagoState = useSelector((s) => s.actions.pago);
  const [isMixed, setIsMixed] = useState(false);
  const [mpAuto, setMpAuto] = useState(true);

  useEffect(() => {
    setValue('modePago', isMixed ? 'mixto' : isEfectivo ? 'efectivo' : 'transferencia');
  }, [isMixed, isEfectivo, setValue]);

  useEffect(() => {
    if (isMixed) {
      const total = Number(price || 0);
      // antes: setValue("pagoEfectivo", 0, ...)
      setValue('pagoEfectivo', '', { shouldValidate: true });
      setValue('pagoMp', total, { shouldValidate: true });
    }
  }, [isMixed, price, setValue]);

  const clickPasteTotal = () => {
    dispatch(changePago(price));
    setValue('pago', price, { shouldValidate: true });
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
        <InputGroup>
          <Icon>
            <BsCash />
          </Icon>
          <Input
            aria-invalid={!!errors?.pago}
            // Mostrar vacío si el estado es 0
            value={pagoState ? String(pagoState) : ''}
            {...register('pago', {
              required: true,
              min: Number(price || 0),
              onChange: (e) => {
                const v = stripLeadingZeros(e.target.value);
                e.target.value = v;
                // mantener tu flujo original
                updatePago(e);
              },
            })}
            onFocus={(e) => {
              if (e.target.value === '0') e.target.value = '';
            }}
            placeholder="Ingresa el monto recibido"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <ButtonPaste type="button" onClick={clickPasteTotal} title="Igualar al total">
            <FaEquals />
          </ButtonPaste>
        </InputGroup>
      )}

      {/* TRANSFERENCIA */}
      {!isMixed && !isEfectivo && (
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
      )}

      {/* MIXTO */}
      {isMixed && (
        <>
          <InputGroup>
            <Icon>
              <BsCash />
            </Icon>
            <Input
              aria-invalid={!!errors?.pagoEfectivo}
              {...register('pagoEfectivo', {
                required: true,
                min: 0,
                onChange: (e) => {
                  const v = stripLeadingZeros(e.target.value);
                  e.target.value = v;
                  if (!mpAuto) return;
                  const ef = Number(v || 0);
                  const resto = Math.max(0, Number(price || 0) - ef);
                  setValue('pagoMp', resto, { shouldValidate: true });
                },
              })}
              onFocus={(e) => {
                if (e.target.value === '0') e.target.value = '';
              }}
              placeholder="Efectivo"
              inputMode="numeric"
              pattern="[0-9]*"
              style={{ paddingLeft: '40px' }}
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
              {...register('pagoMp', {
                required: true,
                min: 0,
                onChange: (e) => {
                  setMpAuto(false);
                  const v = stripLeadingZeros(e.target.value);
                  e.target.value = v;
                },
              })}
              onFocus={(e) => {
                if (e.target.value === '0') e.target.value = '';
              }}
              placeholder="MercadoPago"
              inputMode="numeric"
              pattern="[0-9]*"
              style={{ paddingLeft: '44px' }}
            />
          </InputGroup>
        </>
      )}
    </TabContainer>
  );
};

export default TabPago;
