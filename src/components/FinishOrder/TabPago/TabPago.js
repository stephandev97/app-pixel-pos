import { CreditCard } from 'lucide-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { BsCash } from 'react-icons/bs';
import { FaEquals, FaLock, FaLockOpen } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';

import mpIcon from '../../../assets/mercadopago.png';
import { changePago, toggleEfectivo } from '../../../redux/actions/actionsSlice';
import {
  AnimSection,
  ButtonPaste,
  Icon,
  Input,
  InputGroup,
  StaggerList,
} from '../ContainerFinish/ContainerFinishStyles';
import { TabContainer } from './TabPagoStyles';

const TabPago = ({ watch, price, register, setValue, errors, isRetiro }) => {
  const dispatch = useDispatch();

  const [isMixed, setIsMixed] = useState(false);
  const [mixedType, setMixedType] = useState('efectivo_mp'); // 'efectivo_mp' | 'efectivo_debito' | 'debito_mp'
  const [secondaryLocked, setSecondaryLocked] = useState(false);

  // NUEVO: modo simple para soportar "debito"
  const [simpleMode, setSimpleMode] = useState('efectivo'); // 'efectivo' | 'transferencia' | 'debito'

  useEffect(() => {
    const mode = isMixed ? 'mixto' : simpleMode;
    setValue('modePago', mode);

    // mantenemos el toggleEfectivo para tu lógica existente
    dispatch(toggleEfectivo(mode === 'efectivo'));
  }, [isMixed, simpleMode, setValue, dispatch]);

  const stripDollar = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    // Prohibir decimales: si contiene coma decimal (formato latino), descartar centavos
    const withoutComma = str.includes(',') ? str.split(',')[0] : str;
    const digitsOnly = withoutComma.replace(/[^\d]/g, '');
    return digitsOnly ? String(Math.floor(Number(digitsOnly))) : '';
  };

  const formatWithDollar = (val) => {
    const raw = stripDollar(val);
    if (!raw) return '';
    return `$ ${Number(raw).toLocaleString('es-AR')}`;
  };

  const handleKeyDownNoDecimals = (e) => {
    // Bloquear explícitamente caracteres de coma, punto, notación científica y signos
    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const envioWatch = watch('envioTarifa');
  const currentEnvio = isRetiro ? 0 : Math.round(Number(envioWatch || 0));
  const currentTotal = Math.round(Number(price || 0) + currentEnvio);

  const clickPasteTotal = () => {
    dispatch(changePago(currentTotal));
    setValue('pago', currentTotal, { shouldValidate: true });
  };

  // Atajos rápidos de pago en efectivo adaptados a billetes argentinos (100, 500, 1000, 2000, 10000, 20000)
  const quickCashShortcuts = useMemo(() => {
    if (!currentTotal || currentTotal <= 0) return [];

    const roundUp = (val, step) => Math.ceil(val / step) * step;
    const BILLS = [100, 500, 1000, 2000, 10000, 20000];

    const candidates = new Set();

    // 1. Billetes directos que superan el total
    for (const b of BILLS) {
      if (b > currentTotal) candidates.add(b);
    }

    // 2. Redondeos lógicos según magnitud de la compra (usando currentTotal + 1 para avanzar si ya es múltiplo)
    const nextVal = currentTotal + 1;
    if (currentTotal < 1000) {
      candidates.add(roundUp(nextVal, 100));
      candidates.add(roundUp(nextVal, 500));
    } else if (currentTotal < 3000) {
      candidates.add(roundUp(nextVal, 500));
      candidates.add(roundUp(nextVal, 1000));
    } else if (currentTotal < 10000) {
      candidates.add(roundUp(nextVal, 1000));
      candidates.add(roundUp(nextVal, 2000));
      candidates.add(roundUp(nextVal, 5000));
    } else if (currentTotal < 20000) {
      candidates.add(roundUp(nextVal, 2000));
      candidates.add(roundUp(nextVal, 5000));
    } else {
      candidates.add(roundUp(nextVal, 5000));
      candidates.add(roundUp(nextVal, 10000));
      candidates.add(roundUp(nextVal, 20000));
    }

    // 3. Múltiplos y combinaciones con los billetes más grandes de Argentina
    if (currentTotal >= 5000) {
      const next10k = roundUp(nextVal, 10000);
      const next20k = roundUp(nextVal, 20000);
      candidates.add(next10k);
      candidates.add(next20k);
      candidates.add(next20k + 10000);
      candidates.add(next20k + 20000);
    }

    const higher = Array.from(candidates)
      .filter((v) => v > currentTotal)
      .sort((a, b) => a - b);

    let selected = [];
    if (higher.length <= 3) {
      selected = higher;
    } else {
      const first = higher[0];
      const keyBills = [500, 1000, 2000, 10000, 20000].filter((b) => higher.includes(b) && b > first);

      const picked = new Set([first]);
      for (const kb of keyBills) {
        if (picked.size < 3) picked.add(kb);
      }

      for (const h of higher) {
        if (picked.size >= 3) break;
        picked.add(h);
      }

      selected = Array.from(picked).sort((a, b) => a - b);
    }

    return [
      { label: 'Paga justo', value: currentTotal, isExact: true },
      ...selected.slice(0, 3).map((v) => ({
        label: `$${v.toLocaleString('es-AR')}`,
        value: v,
        isExact: false,
      })),
    ];
  }, [currentTotal]);

  const modePago = watch('modePago');

  useEffect(() => {
    if (!isRetiro) {
      if (simpleMode === 'debito') {
        setSimpleMode('transferencia');
      }
      if (mixedType === 'efectivo_debito' || mixedType === 'debito_mp') {
        setMixedType('efectivo_mp');
        handleMixedTypeChange('efectivo_mp');
      }
    }
  }, [isRetiro, simpleMode, mixedType]);

  const currentMode = isMixed ? 'mixto' : simpleMode;

  const handleMixedTypeChange = (newType) => {
    const envio = Math.round(Number(watch('envioTarifa') || 0));
    const total = Math.round(Number(price || 0) + envio);

    if (newType === 'efectivo_mp') {
      setValue('pagoDebito', 0, { shouldValidate: true });
      const rawEf = stripDollar(watch('pagoEfectivo'));
      const ef = Number(rawEf) || 0;
      const mpNeeded = Math.round(Math.max(0, total - ef));
      setValue('pagoMp', mpNeeded, { shouldValidate: true });
    } else if (newType === 'efectivo_debito') {
      setValue('pagoMp', 0, { shouldValidate: true });
      const rawEf = stripDollar(watch('pagoEfectivo'));
      const ef = Number(rawEf) || 0;
      const debNeeded = Math.round(Math.max(0, total - ef));
      setValue('pagoDebito', debNeeded, { shouldValidate: true });
    } else if (newType === 'debito_mp') {
      setValue('pagoEfectivo', 0, { shouldValidate: true });
      const rawDeb = stripDollar(watch('pagoDebito'));
      const deb = Number(rawDeb) || 0;
      const mpNeeded = Math.round(Math.max(0, total - deb));
      setValue('pagoMp', mpNeeded, { shouldValidate: true });
    }
  };

  const handleChange = (event, newMode) => {
    if (!newMode) return;
    if (newMode === 'mixto') {
      setIsMixed(true);
      const envio = Math.round(Number(watch('envioTarifa') || 0));
      const total = Math.round(Number(price || 0) + envio);

      if (mixedType === 'efectivo_mp') {
        setValue('pagoEfectivo', '', { shouldValidate: true });
        setValue('pagoMp', total, { shouldValidate: true });
        setValue('pagoDebito', 0, { shouldValidate: true });
      } else if (mixedType === 'efectivo_debito') {
        setValue('pagoEfectivo', '', { shouldValidate: true });
        setValue('pagoDebito', total, { shouldValidate: true });
        setValue('pagoMp', 0, { shouldValidate: true });
      } else if (mixedType === 'debito_mp') {
        setValue('pagoDebito', '', { shouldValidate: true });
        setValue('pagoMp', total, { shouldValidate: true });
        setValue('pagoEfectivo', 0, { shouldValidate: true });
      }
    } else {
      setIsMixed(false);
      setSimpleMode(newMode);
    }
  };

  return (
    <TabContainer>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '580px',
          height: '42px',
          margin: '8px auto',
          padding: '6px 8px',
          borderRadius: '10px',
          background: '#eef0f6',
          border: '1px solid #e3e6ee',
        }}
      >
        <ToggleButtonGroup
          value={currentMode}
          exclusive
          onChange={handleChange}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid transparent',
              borderRadius: '8px !important',
              margin: '0 1px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 'inherit',
              fontFamily: "'Inter', sans-serif",
              padding: '2px 6px',
              color: '#4d0012',
              '&.Mui-selected': {
                backgroundColor: '#4d0012',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#6a0020',
                },
              },
              '&:hover': {
                backgroundColor: '#fce4ec',
              },
              '&.Mui-disabled': {
                opacity: 0.4,
              },
            },
          }}
        >
          <ToggleButton value="efectivo">Efectivo</ToggleButton>
          <ToggleButton value="debito" disabled={!isRetiro}>
            Débito
          </ToggleButton>
          <ToggleButton value="transferencia">MercadoPago</ToggleButton>
          <ToggleButton value="mixto">Mixto</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <input type="hidden" {...register('modePago')} />

      {/* EFECTIVO */}
      {!isMixed && modePago === 'efectivo' && (
        <AnimSection>
          <InputGroup>
            <Icon style={{ color: '#16a34a' }}>
              <BsCash />
            </Icon>
            <Input
              {...register('pago', {
                setValueAs: (v) => stripDollar(v),
                validate: (raw) => {
                  if (String(watch('modePago')) !== 'efectivo') return true;
                  const val = Number(stripDollar(raw)) || 0;
                  return val >= currentTotal || 'El efectivo debe ser ≥ Total + Envío';
                },
              })}
              aria-invalid={!!errors?.pago}
              value={formatWithDollar(watch('pago'))}
              onKeyDown={handleKeyDownNoDecimals}
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

          {quickCashShortcuts.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                width: '100%',
                maxWidth: '580px',
                margin: '0 auto 10px auto',
                boxSizing: 'border-box',
              }}
            >
              {quickCashShortcuts.map((item) => {
                const currentVal = Number(stripDollar(watch('pago'))) || 0;
                const isSelected = currentVal === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setValue('pago', '', { shouldValidate: true });
                        dispatch(changePago(''));
                      } else {
                        setValue('pago', item.value, { shouldValidate: true });
                        dispatch(changePago(item.value));
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: isSelected ? 700 : 600,
                      cursor: 'pointer',
                      background: isSelected ? '#15803d' : '#f0fdf4',
                      color: isSelected ? '#ffffff' : '#166534',
                      border: isSelected ? '1.5px solid #15803d' : '1px solid #bbf7d0',
                      boxShadow: isSelected ? '0 2px 6px rgba(21, 128, 61, 0.22)' : 'none',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#dcfce7';
                        e.currentTarget.style.borderColor = '#86efac';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f0fdf4';
                        e.currentTarget.style.borderColor = '#bbf7d0';
                      }
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </AnimSection>
      )}

      {/* DÉBITO */}
      {!isMixed && modePago === 'debito' && (
        <AnimSection>
          <InputGroup>
            <Icon style={{ color: '#0f766e' }}>
              <CreditCard size={18} />
            </Icon>
            <Input disabled value="Débito" style={{ paddingLeft: '52px' }} />
          </InputGroup>
          {/* Campo oculto para validación */}
          <input type="hidden" {...register('pagoDebito')} value={0} />
        </AnimSection>
      )}

      {/* TRANSFERENCIA */}
      {!isMixed && modePago === 'transferencia' && (
        <AnimSection>
          <InputGroup>
            <Icon style={{ color: '#2563eb' }}>
              <img
                src={mpIcon}
                alt="MercadoPago"
                width="20"
                height="20"
                style={{
                  display: 'block',
                  filter:
                    'invert(31%) sepia(98%) saturate(2150%) hue-rotate(211deg) brightness(98%) contrast(97%)',
                }}
              />
            </Icon>
            <Input disabled value="Transferencia" style={{ paddingLeft: '52px' }} />
          </InputGroup>
          {/* Campo oculto para validación */}
          <input type="hidden" {...register('pagoMp')} value={0} />
        </AnimSection>
      )}

      {/* MIXTO */}
      {isMixed && (
        <AnimSection>
          {/* Selector de sub-modo de pago mixto: Chips tipo pastilla independientes */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '580px',
              margin: '0 auto 14px auto',
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                id: 'efectivo_mp',
                label: 'Efectivo / MP',
                disabled: false,
                colors: ['#16a34a', '#2563eb'],
              },
              {
                id: 'efectivo_debito',
                label: 'Efectivo / Débito',
                disabled: !isRetiro,
                colors: ['#16a34a', '#0f766e'],
              },
              {
                id: 'debito_mp',
                label: 'Débito / MP',
                disabled: !isRetiro,
                colors: ['#0f766e', '#2563eb'],
              },
            ].map((item) => {
              const active = mixedType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setMixedType(item.id);
                    handleMixedTypeChange(item.id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: active ? 700 : 500,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.4 : 1,
                    background: active ? '#ffffff' : '#f8fafc',
                    color: active ? '#0f172a' : '#64748b',
                    border: active ? '1.5px solid #64748b' : '1px solid #e2e8f0',
                    boxShadow: active ? '0 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: item.colors[0],
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: item.colors[1],
                        display: 'inline-block',
                      }}
                    />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <StaggerList>
            {/* EFECTIVO / MERCADOPAGO */}
            {mixedType === 'efectivo_mp' && (
              <>
                <input type="hidden" {...register('pagoDebito')} value={0} />
                <InputGroup>
                  <Icon style={{ color: '#16a34a' }}>
                    <BsCash />
                  </Icon>
                  <Input
                    {...register('pagoEfectivo', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoEfectivo}
                    value={formatWithDollar(watch('pagoEfectivo'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoEfectivo', raw, { shouldValidate: true });

                      if (!secondaryLocked) {
                        const pagoEfectivo = Number(raw) || 0;
                        const envio = Math.round(Number(watch('envioTarifa') || 0));
                        const total = Math.round(Number(price || 0) + envio);
                        const mpNeeded = Math.round(Math.max(0, total - pagoEfectivo));
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
                      style={{
                        display: 'block',
                        filter:
                           'invert(31%) sepia(98%) saturate(2150%) hue-rotate(211deg) brightness(98%) contrast(97%)',
                      }}
                    />
                  </Icon>
                  <Input
                    {...register('pagoMp', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoMp}
                    disabled={secondaryLocked}
                    value={formatWithDollar(watch('pagoMp'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoMp', raw, { shouldValidate: true });
                    }}
                    placeholder="MercadoPago"
                    inputMode="numeric"
                    style={{ paddingLeft: '60px' }}
                  />
                  <ButtonPaste
                    type="button"
                    onClick={() => setSecondaryLocked(!secondaryLocked)}
                    title={secondaryLocked ? 'Desbloquear el monto' : 'Bloquear el monto'}
                  >
                    {secondaryLocked ? <FaLock /> : <FaLockOpen />}
                  </ButtonPaste>
                </InputGroup>
              </>
            )}

            {/* EFECTIVO / DÉBITO */}
            {mixedType === 'efectivo_debito' && (
              <>
                <input type="hidden" {...register('pagoMp')} value={0} />
                <InputGroup>
                  <Icon style={{ color: '#16a34a' }}>
                    <BsCash />
                  </Icon>
                  <Input
                    {...register('pagoEfectivo', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoEfectivo}
                    value={formatWithDollar(watch('pagoEfectivo'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoEfectivo', raw, { shouldValidate: true });

                      if (!secondaryLocked) {
                        const pagoEfectivo = Number(raw) || 0;
                        const envio = Math.round(Number(watch('envioTarifa') || 0));
                        const total = Math.round(Number(price || 0) + envio);
                        const debNeeded = Math.round(Math.max(0, total - pagoEfectivo));
                        setValue('pagoDebito', debNeeded, { shouldValidate: true });
                      }
                    }}
                    placeholder="Efectivo"
                    inputMode="numeric"
                    style={{ paddingLeft: '56px' }}
                  />
                </InputGroup>

                <InputGroup>
                  <Icon style={{ color: '#0f766e' }}>
                    <CreditCard size={18} />
                  </Icon>
                  <Input
                    {...register('pagoDebito', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoDebito}
                    disabled={secondaryLocked}
                    value={formatWithDollar(watch('pagoDebito'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoDebito', raw, { shouldValidate: true });
                    }}
                    placeholder="Débito"
                    inputMode="numeric"
                    style={{ paddingLeft: '56px' }}
                  />
                  <ButtonPaste
                    type="button"
                    onClick={() => setSecondaryLocked(!secondaryLocked)}
                    title={secondaryLocked ? 'Desbloquear el monto' : 'Bloquear el monto'}
                  >
                    {secondaryLocked ? <FaLock /> : <FaLockOpen />}
                  </ButtonPaste>
                </InputGroup>
              </>
            )}

            {/* DÉBITO / MERCADOPAGO */}
            {mixedType === 'debito_mp' && (
              <>
                <input type="hidden" {...register('pagoEfectivo')} value={0} />
                <InputGroup>
                  <Icon style={{ color: '#0f766e' }}>
                    <CreditCard size={18} />
                  </Icon>
                  <Input
                    {...register('pagoDebito', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoDebito}
                    value={formatWithDollar(watch('pagoDebito'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoDebito', raw, { shouldValidate: true });

                      if (!secondaryLocked) {
                        const pagoDebito = Number(raw) || 0;
                        const envio = Math.round(Number(watch('envioTarifa') || 0));
                        const total = Math.round(Number(price || 0) + envio);
                        const mpNeeded = Math.round(Math.max(0, total - pagoDebito));
                        setValue('pagoMp', mpNeeded, { shouldValidate: true });
                      }
                    }}
                    placeholder="Débito"
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
                      style={{
                        display: 'block',
                        filter:
                          'invert(31%) sepia(98%) saturate(2150%) hue-rotate(211deg) brightness(98%) contrast(97%)',
                      }}
                    />
                  </Icon>
                  <Input
                    {...register('pagoMp', {
                      setValueAs: (v) => stripDollar(v),
                    })}
                    aria-invalid={!!errors?.pagoMp}
                    disabled={secondaryLocked}
                    value={formatWithDollar(watch('pagoMp'))}
                    onKeyDown={handleKeyDownNoDecimals}
                    onChange={(e) => {
                      const raw = stripDollar(e.target.value);
                      setValue('pagoMp', raw, { shouldValidate: true });
                    }}
                    placeholder="MercadoPago"
                    inputMode="numeric"
                    style={{ paddingLeft: '60px' }}
                  />
                  <ButtonPaste
                    type="button"
                    onClick={() => setSecondaryLocked(!secondaryLocked)}
                    title={secondaryLocked ? 'Desbloquear el monto' : 'Bloquear el monto'}
                  >
                    {secondaryLocked ? <FaLock /> : <FaLockOpen />}
                  </ButtonPaste>
                </InputGroup>
              </>
            )}
          </StaggerList>
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabPago;
