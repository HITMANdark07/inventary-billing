import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/DashBoard';
import { auth,fs } from '../firebase';
import { setCurrentUser } from '../redux/user/user.action';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import { styled, Box } from '@mui/system';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper'
import ModalUnstyled from '@mui/core/ModalUnstyled';
import CartProduct from '../components/CartProduct';
import CircularProgress from '@mui/material/CircularProgress';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import makeToast from '../Toaster';
import { clearCart } from '../redux/cart/cart.action';

const Shop = (props) => {
    const {currentUser,history,setUser} = props;
    const [open, setOpen] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderlength, setOrderLength] = useState(0);
    const [payment, setPayment] = useState("CASH");
    const handleClose= () => {
        setOpen(false);
    }
     useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                fs.collection("Orders").get().then(snapshot => {
                    setOrderLength(snapshot.docs.length);
                })
                fs.collection("Products").get().then(snapshot => {
                    let productsArray =[];
                    for(var snap of snapshot.docs){
                        var data = snap.data();
                        productsArray.push({...data, id:snap.id});
                    }
                    if(snapshot.docs.length===productsArray.length){
                        // setProducts(productsArray);
                    }
                })
            }else{
                history.push("/");
            }
        });
        return () => subs;
    },[currentUser,history]);
    const getInvoiceNumber = (order) => {
        var uNum = new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-";
        if(order<9){
            return uNum+"00000"+(order+1)
        }else if(order<99){
            return uNum+"0000"+(order+1);
        }else if(order<999){
            return uNum+"000"+(order+1);
        }else if(order<9999){
            return uNum+"00"+(order+1);
        }else if(order<99999){
            return uNum+"0"+(order+1);
        }else{
            return uNum+(order+1);
        }
    }
    const StyledModal = styled(ModalUnstyled)`
        position: fixed;
        z-index: 1300;
        right: 0;
        bottom: 0;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        `;

        const Backdrop = styled('div')`
        z-index: -1;
        position: fixed;
        right: 0;
        bottom: 0;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-tap-highlight-color: transparent;
        `;

        const style = {
        width: 400,
        bgcolor: 'white',
        // border: '2px solid #000',
        borderRadius:'5px',
        p: 2,
        px: 4,
        pb: 3,
        };

    const handleLogout=()=>{
        auth.signOut().then(()=>{
            setUser(null);
        })
    }
    const totalTax = props.cartItems.reduce((acc,emm) => acc+(emm.CGST+emm.SGST),0);
    const totalPayable = props.cartItems.reduce((acc,emm) => acc+(emm.totalPrice+emm.CGST+emm.SGST-emm.totalDiscount),0);
    const totalDiscount = props.cartItems.reduce((acc,emm)=> acc+emm.totalDiscount,0);
    const totalPrice = props.cartItems.reduce((acc,emm) => acc+emm.totalPrice ,0);
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));
      
      const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }));
      const placeOrder = event => {
        event.preventDefault();
        setOrderLoading(true);
        const data = new FormData(event.currentTarget);
        if(data.get("name") && data.get("phone")){
            fs.collection("Orders").add({
                name:data.get("name"),
                phone:data.get("phone"),
                products: props.cartItems,
                status: "NOT PROCCESSED",
                totalPayable:Number(totalPayable.toFixed(2)),
                totalTax:Number(totalTax.toFixed(2)),
                totalDiscount:Number(totalDiscount.toFixed(2)),
                invoiceNumber:getInvoiceNumber(orderlength),
                totalPrice:Number(totalPrice.toFixed(2)),
                payment,
                date: Date.now()
            }).then((data) =>{
                if(data){
                    props.emptyCart();
                    setOrderLoading(false);
                    setOpen(false);
                    makeToast("success", "Order Placed...");
                }else{
                    makeToast("error", "Order Processing Failed.");
                    setOrderLoading(false);
                }
            })
        }else{
            makeToast("warning", "All fields are required");
            setOrderLoading(false);
        }
      }

    return(
        <div>
        <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
      >

        <Box component="form" onSubmit={placeOrder} noValidate sx={style}>
        <FormControl fullWidth>
        <InputLabel id="payment">Payment</InputLabel>
        <Select
            id="payment"
            label="Payment"
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
        >
            <MenuItem value="CASH">CASH</MenuItem>
            <MenuItem value="CARD">CARD</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="NET BANKING">NET BANKING</MenuItem>
        </Select>
        </FormControl>
        <TextField
            margin="normal"
            required
            fullWidth
            name="name"
            label="Name"
            id="name"
            autoComplete="name"
            autoFocus
        />
        <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            type="number"
            label="Phone Number"
            name="phone"
            autoComplete="phone"
        />
        { orderLoading && (<div style={{textAlign:"center"}}>
        <CircularProgress/>
        </div>)}
        <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={orderLoading}
            sx={{ mt: 3, mb: 2 }}
            startIcon={<SendIcon />}
        >
            {orderLoading ? "PLACING...": "PLACE"} ORDER
        </Button>
        </Box>
      </StyledModal>
        <Dashboard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <div style={{margin:' 0 auto'}}>
                {props.cartItems.length<1 && <h2 style={{textAlign:"center"}}>Your Cart is Empty</h2>}
            </div>
            <div>
                <div style={{display:'flex',flexDirection:"row",flexWrap:'wrap', justifyContent:'space-around'}}>
                {props.cartItems.map((pro) => (
                    <CartProduct key={pro.id} title={pro.title} item={pro} description={pro.description} imageUrl={pro.url} price={pro.price} />
                ))}
                </div>
            </div>
            <div style={{maxWidth:"800px", margin:'20px auto', flexDirection:'column'}}>
            {props.cartItems && props.cartItems.length>0 && (
                <Typography>
                CART SUMMARY:
                </Typography>
            )}
            {props.cartItems && props.cartItems.length>0 &&<TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                <TableRow>
                    <StyledTableCell>Product Title</StyledTableCell>
                    <StyledTableCell align="right">Price (₹)</StyledTableCell>
                    <StyledTableCell align="right">Quantity </StyledTableCell>
                    <StyledTableCell align="right">Total Price</StyledTableCell>
                    <StyledTableCell align="right">Discount</StyledTableCell>
                    <StyledTableCell align="right">Tax (CGST+SGST)</StyledTableCell>
                    <StyledTableCell align="right">Total Payable Amount</StyledTableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {
                        props.cartItems.map((cartItem) => (
                            <StyledTableRow key={cartItem.id}>
                            <StyledTableCell component="th" scope="row">
                                {cartItem.title}
                            </StyledTableCell>
                            <StyledTableCell align="right">₹{cartItem.price}/-</StyledTableCell>
                            <StyledTableCell align="right">{cartItem.quantity} </StyledTableCell>
                            <StyledTableCell align="right">₹{cartItem.totalPrice}/-</StyledTableCell>
                            <StyledTableCell align="right">₹{cartItem.totalDiscount}/- @{cartItem.discount}%</StyledTableCell>
                            <StyledTableCell align="right">₹{(cartItem.CGST+cartItem.SGST).toFixed(2)}/- ({cartItem.tax}%)</StyledTableCell>
                            <StyledTableCell align="right">₹{(cartItem.SGST+cartItem.CGST+cartItem.totalPrice-cartItem.totalDiscount).toFixed(2)}/-</StyledTableCell>
                            </StyledTableRow>
                        ))
                    }
                    <StyledTableRow >
                            <StyledTableCell component="th" scope="row">
                                <b>Total:</b>
                            </StyledTableCell>
                            <StyledTableCell align="right"></StyledTableCell>
                            <StyledTableCell align="right"> </StyledTableCell>
                            <StyledTableCell align="right">₹{totalPrice.toFixed(2)}/-</StyledTableCell>
                            <StyledTableCell align="right">₹{totalDiscount.toFixed(2)}/-</StyledTableCell>
                            <StyledTableCell align="right">₹{totalTax.toFixed(2)}/-</StyledTableCell>
                            <StyledTableCell align="right">₹{totalPayable.toFixed(2)}/-</StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow >
                            <StyledTableCell component="th" scope="row">
                            </StyledTableCell>
                            <StyledTableCell align="right"></StyledTableCell>
                            <StyledTableCell align="right"> </StyledTableCell>
                            <StyledTableCell align="right"></StyledTableCell>
                            <StyledTableCell align="right"></StyledTableCell>
                            <StyledTableCell align="right"></StyledTableCell>
                            <StyledTableCell align="right">
                            <Button variant="contained" size="large" startIcon={<SendIcon />}
                            onClick={() => setOpen(true)}
                            >
                            PLACEORDER
                            </Button></StyledTableCell>
                    </StyledTableRow>
                </TableBody>
            </Table>
            </TableContainer>}
            </div>
        </Dashboard>
        </div>
    )
}
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user)),
    emptyCart: () => dispatch(clearCart())
})
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    cartItems: state.cart.cartItems
})

export default connect(mapStateToProps,mapDispatchToProps)(Shop);