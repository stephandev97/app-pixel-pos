import { useState } from 'react';
import { ArrowUp, ChevronDown, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import uniqid from 'uniqid';

import { toggleEditor } from '../../redux/actions/actionsSlice';
import { addProduct, deleteProduct, editProduct } from '../../redux/data/dataSlice';
import {
  Background,
  ButtonHide,
  CardShowAdd,
  ContainerCard,
  ContainerEditor,
  ContainerMapProducts,
  DivButtonsCard,
  DivInputsCard,
  FormAddProduct,
  Title,
  TitleForm,
} from './EditorStyled';

const CardEditor = ({ name, price, id }) => {
  const dispatch = useDispatch();
  const [precio, setPrecio] = useState('');
  const [nombre, setNombre] = useState('');

  const updateSubmit = () => {
    const data = {
      id: id,
      name: nombre,
      price: precio,
    };

    if (precio === '') {
      data.price = price;
    }
    if (nombre === '') {
      data.name = name;
    }

    dispatch(editProduct(data));
  };

  return (
    <ContainerCard>
      <DivInputsCard>
        <input defaultValue={name} onChange={(e) => setNombre(e.target.value)} />
        <input
          type="number"
          style={{ fontWeight: 'bold' }}
          defaultValue={price}
          onChange={(e) => setPrecio(e.target.value)}
        />
      </DivInputsCard>
      <DivButtonsCard>
        <button onClick={() => updateSubmit()}>
          <ArrowUp />
        </button>
        <button
          onClick={() => dispatch(deleteProduct(id))}
          style={{ background: '#FA7070', color: 'white' }}
        >
          <X />
        </button>
      </DivButtonsCard>
    </ContainerCard>
  );
};

const Editor = () => {
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, getValues } = useForm();
  const products = useSelector((state) => state.data.products);
  const dispatch = useDispatch();
  const generateId = uniqid();

  const onSubmit = () => {
    const productData = {
      id: generateId,
      name: getValues('name'),
      price: getValues('price'),
      category: getValues('category'),
    };

    console.log(productData);
    dispatch(addProduct(productData));
    setShowForm(false);
  };

  return (
    <ContainerEditor>
      <Title>
        <a>Productos</a>
        <button onClick={() => dispatch(toggleEditor(true))}>
          <X />
        </button>
      </Title>
      <CardShowAdd onClick={() => setShowForm(true)}>
        <a>Agregar Producto</a>
        <button>
          <ChevronDown />
        </button>
      </CardShowAdd>
      {showForm ? (
        <>
          <Background />
          <FormAddProduct onSubmit={handleSubmit(onSubmit)}>
            <TitleForm>
              <a>Agregar Producto</a>
              <ButtonHide type="button" onClick={() => setShowForm(false)}>
                <X />
              </ButtonHide>
            </TitleForm>
            <select {...register('category', { required: true })}>
              <option value="Helado">Pote de helado</option>
              <option value="Paletas">Paletas</option>
              <option value="Extras">Extras</option>
              <option value="Varios">Varios</option>
              <option value="Consumir en el local">Consumir en el local</option>
            </select>
            <input {...register('name', { required: true })} placeholder="Nombre" />
            <input type="number" {...register('price', { required: true })} placeholder="Precio" />
            <button type="submit">Agregar Producto</button>
          </FormAddProduct>
        </>
      ) : null}
      <ContainerMapProducts>
        {products.map((item) => {
          return <CardEditor key={item.id} {...item} />;
        })}
      </ContainerMapProducts>
    </ContainerEditor>
  );
};

export default Editor;
