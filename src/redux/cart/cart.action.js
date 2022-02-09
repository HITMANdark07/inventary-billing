import { cartActionTypes } from './cart.types';

export const addToCart = (item) => ({
        type: cartActionTypes.ADD_ITEM,
        payload: item 
})

export const removefromCart = (item) => ({
        type: cartActionTypes.REMOVE_ITEM,
        payload: item
})
export const changetax = (item) => ({
        type: cartActionTypes.CHANGE_TAX,
        payload:item
})

export const removeItemfromCart = item => ({
        type:cartActionTypes.CLEAR_ITEM_FROM_CART,
        payload:item
})

export const clearCart = () => ({
        type: cartActionTypes.CLEAR_CART,
})

export const changeDiscount = (item) => ({
        type:cartActionTypes.CHANGE_DISCOUNT,
        payload:item
})

export const toggleDrawer = () => ({
        type: cartActionTypes.TOGGLE_DRAWER,
})
