import _ from 'lodash';
import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import DashBoard from '../components/DashBoard';
import { auth,fs } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import makeToast from '../Toaster';
import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import moment from 'moment';
import CanvasJSReact from '../assets/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const SalesReport = (props) => {
    const {currentUser,history,setUser} = props;
    const [orders, setOrders] = useState([]);
    const [date1, setDate1] = useState(Date.now());
    const [date2, setDate2] = useState(Date.now());
    const [loading, setLoading] = React.useState(true);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [value, setValue] = React.useState([null, null]);
    const getOrders = () => {
        fs.collection("Orders").get().then(snapshot => {
                var ord=[];
                for(var snap of snapshot.docs){
                    ord.push({...snap.data(), id:snap.id});
                }
                setOrders(ord);
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
    const generateReport = useCallback((d1,d2) => {
        if(d1 && d2){
            let data = _.filter(orders, (ord) => ord.date>d1 && ord.date<d2 && ord.status==="DELIVERED");
            setFilteredOrders(data);
        }
    },[orders]);
    var ord = _.filter(orders,{status:"DELIVERED"});
    
    const createChartData = useCallback((ord) => {
        ord = _.sortBy(ord,"date");
        var data={};
        var chartd =[];
        ord.forEach((order) => {
            if(data[moment(order.date).format("YYYY,MM,DD")]){
                data[moment(order.date).format("YYYY,MM,DD")] +=1;
            }else{
                data[moment(order.date).format("YYYY,MM,DD")] =1;
            }
        })
        for(var key of Object.keys(data)){
            chartd.push({x:new Date(key),y:data[key]});
        }
        setChartData(chartd);
    },[]);

    useEffect(() => {
        generateReport(date1,date2);
        createChartData(_.filter(orders,{status:"DELIVERED"}))
    },[date1,date2,generateReport,createChartData,orders]);
    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light1", // "light1", "dark1", "dark2"
        title:{
            text: "SALES CHART"
        },
        axisY: {
            title: "No. of Sales",
            includeZero: false,
        },
        axisX: {
            title: "Time",
            interval: 2
        },
        data: [{
            type: "line",
            toolTipContent: "{x}: {y} sales",
            dataPoints: chartData
        }]
    }
    
    const actualSale = ord.reduce((acc,o) => acc+o.totalPrice,0);
    const taxCollected = ord.reduce((acc,o) => acc+o.totalTax,0);
    
    const actualSaleRange = filteredOrders.reduce((acc,o) => acc+o.totalPrice,0);
    const taxCollectedRange = filteredOrders.reduce((acc,o) => acc+o.totalTax,0);
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            {currentUser && currentUser.role==="staff" && <Redirect to="/" />}
            <div className="invoice-box">
                <div style={{margin:'10px auto',textAlign:"center"}}><h3>SALES REPORT</h3></div>
                { loading && (<div style={{textAlign:"center", marginTop:70}}>
                <CircularProgress/>
              </div>)}
                <table>
                    <thead>
                        <tr className="heading">
                        <td className="tdata">Total Sales:</td>
                        <td className="tdata">Total Tax Collection:</td>
                        <td className="tdata" align="right">Number of Orders Delivered:</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>₹{actualSale.toFixed(2)}/-</td>
                            <td>₹{taxCollected.toFixed(2)}/-</td>
                            <td align="right">{ord.length}</td>
                        </tr>
                    </tbody>
                </table>
                <br/>
                <br/>
                <CanvasJSChart options = {options} 
				/* onRef={ref => this.chart = ref} */
			    />
                <br/>
                <div style={{margin:'10px auto',textAlign:"center"}}>CHECK SALES MANUALLY</div>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateRangePicker
                        startText="Start-date"
                        endText="End-date"
                        value={value}
                        onChange={(newValue) => {
                        setValue(newValue);
                        setDate1(newValue[0]);
                        setDate2(newValue[1]);
                        }}
                        renderInput={(startProps, endProps) => (
                        <div style={{margin:'10px auto',textAlign:"center",display:"flex", flexDirection:"row"}}>
                            <TextField {...startProps} />
                            <Box sx={{ mx: 2 }}> to </Box>
                            <TextField {...endProps} />
                        </div>
                        )}
                    />
                    </LocalizationProvider>
                <table>
                    <thead>
                        <tr className="heading">
                        <td className="tdata">Total Sales:</td>
                        <td className="tdata">Total Tax Collection:</td>
                        <td className="tdata" align="right">Number of Orders Delivered:</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>₹{actualSaleRange.toFixed(2)}/-</td>
                            <td>₹{taxCollectedRange.toFixed(2)}/-</td>
                            <td align="right">{filteredOrders.length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </DashBoard>
    )
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
export default connect(mapStateToProps,mapDispatchToProps)(SalesReport);