import { useSelector } from "react-redux"
import Orders from "../Orders/Orders"
import Products from "../Products/Products"
import { ContainerHome } from "./HomeStyles"
import Editor from "../Editor/Editor"
import Config from "../Config/Config"


const Home = () => {
    const show = useSelector((state) => state.actions.toggleHome)
    const orders = useSelector((state) => state.actions.toggleOrders)
    const editor = useSelector((state) => state.actions.toggleEditor)
    const config = useSelector((state) => state.actions.toggleConfig)

    return (
        <ContainerHome>
            {show ? <Products/> : null}
            {orders ? <Orders/> : null}
            { config ? <Config/> : null }
            { editor ? null : <Editor/> }
        </ContainerHome>
    )
}
export default Home