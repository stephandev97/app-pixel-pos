import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pb } from '../../lib/pb';
import { addPedidoToOrders, removeOrder, minNumOrder, toggleCheck } from './orders-utils';
  
  const INITIAL_STATE = {
    orders: [],
  };

  export const syncAllOrdersToServer = createAsyncThunk(
      'orders/syncAllToServer', async (__dirname, {getState, rejectWithValue}) => {
        try {
          const state = getState()
          const localOrders = state.orders?.orders ?? [] // <-- acá lee tu Redux
  
          //Traigo del server id+number para decidir create/update
          const remote = await pb.collection('orders').getFullList({
            fields: 'id,number',
            sort: '-updated',
          })
          const remoteByNumber = new Map(remote.map(r => [r.number, r]))
  
          let created = 0, updated = 0, failed = 0
          const errors = []
  
          const toNumber = (v, def=0) => (typeof v === 'number' ? v : Number(v ?? def))
          const toBool = (v, def=false) => (typeof v === 'boolean' ? v : !!v)
  
          for (const o of localOrders) {
            // armamos el payload EXACTO según tus fields
            const payload = {
            number:    o.number || `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
            items:     Array.isArray(o.items) ? o.items : (o.items ?? []),
            direccion: o.direccion || '',
            total:     toNumber(o.total, 0),
            pago:      toNumber(o.pago, 0),
            cambio:    toNumber(o.cambio, 0),
            check:     toBool(o.check, false),
            hora:      o.hora || new Date().toLocaleTimeString('es-AR', {
                          hour:'2-digit', minute:'2-digit', timeZone:'America/Argentina/Buenos_Aires'
                        }),
          }
          
          try {
            const existing = remoteByNumber.get(payload.number)
            if (existing) {
              await pb.collection('orders').update(existing.id, payload)
              updated++
            } else {
              const rec = await pb.collection('orders').create(payload)
              remoteByNumber.set(rec.number, rec)
              created++
            }
          } catch (e) {
            failed++
            errors.push({ number: payload.number, error: e?.data || e?.message })
          }
        }
  
        return { created, updated, failed, errors }
      } catch (e) {
        return rejectWithValue(e?.data || { message: e.message })
      }
    }
  )
  
  const ordersSlice = createSlice({
    name: 'orders',
    initialState: INITIAL_STATE,
    reducers: {
      addToOrders: (state, action) => {
        return {
          ...state,
          orders: addPedidoToOrders(state.orders, action.payload),
        }
      },
      removeFromOrders: (state, action) => {
        return {
          ...state,
          orders: removeOrder(state.orders, action.payload),
        }
      },
      reduceNumOrder: (state, action) => {
        return {
          ...state,
          orders: minNumOrder(state.orders, action.payload)
        }
      },
      changeCheck: (state, action) => {
        return {
        ...state,
        orders: toggleCheck(state.orders, action.payload)
        }
      },
      removeOrders: state => {
        return {
          ...state,
          orders: []
        }
      },
}});
  
  export const { addToOrders, removeFromOrders, reduceNumOrder, changeCheck, removeOrders } = ordersSlice.actions;
  
  export default ordersSlice.reducer;