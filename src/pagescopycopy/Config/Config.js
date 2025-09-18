import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "../../utils/formatPrice";
import { removeOrders } from "../../redux/orders/ordersSlice";
import { ContentUploadFile, ButtonUpload, InputFile, Background, ButtonPage, Container, ContainerPages, IconButton, MsjButton, MsjNav, ContentInput, TitleUpload, Separador, TitlePage } from "./ConfigStyles";
import { Check, ChevronRight, Edit, Save, Settings, Trash, X } from "react-feather";
import { toggleEditor, toggleEditorSabores, toggleFinishOrder } from "../../redux/actions/actionsSlice";
import { removeSabores, addFile, addFileSabores, addListPro, removeProducts } from "../../redux/data/dataSlice"
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';


const ImportFile = ({open, setOpen}) => {
    //const groupedOptionsHelado = useSelector((state) => state.sabores.sabores[0])
    const dispatch = useDispatch()
    const [text, setText] = useState();
    let prueba = []

  let fileReader;

  const onChange = e => {
    let file = e.target.files;
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file[0]);
  };

  const deleteLines = (string, n = 1) => {
    console.log("remove lines");
    return string.replace(new RegExp(`(?:.*?\n){${n - 1}}(?:.*?\n)`), "");
  };

  const cleanContent = string => {
    string = string.replace(/^\s*[\r\n]/gm, "");
    let array = string.split(new RegExp(/[\r\n]/gm));
    console.log(array);
    array.splice(0, 3);
    array.splice(-3);
    return array.join("\n");
  };

  const handleFileRead = e => {
    let content = fileReader.result;
    // let text = deleteLines(content, 3);
    // … do something with the 'content' …
    setText(content)
  };

  const clickBtnSabores = () => {
    if(text){
        dispatch(removeSabores())
        dispatch(addFileSabores(JSON.parse(text)))
        setOpen(false)
    }
  }
  const clickBtnProducts = () => {
    if(text){
        dispatch(removeProducts())
        dispatch(addListPro(JSON.parse(text)))
        setOpen(false)
    }
  }

  return (
        <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{sx:{background: "#F7F7FF"}}}>
            <DialogContent>
                <ContentUploadFile>
                    <TitleUpload>
                        <a>Productos</a>
                    </TitleUpload>
                    <ContentInput>
                        <InputFile type="file" name="myfile" onChange={onChange} />
                        <ButtonUpload onClick={() => clickBtnProducts()}><ArrowCircleUpIcon/></ButtonUpload>
                    </ContentInput>
                </ContentUploadFile>
                <ContentUploadFile>
                    <TitleUpload>
                        <a>Sabores de helado</a>
                    </TitleUpload>
                    <ContentInput>
                        <InputFile type="file" name="myfile" onChange={onChange} />
                        <ButtonUpload onClick={() => clickBtnSabores()}><ArrowCircleUpIcon/></ButtonUpload>
                    </ContentInput>
                </ContentUploadFile>
            </DialogContent>
        </Dialog>
  );
}

const Config = () => {
    const orders = useSelector((state) => state.orders.orders)
    const dispatch = useDispatch()
    const [save, setSave] = useState(false);
    const [remove, setRemove] = useState(false);
    const [open, setOpen] = useState(false)
    const date = new Date().toLocaleDateString();
    const pedidos = orders.length;
    const total = orders.reduce((acc, order) =>
        acc + order.total, 0
    )
    const efectivo = orders.filter((order) => order.pago !== "Transferencia").reduce((acc, order) => acc + order.total, 0)
    const mercadopago= orders.filter((order) => order.pago === "Transferencia").reduce((acc, order) => acc + order.total, 0)

    const items = orders.map(order => order.items.map(x => x));
    const lista = items.flat()
    const listaduplicados = lista.reduce((acumulador, valorActual) => {
            const elementoYaExiste = acumulador.find(elemento => elemento.name === valorActual.name);
            if (elementoYaExiste) {
                return acumulador.map((elemento) => {
                if (elemento.name == valorActual.name) {
                    return {
                            ...elemento,
                            quantity: elemento.quantity + valorActual.quantity
                        }
                    }   

                    return elemento;
                });
            }

            return [...acumulador, valorActual];
        }, []);

    let productosVendidos = []
    //   for (const [key, value] of Object.entries(listaduplicados)) {
    //    productosVendidos.push(`${key} *(${value})*`)
    //  productosVendidos.join('\r\n')
    //}
    const prueba2 = () => {
        listaduplicados.map(item => {
            productosVendidos.push(item.name + " (" + item.quantity + ")")
        })
        productosVendidos.join('\r\n')
        return productosVendidos
    }

    const prueba = () => {

        dispatch(toggleFinishOrder(true))
    }

    const clickCopyOrders = () => {
        const resumeOrder = {
        fecha: date,
        pedidos: pedidos,
        efectivo: formatPrice(efectivo),
        mercadopago: formatPrice(mercadopago),
        total: `*${formatPrice(total)}*`,
        productos: prueba2(),
    }

        let result = []
        for (const [key, value] of Object.entries(resumeOrder)) {
            result.push(`${key}: ${value}`)
            console.log(result)
        }
        navigator.clipboard.writeText(result.join('\r\n'))
    }

    const clickSave = () => {
        clickCopyOrders()
        setSave(false)
    }

    const clickRemove = () => {
        dispatch(removeOrders())
        setRemove(false)
    }

    const openMsjSave = () => {
        setSave(!save)
        setRemove(false)
    }
    
    const openMsjClear = () => {
        setRemove(!remove);
        setSave(false)
    }

    const borrarLocal = () => {
        localStorage.clear()
        window.location.reload();
    }

    return (
        <Container>
            {save ?
                <>
                    <Background/>
                    <MsjNav style={{background: "#04a485"}}>
                        <span>¿Guardar pedidos?</span>
                        <div>
                            <MsjButton onClick={() => clickSave()} style={{color: "#4CCD99"}}><Check/></MsjButton>
                            <MsjButton onClick={() => setSave(false)} style={{color: "#4CCD99"}}><X/></MsjButton>
                        </div>
                    </MsjNav>
                </>
                : 
                <>  
                    <Background style={{display: "none"}}/>
                    <MsjNav style={{'transform': 'translateY(800px)'}}/>
                </>
            }
            {remove ? 
                <>
                    <Background/>
                    <MsjNav style={{background: "#D20062"}}>
                        <span>¿Borrar pedidos?</span>
                        <div>
                            <MsjButton onClick={() => clickRemove()}><Check/></MsjButton>
                            <MsjButton onClick={() => setRemove(false)}><X/></MsjButton>
                        </div>
                    </MsjNav>
                </>
                : 
                <>  
                    <Background style={{display: "none"}}/>
                    <MsjNav style={{'transform': 'translateY(800px)'}}/>
                </>
            }
            <TitlePage>
                <a>Config</a>
            </TitlePage>
            <ContainerPages>
                <ButtonPage onClick={() => openMsjSave()}>
                    <IconButton>
                        <CheckCircleOutlineIcon/>
                    </IconButton>
                    <a>Guardar Pedidos</a>
                    <span><ChevronRight/></span>
                </ButtonPage>
                <ButtonPage onClick={() => openMsjClear()}>
                    <IconButton>
                        <DeleteOutlineIcon/>
                    </IconButton>
                    <a>Borrar Pedidos</a>
                    <span><ChevronRight/></span>
                </ButtonPage>
                <ButtonPage onClick={() => dispatch(toggleEditor(false))}>
                    <IconButton>
                        <ModeEditOutlineIcon/>
                    </IconButton>
                    <a>Editar Productos</a>
                    <span><ChevronRight/></span>
                </ButtonPage>
                <ButtonPage onClick={() => setOpen(true)}>
                    <IconButton>
                        <UploadFileIcon/>
                    </IconButton>
                    <a>Cargar archivo</a>
                    <span><ChevronRight/></span>
                </ButtonPage>
            </ContainerPages>
            <ImportFile setOpen={setOpen} open={open}/>
        </Container>
    )
}

export default Config