import { useDispatch, useSelector } from "react-redux"
import { BtnFooter, ButtonCheck, ButtonCopy, ButtonHidden, ButtonPrint, ButtonTitle, ContainerCard, ContainerOrders, ContentButtonsTitle, DirCard, Direccion, DivProducts, FooterCard, GlobalOrders, Hora, LineaPrint, ListProducts, LogoPrint, Print, PrintProduct, PrintSabores, Title, TitleCard, TitleCheck, TitleOrders, TitlePrint, TitlePrintProducts, TotalPrint } from "./OrdersStyles"
import { ChevronDown, ChevronUp, MapPin, ShoppingBag } from "react-feather"
import { reduceNumOrder, removeFromOrders } from "../../redux/orders/ordersSlice"
import { formatPrice } from "../../utils/formatPrice"
import { useEffect, useState } from "react"
import { BiHomeAlt2 } from "react-icons/bi"
import { FaXmark } from "react-icons/fa6"
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import logo from "../../styles/img/logoprint.png"
import PrintIcon from '@mui/icons-material/Print';
import Checkbox from "@mui/material/Checkbox"

const CardOrders = ({direccion, total, pago, cambio, id, num, check, items, hora}) => {
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
    
    const dispatch = useDispatch()
    const [copiado, setCopiado] = useState()
    const [hidden,setHidden] = useState(true)
    const pedidoMap = items.map(item => item.name)
    const listaItems = pedidoMap.flat()
    const repetidos = []
    const repetidos2 = []
    listaItems.forEach(function(numero){
        repetidos[numero] = (repetidos[numero] || 0) + numero;
    });

    items.map(function(item){
        repetidos2[item.name] = (repetidos2[item.name] || 0) + item.quantity
    })
    

    const pedidoArray = pedidoMap.reduce((accumulator, currentValue) => accumulator + ", " + currentValue)
    const removeOrder = (id) => {
        dispatch(reduceNumOrder(id))
        dispatch(removeFromOrders(id))
    }

    const copyOrder = () => {
        const orderArray = []
        if(pago === "Transferencia") {orderArray.push(direccion, pago)} 
        else if(pago === total) {orderArray.push(direccion, "TOTAL: " + total, "Justo")}
        else orderArray.push( direccion, "TOTAL: " + total, "PAGA: " + pago)
        const result = orderArray.reduce((accumulator, currentValue) => accumulator + '. ' + currentValue);
        navigator.clipboard.writeText(result)
    }

    const clickBtnCopy = () => {
        copyOrder()
        setCopiado(true)
        setTimeout(() => {
            setCopiado(false)
        }, 1800)
    }

    const test = () => {
        console.log(repetidos2)
    }
    
    return (
        <ContainerCard>
            <TitleCard>
                <span>Pedido #{num}</span>
                <Hora>{hora}</Hora>
                <ContentButtonsTitle>
                    {copiado? 
                    <ButtonCopy onClick={() => clickBtnCopy()} style={{background:"#6528F7", color: "white"}}>Copiado</ButtonCopy>
                    :
                    <ButtonCopy onClick={() => clickBtnCopy()}>Copiar</ButtonCopy>
                    }
                    <ButtonPrint variant="contained" onClick={reactToPrintFn} x><PrintIcon fontSize="small"/></ButtonPrint>
                    <ButtonTitle onDoubleClickCapture={() => removeOrder(id)}><FaXmark size={16}/></ButtonTitle>
                </ContentButtonsTitle>
            </TitleCard>
            <DirCard>
                {direccion === "Retiro" ? <BiHomeAlt2 size={18}/> : <MapPin size={18}/>}
                <Direccion>{direccion}</Direccion>
                <Checkbox icon={<ChevronDown/>} checkedIcon={<ChevronUp/>} onClick={() => setHidden(!hidden)}/>
            </DirCard>
            {hidden? null : 
            <>
                <DivProducts style={{fontWeight: "normal"}}>
                    <ShoppingBag size={18}/>
                    <ListProducts style={{fontSize: "0.9em"}}>
                        {
                            Object.entries(repetidos2).map(item => 
                                <a>{item[0]} <a style={{fontWeight: "bold"}}>({item[1]})</a></a>)
                        }
                    </ListProducts>
                </DivProducts>
            </>
            }
            <FooterCard>
                <div>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div>
                    <span>Paga</span>
                    {pago > total ? 
                        <span>{formatPrice(pago)}</span>
                        : null
                    } 
                    {pago === "Transferencia" ? <span>{pago}</span> : null }
                    {pago === total ? <span>JUSTO</span> : null }
                </div>
                <div style={{marginTop: '0.5em'}}>
                    {cambio > 0 ? 
                        <>  
                            <span>Cambio</span>
                            <span style={{fontWeight: 900}}>{formatPrice(cambio)}</span>
                        </>
                        :
                        <span style={{background: 'none'}}>
                            <span></span>
                        </span>
                    }
                </div>
            </FooterCard>
            <div style={{display: "none"}}>
            <Print ref={contentRef} style={{fontDisplay: "swap"}}>
                <LineaPrint style={{margin: "0 0 1.5em 0"}}>------------------------</LineaPrint>
                <LogoPrint>
                    <img src={logo}></img>
                </LogoPrint>
                <TitlePrint>
                    <a style={{fontWeight: "bold"}}>Cliente:</a>
                    <a>{direccion}</a>
                </TitlePrint>
                <LineaPrint>------------------------</LineaPrint>
                <TitlePrintProducts>
                    <a style={{justifyContent:"start"}}>#</a>
                    <a style={{justifyContent:"start"}}>Producto</a>
                </TitlePrintProducts>
                    {
                            Object.entries(repetidos2).map(item => 
                                <PrintProduct>
                                    <div>
                                        <a style={{fontWeight: "bold"}}>{item[1]}</a>
                                    </div>
                                    <div>
                                        <a>{item[0]}</a>
                                        {items.map(item1 => item1.name === item[0] &&  item1.sabores ?
                                        <div style={{marginTop: "0.2em"}}>
                                            {item1.sabores.map(item => <p>{item}</p>)}
                                            <div style={{textAlign: "left"}}>-------------</div>
                                        </div>
                                        : null
                                        )}

                                    </div>
                                </PrintProduct>)
                    }
                <LineaPrint style={{margin:"1em 0 1.2em 0"}}>------------------------</LineaPrint>
                <TotalPrint>
                    <a style={{textAlign: "left", fontWeight:"bold"}}>Total</a>
                    <a style={{textAlign: "right"}}>{formatPrice(total)}</a>
                </TotalPrint>
                <TotalPrint>
                    <a style={{textAlign: "left", fontWeight:"bold"}}>Paga</a>
                    {pago === total ?
                    <a style={{textAlign: "right"}}>JUSTO</a> : null
                    }
                    {pago === "Transferencia" ? 
                    <a style={{textAlign: "right"}}>YA PAGÓ</a> : null
                    }
                    {pago > total ? 
                    <a style={{textAlign: "right"}}>{formatPrice(pago)}</a> : null
                    }
                </TotalPrint>
                <LineaPrint>------------------------</LineaPrint>
            </Print>
            </div>
        </ContainerCard>
    )
}

const Orders = () => {
    const orders = useSelector((state) => state.orders.orders)

    return (
        <GlobalOrders>
            <TitleOrders>
                <a>Pedidos</a>
            </TitleOrders>
            <ContainerOrders>
                {orders.toReversed().map((order) => 
                <CardOrders key={order.num} {...order}/>
            )}
            </ContainerOrders>
        </GlobalOrders>
    )
}

export default Orders