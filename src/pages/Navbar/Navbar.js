import { useDispatch, useSelector } from "react-redux"
import { ButtonPage, ContainerNavbar, TextButton } from "./NavbarStyles"
import { toggleConfig, toggleEditor, toggleHome, toggleOrders } from "../../redux/actions/actionsSlice";
import { HiDotsHorizontal, HiOutlineDotsHorizontal, HiOutlineViewGrid, HiOutlineViewList, HiViewGrid, HiViewList } from "react-icons/hi";
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useState } from "react";

const Navbar2 = () => {
    const [value, setValue] = useState("menu");
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const dispatch = useDispatch()
    const activeHome = useSelector(state => state.actions.toggleHome)
    const activeOrders = useSelector(state => state.actions.toggleOrders)
    const activeConfig = useSelector(state => state.actions.toggleConfig)

    const clickToggleGrid = () => async (dispatch) => {
        dispatch(toggleHome(true))
        dispatch(toggleConfig(false))
        dispatch(toggleEditor(true))
        dispatch(toggleOrders(false))
    }

    const clickToggleOrders = () => async (dispatch) => {
        dispatch(toggleOrders(true))
        dispatch(toggleHome(false))
        dispatch(toggleConfig(false))
        dispatch(toggleEditor(true))
    }

    const clickToggleConfig = () => async (dispatch) => {
        dispatch(toggleOrders(false))
        dispatch(toggleHome(false))
        dispatch(toggleConfig(true))
        dispatch(toggleEditor(true))
    }

    return (
        <Box sx={{width: "100%", height: "10%", position: "fixed", bottom: "0"}}>
            <BottomNavigation value={value} onChange={handleChange}>
                <BottomNavigationAction label="Menú" icon={<HiViewGrid/>} value="menu"/>
                <BottomNavigationAction label="Pedidos" icon={<HiViewGrid/>} value="pedidos"/>
                <BottomNavigationAction label="Más" icon={<HiViewGrid/>} value="mas"/>
            </BottomNavigation>
        </Box>
    )
}

const Navbar = () => {
    const dispatch = useDispatch()
    const activeHome = useSelector(state => state.actions.toggleHome)
    const activeOrders = useSelector(state => state.actions.toggleOrders)
    const activeConfig = useSelector(state => state.actions.toggleConfig)

    const clickToggleGrid = () => async (dispatch) => {
        dispatch(toggleHome(true))
        dispatch(toggleConfig(false))
        dispatch(toggleEditor(true))
        dispatch(toggleOrders(false))
    }

    const clickToggleOrders = () => async (dispatch) => {
        dispatch(toggleOrders(true))
        dispatch(toggleHome(false))
        dispatch(toggleConfig(false))
        dispatch(toggleEditor(true))
    }

    const clickToggleConfig = () => async (dispatch) => {
        dispatch(toggleOrders(false))
        dispatch(toggleHome(false))
        dispatch(toggleConfig(true))
        dispatch(toggleEditor(true))
    }

    return (
        <ContainerNavbar>
            {activeHome? 
            <ButtonPage style={{fontWeight:"bold", color: "black"}}>
                <HiViewGrid size={28}/>
                <TextButton>Menú</TextButton>
            </ButtonPage>
            :
            <ButtonPage onClick={() => dispatch(clickToggleGrid(true))}>
                <HiOutlineViewGrid size={28}/>
                <TextButton>Menú</TextButton>
            </ButtonPage>
            }
            {activeOrders ?
            <ButtonPage style={{fontWeight:"bold", color: "black"}}>
                <HiViewList size={28}/>
                <TextButton>Pedidos</TextButton>
            </ButtonPage>
            :
            <ButtonPage onClick={() => dispatch(clickToggleOrders())}>
                <HiOutlineViewList size={28}/>
                <TextButton>Pedidos</TextButton>
            </ButtonPage>
            }
            {activeConfig ?
            <ButtonPage style={{fontWeight:"bold", color: "black"}}>
                <HiDotsHorizontal size={28}/>
                <TextButton>Más</TextButton>
            </ButtonPage>
            :
            <ButtonPage onClick={() => dispatch(clickToggleConfig())}>
                <HiOutlineDotsHorizontal size={28}/>
                <TextButton>Más</TextButton>
            </ButtonPage>
            }
        </ContainerNavbar>
    )
}

export default Navbar