import { useSelector } from "react-redux"
import CardProduct from "../../components/Products/CardProduct"
import { CardPlus, ContainerCategory, ContainerProducts, GlobalProducts, GridProducts, TitleCategory, TitleProducts } from "./ProductsStyled"
import CartIcon from "../../components/CartIcon/CartIcon"
import { Plus } from "react-feather"
import { useState } from "react"
import CardNewProduct from "../../components/Products/CardNewProduct"


const Products = () => {
    const products = useSelector((state) => state.data.products)
    const [hiddenCard, setHiddenCard] = useState(false);

    return (
        <GlobalProducts>
            <TitleProducts>
                <a>Menú</a>
                <CardPlus onClick={() => setHiddenCard(true)}><Plus size={35}/></CardPlus>
            </TitleProducts>
            <ContainerProducts>
                <ContainerCategory>
                    <TitleCategory>Helado</TitleCategory>
                    <GridProducts>
                        {products.filter(function (item) {return item.category === "Helado"}).map(item =>
                            {return <CardProduct key={item.id} {...item}/>
                        })}
                    </GridProducts>
                    </ContainerCategory>
                <ContainerCategory>
                    <TitleCategory>Paletas</TitleCategory>
                    <GridProducts>
                        {products.filter(function (item) {return item.category === "Paletas"}).map(item =>
                            {return <CardProduct key={item.id} {...item}/>
                        })}
                    </GridProducts>
                </ContainerCategory>
                <ContainerCategory>
                    <TitleCategory>Varios</TitleCategory>
                    <GridProducts>
                        {products ?
                        products.filter(function (item) {return item.category === "Varios"}).map(item =>
                            {return <CardProduct key={item.id} {...item}/>
                        }) : null}
                    </GridProducts>
                </ContainerCategory>
                <ContainerCategory>
                    <TitleCategory>Consumir en el local</TitleCategory>
                    <GridProducts>
                        {products?
                        products.filter(function (item) {return item.category === "Consumir en el local"}).map(item =>
                            {return <CardProduct key={item.id} {...item}/>
                        })
                        : null
                        }
                    </GridProducts>
                </ContainerCategory>
                <ContainerCategory style={{marginBottom: "6em"}}>
                    <TitleCategory>Extras</TitleCategory>
                    <GridProducts>
                        {products ? 
                        products.filter(function (item) {return item.category === "Extras"}).map(item =>
                            {return <CardProduct key={item.id} {...item}/>
                        }) : null }
                    </GridProducts>
                </ContainerCategory>
                <div>
                </div>
            </ContainerProducts>
            <CartIcon/>
            {hiddenCard? 
            <CardNewProduct setHiddenCard={setHiddenCard}/> : null
            }
        </GlobalProducts>
    )
}

export default Products