import { set, useForm } from "react-hook-form"
import { Background, Button, ContainerCard, DivInput, Input, PreFix } from "./styles/CardNewProductStyles"
import { DollarSign } from "react-feather"
import { LuIceCream } from "react-icons/lu"
import uniqid from 'uniqid';
import { useDispatch } from "react-redux";
import { addNewProductToCart } from "../../redux/cart/cartSlice";

const CardNewProduct = ({setHiddenCard}) => {
    const dispatch = useDispatch()
    const { register, handleSubmit, setValue, getValues } = useForm()
    const generateId = uniqid()

    const onSubmit = () => {
        const product = {
            name: getValues("nombre"),
            price: getValues("precio"),
            id: generateId,
            quantity: 1,
        }

        dispatch(addNewProductToCart(product))
        setHiddenCard(false)
    }

    return (
        <>
            <Background onClick={() => setHiddenCard(false)}/>
            <ContainerCard onSubmit={handleSubmit(onSubmit)}>
                <DivInput>
                    <PreFix><LuIceCream/></PreFix>
                    <Input {...register("nombre", { required: true })} type='text'  placeholder='Producto'/>
                </DivInput>
                <DivInput>
                    <PreFix><DollarSign size={16}/></PreFix>
                    <Input {...register("precio", { required: true })} type='number' placeholder='Precio'/>
                </DivInput>
                <Button type="submit">Agregar</Button>
            </ContainerCard>
        </>
    )
}

export default CardNewProduct