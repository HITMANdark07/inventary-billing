import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import { auth, fs } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import makeToast from '../Toaster';
import _ from 'lodash';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import moment from 'moment';

const ManageOrders = (props) => {
    const {currentUser,history,setUser} = props;
    const [orders, setOrder] = useState([]);
    const [loading, setLoading] = React.useState(true);
    const getOrders = () => {
        fs.collection("Orders").get().then(snapshot => {
                var ord=[];
                for(var snap of snapshot.docs){
                    ord.push({...snap.data(), id:snap.id});
                }
                setOrder(ord);
                setLoading(false);
        }).catch(error => {
            makeToast("error", error.message);
            setLoading(false);
        })
    }
    useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                getOrders();
            }else{
                history.push("/");
            }
        });
        return () => subs;
    },[currentUser,history]);
    const handleLogout=()=>{
        auth.signOut().then(()=>{
            setUser(null);
        })
    }
    const ord = _.sortBy(orders,"date").reverse();

    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <h2 style={{textAlign:"center"}}>MANAGE ORDERS</h2>
            { loading ? (<div style={{textAlign:"center", marginTop:40}}>
            <CircularProgress/>
            </div>):(
              <TableContainer component={Paper} style={{margin:"5px auto"}}>
              <Table aria-label="collapsible table">
                  <TableHead>
                  <TableRow>
                      <TableCell />
                      <TableCell>Customer Name</TableCell>
                      <TableCell align="right">Contact No.</TableCell>
                      <TableCell align="right">Date</TableCell>
                      <TableCell align="right">Total Price (₹)</TableCell>
                      <TableCell align="right">Total Discount (₹)</TableCell>
                      <TableCell align="right">Total Tax (₹)</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Bill</TableCell>
                      </TableRow>
                      </TableHead>
                      <TableBody>
                  {ord.map((order) => (
                      <Row history={history} key={order.id} row={order} />
                  ))}
                  </TableBody>
              </Table>
              </TableContainer>
            )}
            
        </DashBoard>
    )
}
function Row(props) {
    const { row } = props;
    const [open, setOpen] = useState(false);
    const [status,setStatus] = useState(row.status);
    const updateStatus = (event) => {
        fs.collection("Orders").doc(row.id).update({
            status: event.target.value
        }).then(() => {
            makeToast("success", "Status Updated...");
            setStatus(event.target.value);
        }).catch((error) => {
            makeToast("error", error.message);
        })
    }
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell align="right">+91 {row.phone}</TableCell>
          <TableCell align="right">{moment(row.date).format("DD/MM/YYYY")}</TableCell>
          <TableCell align="right">₹{row.totalPrice.toFixed(2)}/-</TableCell>
          <TableCell align="right">₹{row.totalDiscount.toFixed(2)}/-</TableCell>
          <TableCell align="right">₹{row.totalTax.toFixed(2)}/-</TableCell>
          <TableCell align="left">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Status</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Status"
                value={status}
                disabled={status==="REFUNDED" || status==="CANCELED"}
                onChange={updateStatus}
                >{
                  status==="DELIVERED" && 
                  <MenuItem  value={"DELIVERED"}>DELIVERED</MenuItem>
                }
                {
                  status==="REFUNDED" && 
                  <MenuItem value={"REFUNDED"} >REFUNDED</MenuItem>
                }
                {
                  status==="CANCELED" && 
                  <MenuItem value={"CANCELED"} >CANCELED</MenuItem>
                }
                {
                  status==="DELIVERED" && 
                  <MenuItem  value={"REFUNDED"}>REFUNDED</MenuItem>
                }
                {
                  status==="NOT PROCCESSED" &&
                  <MenuItem  value={"NOT PROCCESSED"}>NOT PROCCESSED</MenuItem>
                }
                {
                  status==="NOT PROCCESSED" &&
                  <MenuItem  value={"DELIVERED"}>DELIVERED</MenuItem>
                }
                {
                  status==="NOT PROCCESSED" &&
                  <MenuItem  value={"REFUNDED"}>REFUNDED</MenuItem>
                }
                {
                  status==="NOT PROCCESSED" &&
                  <MenuItem  value={"CANCELED"}>CANCELED</MenuItem>
                }
            </Select>
            </FormControl>
          </TableCell>
          <TableCell>
          <Button fullWidth
                    onClick={() => props.history.push(`/bill/${row.id}`)}
                    variant="contained"
                    startIcon={<LocalPrintshopIcon/>}
                    >Print bill</Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Payment Method: {row.payment}
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell >Product</TableCell>
                      <TableCell align="right">Price (₹)</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total price (₹)</TableCell>
                      <TableCell align="right">Discount (₹)</TableCell>
                      <TableCell align="right">CGST (₹)</TableCell>
                      <TableCell align="right">SGST (₹)</TableCell>
                      <TableCell align="right">Total tax (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.products.map((historyRow) => (
                      <TableRow key={historyRow.id}>
                        <TableCell component="th" scope="row">
                          {historyRow.title}
                        </TableCell>
                        <TableCell align="right">₹{historyRow.price.toFixed(2)}/-</TableCell>
                        <TableCell align="right">{historyRow.quantity}</TableCell>
                        <TableCell align="right">
                        ₹{historyRow.totalPrice.toFixed(2)}/-
                        </TableCell>
                        <TableCell align="right">
                        ₹{historyRow.totalDiscount.toFixed(2)}/- @{historyRow.discount}%
                        </TableCell>
                        <TableCell align="right">₹{historyRow.CGST.toFixed(2)}/- @{historyRow.tax/2}%</TableCell>
                        <TableCell align="right">₹{historyRow.SGST.toFixed(2)}/- @{historyRow.tax/2}%</TableCell>
                        <TableCell align="right">
                        ₹{(historyRow.CGST+historyRow.SGST).toFixed(2)}/- @{historyRow.tax}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
export default connect(mapStateToProps,mapDispatchToProps)(ManageOrders);