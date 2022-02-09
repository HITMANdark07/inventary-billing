import {cartActionTypes} from './cart.types';
import { addItemToCart, changeDiscount, changetaxCart, removeItemfromCart } from './cart.utils';

const INITIAL_STATE = {
    cartItems:[],
    drawer:true,
}

const cartReducer = (state = INITIAL_STATE, action) => {
    switch(action.type){
        case cartActionTypes.ADD_ITEM :
            return {
                ...state,
                cartItems:addItemToCart(state.cartItems,action.payload),
            }

        case cartActionTypes.REMOVE_ITEM:
            return{
                ...state,
                cartItems: removeItemfromCart(state.cartItems, action.payload),
            }

        case cartActionTypes.CLEAR_CART:
            return{
                ...state,
                cartItems:[]
            }
        case cartActionTypes.TOGGLE_DRAWER:
            return{
                ...state,
                drawer:!state.drawer
            }
        case cartActionTypes.CHANGE_TAX:
            return{
                ...state,
                cartItems: changetaxCart(state.cartItems,action.payload)
            }
        case cartActionTypes.CHANGE_DISCOUNT:
            return{
                ...state,
                cartItems: changeDiscount(state.cartItems,action.payload)
            }
        case cartActionTypes.CLEAR_ITEM_FROM_CART:
            return{
                ...state,
                cartItems: state.cartItems.filter((cartitem) => cartitem.id !==action.payload.id)
            }
        default:
            return state
    }
}

export default cartReducer;