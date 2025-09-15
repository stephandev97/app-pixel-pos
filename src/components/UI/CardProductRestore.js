import React, { useState, useEffect, useRef } from 'react'
import { Boton, BotonAgregar, BotonCompraLocal, CardProductStyled, CheckBoton, ContainerBoton, ContainerSelect, ContentAclaracion, InputDetalle, SelectStyles, Title, TitleSabor, WindowProductStyled } from './styles/CardProductStyled'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/cart/cartSlice'
import { Background } from './styles/CardProductStyled'
import { Controller, useForm } from 'react-hook-form'
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import { teal, lime, purple } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import uniqid from 'uniqid'
import { groupedOptionsHelado, heladoCrema } from '../../redux/data/data'
import { IOSSwitch } from './Switch'
import ToggleButton from '@mui/material/ToggleButton'
import CheckIcon from '@mui/icons-material/Check';

const theme = createTheme({
  palette: {
    primary: teal,
    secondary: purple,
  },
});

const CardProduct = ({name, price, id, category}) => {
    const inputRef = useRef(null)

    const generateId = uniqid()
    const randomId = generateId
    const { register, handleSubmit, setValue, getValues, control, reset } = useForm({
        defaultValues: {sabor1: "", sabor2: "", sabor3: "", sabor4: ""}
    })
    const [checked2, setChecked2] = useState(true)
    const [checked3, setChecked3] = useState(false)
    const [checked4, setChecked4] = useState(false)
    const [detalle, setDetalle] = useState(false)
    const [inputDetalle, setInputDetalle] = useState("")
    const [appJobReq, setAppJobReq] = useState("")
    
    const dispatch = useDispatch()
    const [hiddenSabores, setHiddenSabores] = useState(false)
    const dubai = [
        "Chocolate Dubai",
        "Blanco Dubai",
        "Nutella Dubai",
    ]
    const clasica = [
        "Pistacho",
        "Kinder Bueno",
        "Oreo",
        "Praliné",
        "Chocotorta",
        "Tramontana",
        "Rama Negro",
        "Rama Blanco",
        "Hello Kitty",
        "Spiderman"
    ]

    const addDelivery = ({name, id, price}) => {
        setHiddenSabores(!hiddenSabores)
        dispatch(addToCart({name,id,price}))
    }

    const handleChange = (selectedOption) => {
    setAppJobReq(selectedOption);
    console.log(`Option selected:`, selectedOption);
};

    const onSubmit = () => {
        let id = randomId
        const sabores = [
            getValues("sabor1"),
            ...(checked2? [getValues("sabor2")] : []),
            ...(checked3 && checked2 ? [getValues("sabor3")] : []),
            ...(checked4 && checked3 && checked2 && name == "1 kg" ? [getValues("sabor4")] : []),
            ]
        const listdetalle = getValues("detalle")

        setHiddenSabores(!hiddenSabores)
        {detalle ?
        dispatch(addToCart({name,id,price,sabores,category, listdetalle}))
        :
        dispatch(addToCart({name,id,price,sabores,category}))
        }
        setChecked3(false)
        setChecked4(false)
        setValue("detalle", "")
        setInputDetalle("")
        setDetalle(false);
        reset({},{
            useDefaultValuesInFields: true
        })
    }

    return (
        <ThemeProvider theme={theme}>
            {category !== "Helado" && category !== "Paletas" ?
                <CardProductStyled onClick={() => dispatch(addToCart({name,price,id,category}))}>
                <span>{name}</span>
                </CardProductStyled> 
                : 
                <CardProductStyled onClick={() => setHiddenSabores(true)}>
                <span>{name}</span>
                </CardProductStyled> 
            }
            {/*--<CardProductStyled onClick={() => dispatch(addToCart({name,price,id}))}>
                <span>{name}</span>
            </CardProductStyled>*/}
            {hiddenSabores ? 
            <>
            <Background onClick={() => setHiddenSabores(false)}></Background>
            <WindowProductStyled onSubmit={handleSubmit(onSubmit)}>
                <Title>
                    <a>{name}</a>
                    {category === "Helado" ? 
                     <BotonCompraLocal onClick={() => addDelivery({name,price,id,category})}>Retiro por el local</BotonCompraLocal>
                     : null}
                </Title>
                <ContainerBoton>
                    {name == "Paleta Dubai" ?
                    dubai.map((item) => {
                    return <Boton onClick={() => {setHiddenSabores(false);dispatch(addToCart({"name":"Paleta " + item,id,price}))}}>{item}</Boton>
                    }) : null }
                    {name == "Paleta Clásica" ?
                    clasica.map((item) => {
                       return <Boton onClick={() => {setHiddenSabores(false);dispatch(addToCart({"name":"Paleta " + item,id,price}))}}>{item}</Boton>
                    })  : null }
                </ContainerBoton>
                <ContainerSelect>
                {category == "Helado" ?
                    <>
                    
                        <TitleSabor>Sabor 1</TitleSabor>
                        <Controller name="sabor1" control={control} render={({ field }) => (<SelectStyles placeholder="Elegí el sabor" {...register("sabor1", { required: true })} options={groupedOptionsHelado} onChange={(({ value }) => field.onChange(value))}/>)}/>
                        <TitleSabor>
                            <a style={{color: checked2 ? "black" : "lightgray"}}>Sabor 2</a>
                            <IOSSwitch color='primary' defaultChecked={checked2} onClick={() => setChecked2(!checked2)}/>
                        </TitleSabor>
                        {checked2 ?
                        <Controller name= "sabor2" control={control} render={({ field }) => (<SelectStyles placeholder="Elegí el sabor" disabled={!checked2} {...register("sabor2", { required: true })} options={groupedOptionsHelado} onChange={(({ value }) => field.onChange(value))}/>)}/>
                        : null
                        }
                        {checked2 ? 
                        <>  
                        <TitleSabor>
                            <a style={{color: checked3 ? "black" : "lightgray"}}>Sabor 3</a>
                            <IOSSwitch defaultChecked={checked3} onClick={() => setChecked3(!checked3)}/>
                        </TitleSabor>
                        {checked3 ?
                        <Controller name= "sabor3" control={control} render={({ field }) => (<SelectStyles placeholder="Elegí el sabor" disabled={!checked3} {...register("sabor3", { required: true })} options={groupedOptionsHelado} onChange={(({ value }) => field.onChange(value))}/>)}/>
                        : null
                        }
                        </> : null
                        }
                        {name === "1 kg" ?
                        <>
                        {checked3 && checked2?  
                        <>
                        <TitleSabor>
                            <a style={{color: checked4 ? "black" : "lightgray"}}>Sabor 4</a>
                            <IOSSwitch defaultChecked={checked4} onClick={() => setChecked4(!checked4)}/>
                            </TitleSabor>
                        {checked4 ?
                        <Controller name= "sabor4" control={control} render={({ field }) => (<SelectStyles placeholder="Elegí el sabor" disabled={!checked4} {...register("sabor4", { required: true })} options={groupedOptionsHelado} onChange={(({ value }) => field.onChange(value))}/>)}/>
                        : null
                        }
                        </> : null}
                        </>
                        : null}
                        <ContentAclaracion>
                            <div>
                                <a>Aclaración</a>
                                <ToggleButton checked={detalle} onClick={() => setDetalle(!detalle)}><CheckIcon/></ToggleButton>
                            </div>
                            {detalle ? 
                            <InputDetalle type="text" required {...register("detalle")} placeholder='Por ejemplo: Mitad de americana'
                            value={inputDetalle} onChange={(e) => setInputDetalle(e.target.value)}/>
                            : null
                            }
                        </ContentAclaracion>
                        <BotonAgregar type="submit">Agregar al pedido</BotonAgregar>
                    </>  : null }
                </ContainerSelect>
            </WindowProductStyled></> : null
            }
        </ThemeProvider>
    )
}

export default CardProduct