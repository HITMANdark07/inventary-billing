import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { addToCart } from '../redux/cart/cart.action';
import {connect } from 'react-redux';

function Product({imageUrl,item, title,description,price,addCart}) {
  const [added, setAdded] = React.useState(false);
  
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
        <Typography variant="body2" color="text.secondary">
         {description}
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
        ₹{price}/-
        </Typography>
      </CardContent>
      <CardActions>
      <LoadingButton
        onClick={() => {
          addCart(item);
          setAdded(true);
        }}
        endIcon={<AddShoppingCartIcon />}
        loading={false}
        loadingPosition="end"
        variant="contained"
        disabled={added}
      >
        {added ? "ADDED" : "ADD"} TO CART
      </LoadingButton>
      </CardActions>
    </Card>
  );
}
const mapDispatchToProps = (dispatch) => ({
  addCart : item => dispatch(addToCart(item))
})
export default connect(null, mapDispatchToProps)(Product);