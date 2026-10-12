import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { FaRegPaste } from 'react-icons/fa6';
import { MdHome, MdRestaurant } from 'react-icons/md';
import { RiTakeawayFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

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

  const currentDir = watch?.('direccion');
  const deliveryType = deliveryInfo?.deliveryType;

  const currentMode = useMemo(() => {
    if (deliveryType === 'local' || currentDir === 'Comer en el local') return 'local';
    if (!isRetiro || deliveryType === 'delivery') return 'delivery';
    return 'retiro';
  }, [deliveryType, currentDir, isRetiro]);

  const clickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue('direccion', text, { shouldValidate: true });
      dispatch(setDeliveryInfo({ direccion: text, isRetiro: false, deliveryType: 'delivery' }));
    } catch (err) {
      console.error('Error pasting clipboard', err);
    }
  };

  const applyShipping = (opt) => {
    const tarifa = Number(opt.price || 0);
    const opcion = String(opt.key);
    setValue('envioTarifa', tarifa, { shouldValidate: true });
    setValue('envioOpcion', opcion, { shouldValidate: true });
    dispatch(setDeliveryInfo({ envioTarifa: tarifa, envioOpcion: opcion }));
  };

  const changeDelivery = () => {
    dispatch(toggleAddress(false));
    const savedDir =
      deliveryInfo?.direccion &&
      deliveryInfo.direccion !== 'Retiro' &&
      deliveryInfo.direccion !== 'Comer en el local'
        ? deliveryInfo.direccion
        : '';
    setValue('direccion', savedDir, { shouldValidate: true });
    dispatch(setDeliveryInfo({ isRetiro: false, deliveryType: 'delivery', direccion: savedDir }));
    const selectedOpt =
      deliveryOptions.find((o) => String(o.key) === String(deliveryInfo?.envioOpcion)) ||
      deliveryOptions[0];
    if (selectedOpt) applyShipping(selectedOpt);
  };

  const changeRetiro = () => {
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
      (!current || !deliveryOptions?.some((o) => String(o.key) === String(current)))
    ) {
      const first = deliveryOptions?.[0];
      if (first) applyShipping(first);
      if (dir === 'Retiro' || dir === 'Comer en el local') {
        setValue('direccion', '', { shouldValidate: true });
      }
    }
  }, [currentMode, deliveryOptions, watch, setValue]);

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
        <AnimSection key="delivery">
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
                        dispatch(setDeliveryInfo({ direccion: '', isRetiro: false, deliveryType: 'delivery' }));
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
          <InputGroup>
            <Icon style={{ color: '#ea580c' }}>
              <RiTakeawayFill />
            </Icon>
            <Input
              {...register('direccion', {
                required: true,
                onChange: (e) => {
                  dispatch(setDeliveryInfo({ direccion: e.target.value, isRetiro: false, deliveryType: 'delivery' }));
                },
              })}
              type="text"
              placeholder="Escribí la dirección..."
              style={{ paddingLeft: '52px' }}
            />
            <ButtonPaste onClick={clickPaste}>
              <FaRegPaste />
            </ButtonPaste>
          </InputGroup>
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabDireccion;
