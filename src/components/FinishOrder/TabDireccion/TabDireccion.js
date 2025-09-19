import { FaRegPaste } from 'react-icons/fa6';
import { MdHome } from 'react-icons/md';
import { RiTakeawayFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

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

const TabDireccion = ({ register, setValue }) => {
  const dispatch = useDispatch();

  const clickPaste = () => {
    navigator.clipboard.readText().then((text) => {
      setValue('direccion', text);
    });
  };
  const isRetiro = useSelector((state) => state.actions.toggleAddress);

  const changeDelivery = () => {
    dispatch(toggleAddress(false));
    setValue('direccion', '');
  };
  const changeRetiro = () => {
    dispatch(toggleAddress(true));
    setValue('direccion', 'Retiro');
  };

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
        <InputGroup>
          <Icon>
            <MdHome />
          </Icon>
          <Input {...register('direccion', { required: true })} type="text" value="Retiro" />
        </InputGroup>
      ) : (
        <InputGroup>
          <Icon>
            <RiTakeawayFill />
          </Icon>
          <Input
            {...register('direccion', { required: true })}
            type="text"
            placeholder="Escribí la dirección..."
          />
          <ButtonPaste onClick={() => clickPaste()}>
            <FaRegPaste />
          </ButtonPaste>
        </InputGroup>
      )}
    </TabContainer>
  );
};

export default TabDireccion;
