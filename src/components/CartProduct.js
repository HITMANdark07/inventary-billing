import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Badge from '@mui/material/Badge';
import ButtonGroup from '@mui/material/ButtonGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Typography from '@mui/material/Typography';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { addToCart, changeDiscount, changetax, removefromCart, removeItemfromCart } from '../redux/cart/cart.action';
import { TAX, DISCOUNT } from "../utils/index";
import {connect } from 'react-redux';

function CartProduct({imageUrl,item, title,price,addCart, removeCart, removeItem, setTax,setDiscount}) {
  return (
    <Card sx={{ width: 300,margin:'10px' }}>
      <CardMedia
        component="img"
        width="100"
        height="200"
        image={imageUrl}
        alt="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <div>
        </div>
        <Typography gutterBottom variant="h6" component="div">
        ₹{price}/-
        </Typography>
      </CardContent>
      <div style={{width:"100%"}}>
      <FormControl style={{width:"50%"}}>
        <InputLabel id="demo-simple-select-label">Tax</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Tax"
            value={item.tax}
            onChange={(e) => {setTax({item, tax: e.target.value})}}
        >
            {
              TAX.map((tax,idx) => (
                <MenuItem key={idx} value={tax}>{tax}%</MenuItem>
              ))
            }
        </Select>
        </FormControl>
        <FormControl style={{width:"50%"}}>
        <InputLabel id="demo-simple-select-label2">Discount</InputLabel>
        <Select
            labelId="demo-simple-select-label2"
            id="demo-simple-select2"
            label="Discount"
            value={item.discount}
            onChange={(e) => {setDiscount({item, discount: e.target.value})}}
        >
            {
              DISCOUNT.map((discount,idx) => (
                <MenuItem key={idx} value={discount}>{discount}%</MenuItem>
              ))
            }
        </Select>
        </FormControl>
      </div>
      <CardActions>
          <Typography>
              Quantity:
            </Typography>
      <Badge color="secondary" badgeContent={item.quantity}>
          <ShoppingCartIcon />
        </Badge>
        <ButtonGroup>
          <Button
            aria-label="reduce"
            onClick={() => {
             removeCart(item);
            }}
          >
            <RemoveIcon fontSize="small" />
          </Button>
          <Button
            aria-label="increase"
            onClick={() => {
            addCart(item);
            }}
          >
            <AddIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      </CardActions>
      <CardActions>
      <LoadingButton
        onClick={() => removeItem(item)}
        startIcon={<RemoveShoppingCartIcon />}
        loading={false}
        loadingPosition="start"
        color="secondary"
        variant="contained"
      >
        REMOVE
      </LoadingButton>
      </CardActions>
    </Card>
  );
}
const mapDispatchToProps = (dispatch) => ({
  addCart : item => dispatch(addToCart(item)),
  removeCart: item => dispatch(removefromCart(item)),
  removeItem: item => dispatch(removeItemfromCart(item)),
  setTax : item => dispatch(changetax(item)),
  setDiscount: item => dispatch(changeDiscount(item))
})
export default connect(null, mapDispatchToProps)(CartProduct);