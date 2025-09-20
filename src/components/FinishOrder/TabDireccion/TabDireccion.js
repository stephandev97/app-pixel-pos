import { FaRegPaste } from 'react-icons/fa6';
import { MdHome } from 'react-icons/md';
import { RiTakeawayFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShippingGroup,
  ShippingBtn,
  ShippingPrice,
  ShippingInline,
  ShippingOptionAnimated as ShippingOption,
  StaggerList,
  AnimSection,
} from '../ContainerFinish/ContainerFinishStyles';

import { toggleAddress } from '../../../redux/actions/actionsSlice';
import {
  ButtonPaste,
  ButtonToggle,
  Icon,
  Input,
  InputGroup,
  Tab,
} from '../ContainerFinish/ContainerFinishStyles';
import { TabContainer } from '../TabPago/TabPagoStyles';
import { useEffect } from 'react';

const TabDireccion = ({ register, setValue, watch, deliveryOptions }) => {
  const dispatch = useDispatch();
  const isRetiro = useSelector((state) => state.actions.toggleAddress);

  const clickPaste = () => {
    navigator.clipboard.readText().then((text) => {
      setValue('direccion', text);
    });
  };

  const applyShipping = (opt) => {
    setValue('envioTarifa', Number(opt.price || 0), { shouldValidate: true });
    setValue('envioOpcion', String(opt.key), { shouldValidate: true });
  };

  const changeDelivery = () => {
    dispatch(toggleAddress(false));
    setValue('direccion', '');
    const first = deliveryOptions[0];
    if (first) applyShipping(first);
  };

  const changeRetiro = () => {
    dispatch(toggleAddress(true));
    setValue('direccion', 'Retiro');
    setValue('envioTarifa', 0, { shouldValidate: true });
    setValue('envioOpcion', null, { shouldValidate: true });
  };

  // 👇 Default si ya estoy en Delivery, no hay selección y llegan las opciones
  useEffect(() => {
    const current = watch?.('envioOpcion');
    if (
      !isRetiro &&
      (!current || !deliveryOptions?.some((o) => String(o.key) === String(current)))
    ) {
      const first = deliveryOptions?.[0];
      if (first) applyShipping(first);
    }
  }, [isRetiro, deliveryOptions, watch, setValue]);

  // Si está en Retiro, nos aseguramos que el form tenga "Retiro"
  useEffect(() => {
    if (isRetiro) {
      const dir = watch?.('direccion');
      if (!dir || dir === 'n/a') {
        setValue('direccion', 'Retiro', { shouldValidate: true });
      }
    }
  }, [isRetiro, watch, setValue]);

  return (
    <TabContainer>
      <Tab>
        <ButtonToggle
          type="button"
          role="tab"
          aria-selected={isRetiro}
          data-active={isRetiro}
          onClick={changeRetiro}
        >
          Take Away
        </ButtonToggle>
        <ButtonToggle
          type="button"
          role="tab"
          aria-selected={!isRetiro}
          data-active={!isRetiro}
          onClick={changeDelivery}
        >
          Delivery
        </ButtonToggle>
      </Tab>
      {isRetiro ? (
        <AnimSection key="retiro">
          <InputGroup>
            <Icon>
              <MdHome />
            </Icon>
            <Input
              disabled
              value="Retiro"
              style={{
                background: '#f3f4f6', // gris claro
                color: '#8c97a5ff', // texto oscuro
                fontWeight: 800,
                cursor: 'not-allowed',
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
                      setValue('envioTarifa', Number(opt.price || 0), { shouldValidate: true });
                      setValue('envioOpcion', String(opt.key), { shouldValidate: true });
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
            <Icon>
              <RiTakeawayFill />
            </Icon>
            <Input
              {...register('direccion', { required: true })}
              type="text"
              placeholder="Escribí la dirección..."
            />
            <ButtonPaste
              onClick={async () => {
                const text = await navigator.clipboard.readText();
                setValue('direccion', text);
              }}
            >
              <FaRegPaste />
            </ButtonPaste>
          </InputGroup>
        </AnimSection>
      )}
    </TabContainer>
  );
};

export default TabDireccion;
