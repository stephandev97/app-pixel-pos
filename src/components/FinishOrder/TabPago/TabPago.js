import React, { useEffect, useState } from 'react';
import { BsCash } from 'react-icons/bs';
import { FaEquals, FaLock, FaLockOpen } from 'react-icons/fa6';
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
  const noZeros = cleaned.replace(/^0+/, '');
  return noZeros === '' ? '' : noZeros;
};

const TabPago = ({ watch, price, isEfectivo, register, setValue, errors }) => {
  const dispatch = useDispatch();
  const pagoState = useSelector((s) => s.actions.pago);
  const [isMixed, setIsMixed] = useState(false);
  const [mpLocked, setMpLocked] = useState(false);

  useEffect(() => {
    setValue('modePago', isMixed ? 'mixto' : isEfectivo ? 'efectivo' : 'transferencia');
  }, [isMixed, isEfectivo, setValue]);

  const clickPasteTotal = () => {
    const envio = Number(watch('envioTarifa') || 0);
    const tot = Number(price || 0) + envio;
    dispatch(changePago(tot));
    setValue('pago', tot, { shouldValidate: true });
  };

  const formatWithDollar = (val) => {
    const raw = String(val ?? '').replace(/[^\d]/g, '');
    return raw ? `$ ${raw}` : '';
  };

  const stripDollar = (val) => String(val ?? '').replace(/[^\d]/g, '');

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
          onClick={() => {
            setIsMixed(true);
            const envio = Number(watch('envioTarifa') || 0);
            const total = Number(price || 0) + envio;
            setValue('pagoMp', total, { shouldValidate: true });
          }}
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
              {...register('pago', {
                setValueAs: (v) => stripDollar(v),
                validate: (raw) => {
                  if (String(watch('modePago')) !== 'efectivo') return true;
                  const envio = Number(watch('envioTarifa') || 0);
                  const tot = Number(price || 0) + envio;
                  const val = Number(stripDollar(raw)) || 0;
                  return val >= tot || 'El efectivo debe ser ≥ Total + Envío';
                },
              })}
              aria-invalid={!!errors?.pago}
              value={formatWithDollar(watch('pago'))}
              onChange={(e) => {
                const raw = stripDollar(e.target.value);
                setValue('pago', raw, { shouldValidate: true });
                dispatch(changePago(raw));
              }}
              placeholder="Ingresa el monto recibido"
              inputMode="numeric"
              style={{ paddingLeft: '56px' }}
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
                {...register('pagoEfectivo', {
                  setValueAs: (v) => String(v ?? '').replace(/[^\d]/g, ''),
                })}
                aria-invalid={!!errors?.pagoEfectivo}
                value={formatWithDollar(watch('pagoEfectivo'))}
                onChange={(e) => {
                  const raw = stripDollar(e.target.value);
                  setValue('pagoEfectivo', raw, { shouldValidate: true });

                  if (!mpLocked) {
                    const pagoEfectivo = Number(raw) || 0;
                    const envio = Number(watch('envioTarifa') || 0);
                    const total = Number(price || 0) + envio;
                    const mpNeeded = Math.max(0, total - pagoEfectivo);
                    setValue('pagoMp', mpNeeded, { shouldValidate: true });
                  }
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
                {...register('pagoMp', {
                  setValueAs: (v) => String(v ?? '').replace(/[^\d]/g, ''),
                })}
                aria-invalid={!!errors?.pagoMp}
                disabled={mpLocked}
                value={formatWithDollar(watch('pagoMp'))}
                onChange={(e) => {
                  setValue('pagoMp', e.target.value, { shouldValidate: true });
                }}
                placeholder="MercadoPago"
                inputMode="numeric"
                style={{ paddingLeft: '60px' }}
              />
              <ButtonPaste type="button" onClick={() => setMpLocked(!mpLocked)} title={mpLocked ? "Desbloquear el monto" : "Bloquear el monto"}>
                {mpLocked ? <FaLock /> : <FaLockOpen />}
              </ButtonPaste>
            </InputGroup>
          </StaggerList>
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabPago;