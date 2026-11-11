import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaRegPaste } from 'react-icons/fa6';
import { MdRestaurant } from 'react-icons/md';
import { RiTakeawayFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, LoaderCircle, MapPin, TriangleAlert } from 'lucide-react';

import { findDeliveryZone, loadDeliveryConfig } from '../../../lib/deliveryConfig';
import { resolveAddressSuggestion, searchAddresses } from '../../../lib/geocode';
import { toggleAddress } from '../../../redux/actions/actionsSlice';
import { setDeliveryInfo } from '../../../redux/cart/cartSlice';
import {
  AnimSection,
  ShippingInline,
  ShippingOptionAnimated as ShippingOption,
  StaggerList,
} from '../ContainerFinish/ContainerFinishStyles';
import { ButtonPaste, Icon, Input, InputGroup } from '../ContainerFinish/ContainerFinishStyles';
import { TabContainer } from '../TabPago/TabPagoStyles';

const TabDireccion = ({ register, setValue, watch, deliveryOptions }) => {
  const dispatch = useDispatch();
  const isRetiro = useSelector((state) => state.actions.toggleAddress);
  const deliveryInfo = useSelector((state) => state.cart?.deliveryInfo);
  const [deliveryConfig, setDeliveryConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchFinished, setSearchFinished] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');
  const [deliveryEntryMode, setDeliveryEntryMode] = useState(
    deliveryInfo?.deliveryEntryMode === 'manual' ? 'manual' : 'automatic'
  );
  const selectedAddressRef = useRef('');

  const currentDir = watch?.('direccion');
  const deliveryType = deliveryInfo?.deliveryType;

  const currentMode = useMemo(() => {
    if (deliveryType === 'local' || currentDir === 'Comer en el local') return 'local';
    if (!isRetiro || deliveryType === 'delivery') return 'delivery';
    return 'retiro';
  }, [deliveryType, currentDir, isRetiro]);

  useEffect(() => {
    let active = true;
    loadDeliveryConfig()
      .then((config) => {
        if (active) setDeliveryConfig(config || null);
      })
      .finally(() => {
        if (active) setConfigLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const clickPaste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      setValue('direccion', text, { shouldValidate: true });
      if (deliveryEntryMode === 'automatic') {
        selectedAddressRef.current = '';
        setValue('envioTarifa', 0, { shouldValidate: true });
        setValue('envioOpcion', null, { shouldValidate: true });
        dispatch(setDeliveryInfo({
          direccion: text,
          isRetiro: false,
          deliveryType: 'delivery',
          deliveryEntryMode: 'automatic',
          envioTarifa: 0,
          envioOpcion: null,
          deliveryZoneId: null,
          deliveryZoneName: null,
          coordinates: null,
        }));
      } else {
        dispatch(setDeliveryInfo({
          direccion: text,
          isRetiro: false,
          deliveryType: 'delivery',
          deliveryEntryMode: 'manual',
        }));
      }
    } catch (err) {
      console.error('Error pasting clipboard', err);
    }
  };

  const applyShipping = useCallback((opt) => {
    const tarifa = Number(opt.price || 0);
    const opcion = String(opt.key);
    setValue('envioTarifa', tarifa, { shouldValidate: true });
    setValue('envioOpcion', opcion, { shouldValidate: true });
    dispatch(setDeliveryInfo({ envioTarifa: tarifa, envioOpcion: opcion }));
  }, [dispatch, setValue]);

  const getSuggestionZone = useCallback((suggestion, coordinates) => {
    if (suggestion?.preferredZoneId) {
      const preferred = deliveryConfig?.zones?.find(
        (zone) => String(zone.id) === String(suggestion.preferredZoneId)
      );
      if (preferred) return preferred;
    }
    return findDeliveryZone(coordinates?.lat, coordinates?.lon, deliveryConfig);
  }, [deliveryConfig]);

  const selectAddress = async (suggestion) => {
    if (!suggestion.houseNumber && !suggestion.isSpecial) {
      setAddressMessage('Agregá la altura de la calle para elegir la dirección');
      return;
    }
    setSearchingAddress(true);
    const coordinates = await resolveAddressSuggestion(suggestion);
    setSearchingAddress(false);
    if (!coordinates) {
      setAddressMessage('No pudimos ubicar esa dirección. Probá con otra sugerencia.');
      return;
    }
    const zone = getSuggestionZone(suggestion, coordinates);
    const address = suggestion.mainText || suggestion.label;
    selectedAddressRef.current = address;
    setValue('direccion', address, { shouldValidate: true });
    setSuggestions([]);
    setSearchFinished(false);

    if (!zone) {
      setValue('envioTarifa', 0, { shouldValidate: true });
      setValue('envioOpcion', null, { shouldValidate: true });
      setAddressMessage('Fuera de las zonas de entrega');
      dispatch(setDeliveryInfo({
        direccion: address,
        deliveryEntryMode: 'automatic',
        envioTarifa: 0,
        envioOpcion: null,
        deliveryZoneId: null,
        deliveryZoneName: null,
        coordinates: { lat: coordinates.lat, lon: coordinates.lon },
        deliveryConfigVersion: deliveryConfig?.version || null,
      }));
      return;
    }

    const price = Number(zone.price || 0);
    setValue('envioTarifa', price, { shouldValidate: true });
    setValue('envioOpcion', String(zone.id), { shouldValidate: true });
    setAddressMessage(`${zone.name} · $${price.toLocaleString('es-AR')}`);
    dispatch(setDeliveryInfo({
      direccion: address,
      isRetiro: false,
      deliveryType: 'delivery',
      deliveryEntryMode: 'automatic',
      envioTarifa: price,
      envioOpcion: String(zone.id),
      deliveryZoneId: String(zone.id),
      deliveryZoneName: zone.name || '',
      coordinates: { lat: coordinates.lat, lon: coordinates.lon },
      deliveryConfigVersion: deliveryConfig?.version || null,
    }));
  };

  useEffect(() => {
    const query = String(currentDir || '').trim();
    if (
      currentMode !== 'delivery' ||
      deliveryEntryMode !== 'automatic' ||
      !deliveryConfig?.zones?.length ||
      query.length < 2 ||
      query === selectedAddressRef.current
    ) {
      setSuggestions([]);
      setSearchFinished(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setSearchingAddress(true);
      const results = await searchAddresses(query, 6);
      const filteredResults = deliveryConfig?.zones?.length
        ? (await Promise.all(
            results.map(async (suggestion) => {
              if (suggestion.trustedStreetPreview && !suggestion.houseNumber) {
                return suggestion;
              }
              const coordinates = await resolveAddressSuggestion(suggestion);
              if (!coordinates) return null;
              const zone = getSuggestionZone(suggestion, coordinates);
              return zone ? { ...suggestion, ...coordinates, resolvedZoneId: zone.id } : null;
            })
          )).filter(Boolean)
        : results;
      if (active) {
        setSuggestions(filteredResults);
        setSearchingAddress(false);
        setSearchFinished(true);
      }
    }, 550);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [currentDir, currentMode, deliveryEntryMode, deliveryConfig, getSuggestionZone]);

  const changeDeliveryEntryMode = useCallback((mode) => {
    if (mode !== 'automatic' && mode !== 'manual') return;
    setDeliveryEntryMode(mode);
    setSuggestions([]);
    setSearchFinished(false);
    setAddressMessage('');
    selectedAddressRef.current = '';

    if (mode === 'manual') {
      const selectedOpt =
        deliveryOptions.find((option) => String(option.key) === String(watch?.('envioOpcion'))) ||
        deliveryOptions[0];
      if (selectedOpt) applyShipping(selectedOpt);
      dispatch(setDeliveryInfo({
        deliveryEntryMode: 'manual',
        deliveryZoneId: null,
        deliveryZoneName: null,
        coordinates: null,
        deliveryConfigVersion: null,
      }));
      return;
    }

    setValue('envioTarifa', 0, { shouldValidate: true });
    setValue('envioOpcion', null, { shouldValidate: true });
    dispatch(setDeliveryInfo({
      deliveryEntryMode: 'automatic',
      envioTarifa: 0,
      envioOpcion: null,
      deliveryZoneId: null,
      deliveryZoneName: null,
      coordinates: null,
    }));
  }, [applyShipping, deliveryOptions, dispatch, setValue, watch]);

  const changeDelivery = () => {
    dispatch(toggleAddress(false));
    const savedDir =
      deliveryInfo?.direccion &&
      deliveryInfo.direccion !== 'Retiro' &&
      deliveryInfo.direccion !== 'Comer en el local'
        ? deliveryInfo.direccion
        : '';
    setValue('direccion', savedDir, { shouldValidate: true });
    dispatch(setDeliveryInfo({
      isRetiro: false,
      deliveryType: 'delivery',
      deliveryEntryMode,
      direccion: savedDir,
    }));
    if (deliveryEntryMode === 'manual') {
      const selectedOpt =
        deliveryOptions.find((o) => String(o.key) === String(deliveryInfo?.envioOpcion)) ||
        deliveryOptions[0];
      if (selectedOpt) applyShipping(selectedOpt);
    }
  };

  const changeRetiro = () => {
    setSuggestions([]);
    setAddressMessage('');
    dispatch(toggleAddress(true));
    setValue('direccion', 'Retiro', { shouldValidate: true });
    setValue('envioTarifa', 0, { shouldValidate: true });
    setValue('envioOpcion', null, { shouldValidate: true });
    dispatch(
      setDeliveryInfo({
        isRetiro: true,
        deliveryType: 'retiro',
        direccion: 'Retiro',
        envioTarifa: 0,
        envioOpcion: null,
      })
    );
  };

  const changeLocal = () => {
    setSuggestions([]);
    setAddressMessage('');
    dispatch(toggleAddress(true));
    setValue('direccion', 'Comer en el local', { shouldValidate: true });
    setValue('envioTarifa', 0, { shouldValidate: true });
    setValue('envioOpcion', null, { shouldValidate: true });
    dispatch(
      setDeliveryInfo({
        isRetiro: true,
        deliveryType: 'local',
        direccion: 'Comer en el local',
        envioTarifa: 0,
        envioOpcion: null,
      })
    );
  };

  // 👇 Pre-cargar valores guardados en deliveryInfo si está en Delivery
  useEffect(() => {
    if (currentMode === 'delivery' && deliveryInfo) {
      setDeliveryEntryMode(deliveryInfo.deliveryEntryMode === 'manual' ? 'manual' : 'automatic');
      if (
        deliveryInfo.direccion &&
        deliveryInfo.direccion !== 'Retiro' &&
        deliveryInfo.direccion !== 'Comer en el local'
      ) {
        setValue('direccion', deliveryInfo.direccion, { shouldValidate: true });
      }
      if (deliveryInfo.envioTarifa !== undefined) {
        setValue('envioTarifa', Number(deliveryInfo.envioTarifa || 0), { shouldValidate: true });
      }
      if (deliveryInfo.envioOpcion) {
        setValue('envioOpcion', String(deliveryInfo.envioOpcion), { shouldValidate: true });
      }
    }
  }, [currentMode, deliveryInfo, setValue]);

  // 👇 Default si ya estoy en Delivery, no hay selección y llegan las opciones
  useEffect(() => {
    const current = watch?.('envioOpcion');
    const dir = watch?.('direccion');
    if (
      currentMode === 'delivery' &&
      deliveryEntryMode === 'manual' &&
      (!current || !deliveryOptions?.some((o) => String(o.key) === String(current)))
    ) {
      const first = deliveryOptions?.[0];
      if (first) applyShipping(first);
      if (dir === 'Retiro' || dir === 'Comer en el local') {
        setValue('direccion', '', { shouldValidate: true });
      }
    }
  }, [currentMode, deliveryEntryMode, deliveryOptions, watch, setValue, applyShipping]);

  useEffect(() => {
    if (
      currentMode === 'delivery' &&
      deliveryEntryMode === 'automatic' &&
      !configLoading &&
      !deliveryConfig?.zones?.length
    ) {
      changeDeliveryEntryMode('manual');
    }
  }, [currentMode, deliveryEntryMode, configLoading, deliveryConfig, changeDeliveryEntryMode]);

  // Si está en Retiro o Local, nos aseguramos que el form tenga el valor correcto
  useEffect(() => {
    const dir = watch?.('direccion');
    if (currentMode === 'local') {
      if (dir !== 'Comer en el local') {
        setValue('direccion', 'Comer en el local', { shouldValidate: true });
      }
    } else if (currentMode === 'retiro') {
      if (!dir || dir === 'n/a' || dir === 'Comer en el local') {
        setValue('direccion', 'Retiro', { shouldValidate: true });
      }
    }
  }, [currentMode, watch, setValue]);

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
          onChange={(e, val) => {
            if (!val) return;
            if (val === 'retiro') changeRetiro();
            else if (val === 'delivery') changeDelivery();
            else if (val === 'local') changeLocal();
          }}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid transparent',
              borderRadius: '8px !important',
              margin: '0 1px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif",
              padding: '2px 6px',
              color: '#4d0012',
              whiteSpace: 'nowrap',
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
            },
          }}
        >
          <ToggleButton value="retiro">Take Away</ToggleButton>
          <ToggleButton value="delivery">Delivery</ToggleButton>
          <ToggleButton value="local">Comer en el local</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {currentMode === 'local' ? (
        <AnimSection key="local">
          <InputGroup>
            <Icon style={{ color: '#64748b' }}>
              <MdRestaurant />
            </Icon>
            <Input
              disabled
              value="Comer en el local"
              style={{
                background: '#f3f4f6',
                color: '#475569',
                fontWeight: 800,
                cursor: 'not-allowed',
                paddingLeft: '52px',
              }}
            />
          </InputGroup>
        </AnimSection>
      ) : currentMode === 'retiro' ? (
        <AnimSection key="retiro">
          <InputGroup>
            <Icon style={{ color: '#64748b' }}>
              <RiTakeawayFill />
            </Icon>
            <Input
              disabled
              value="Take Away (Retiro)"
              style={{
                background: '#f3f4f6',
                color: '#475569',
                fontWeight: 800,
                cursor: 'not-allowed',
                paddingLeft: '52px',
              }}
            />
          </InputGroup>
        </AnimSection>
      ) : (
        <AnimSection key="delivery" $allowOverflow>
          {deliveryEntryMode === 'manual' && (
            <StaggerList>
              <ShippingInline>
                {deliveryOptions.map((opt) => {
                  const active = watch?.('envioOpcion') === String(opt.key);
                  return (
                    <ShippingOption
                      key={opt.key}
                      type="button"
                      data-active={active}
                      onClick={() => {
                        applyShipping(opt);
                        if (watch?.('direccion') === 'Retiro' || watch?.('direccion') === 'Comer en el local') {
                          setValue('direccion', '', { shouldValidate: true });
                          dispatch(setDeliveryInfo({
                            direccion: '',
                            isRetiro: false,
                            deliveryType: 'delivery',
                            deliveryEntryMode: 'manual',
                          }));
                        }
                      }}
                      style={{ marginBottom: 10 }}
                    >
                      {opt.label}
                    </ShippingOption>
                  );
                })}
              </ShippingInline>
            </StaggerList>
          )}
          <InputGroup $allowOverflow>
            <Icon style={{ color: '#ea580c' }}>
              {deliveryEntryMode === 'automatic' && (searchingAddress || configLoading) ? (
                <LoaderCircle size={18} className="spin" />
              ) : (
                <MapPin size={18} />
              )}
            </Icon>
            <Input
              {...register('direccion', {
                required: true,
                validate: () =>
                  deliveryEntryMode === 'manual' ||
                  !deliveryConfig?.zones?.length ||
                  Boolean(selectedAddressRef.current || deliveryInfo?.deliveryZoneId) ||
                  'Seleccioná una dirección de la lista',
                onChange: (e) => {
                  selectedAddressRef.current = '';
                  setAddressMessage('');
                  setSearchFinished(false);
                  const deliveryUpdate = {
                    direccion: e.target.value,
                    isRetiro: false,
                    deliveryType: 'delivery',
                    deliveryEntryMode,
                    deliveryZoneId: null,
                    deliveryZoneName: null,
                    coordinates: null,
                  };
                  if (deliveryEntryMode === 'automatic') {
                    setValue('envioTarifa', 0, { shouldValidate: true });
                    setValue('envioOpcion', null, { shouldValidate: true });
                    deliveryUpdate.envioTarifa = 0;
                    deliveryUpdate.envioOpcion = null;
                  }
                  dispatch(setDeliveryInfo(deliveryUpdate));
                },
              })}
              type="text"
              placeholder={
                deliveryEntryMode === 'automatic'
                  ? 'Escribí la dirección...'
                  : 'Ingresá la dirección manualmente...'
              }
              style={{ paddingLeft: '52px', paddingRight: '98px' }}
            />
            <button
              type="button"
              aria-label={deliveryEntryMode === 'automatic' ? 'Desactivar cálculo automático' : 'Activar cálculo automático'}
              aria-pressed={deliveryEntryMode === 'automatic'}
              title={deliveryEntryMode === 'automatic' ? 'Cálculo automático activo' : 'Activar cálculo automático'}
              onClick={() => changeDeliveryEntryMode(
                deliveryEntryMode === 'automatic' ? 'manual' : 'automatic'
              )}
              style={{
                position: 'absolute',
                top: '50%',
                right: 42,
                transform: 'translateY(-50%)',
                height: 28,
                minWidth: 46,
                padding: '0 9px',
                border: deliveryEntryMode === 'automatic' ? '1px solid #2563eb' : '1px solid #d9dee8',
                borderRadius: 8,
                background: deliveryEntryMode === 'automatic' ? '#2563eb' : '#ffffff',
                color: deliveryEntryMode === 'automatic' ? '#ffffff' : '#64748b',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                zIndex: 12,
                transition: 'background 140ms ease, color 140ms ease, border-color 140ms ease',
              }}
            >
              AUTO
            </button>
            <ButtonPaste onClick={clickPaste}>
              <FaRegPaste />
            </ButtonPaste>
            {deliveryEntryMode === 'automatic' && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 5px)',
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid #dbe1ea',
                  borderRadius: 10,
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
                }}
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectAddress(suggestion)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '9px 12px',
                      border: 'none',
                      borderBottom: '1px solid #eef2f7',
                      background: '#ffffff',
                      color: '#1e293b',
                      textAlign: 'left',
                      font: 'inherit',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    <MapPin size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.8rem' }}>
                        {suggestion.mainText || suggestion.label}
                      </strong>
                      <span style={{ display: 'block', marginTop: 2, color: '#64748b', fontSize: '0.68rem' }}>
                        {suggestion.secondaryText || 'Marcos Paz'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </InputGroup>
          {deliveryEntryMode === 'automatic' && searchFinished && !searchingAddress && !suggestions.length && currentDir?.trim()?.length >= 2 && (
            <div
              role="status"
              style={{ marginTop: -3, textAlign: 'center', color: '#64748b', fontSize: '0.72rem' }}
            >
              No encontramos direcciones. Probá escribiendo calle y altura.
            </div>
          )}
          {deliveryEntryMode === 'automatic' && addressMessage && (
            <div
              style={{
                marginTop: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: addressMessage.startsWith('Fuera') ? '#b91c1c' : '#047857',
                fontSize: '0.76rem',
                fontWeight: 800,
              }}
            >
              {addressMessage.startsWith('Fuera') ? <TriangleAlert size={14} /> : <CheckCircle2 size={14} />}
              {addressMessage}
            </div>
          )}
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabDireccion;
