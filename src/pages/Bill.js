import React, { useCallback, useEffect, useState } from 'react';
import {auth, fs} from '../firebase/index';
import logo from '../assets/commerce-logo.png';
import moment from "moment";

const Bill = (props) => {
    const {billID}= props.match.params;
    const {history} = props;
    const [order, setOrder] = useState("");

    const getOrderDetails = useCallback(() => {
        fs.collection('Orders').doc(billID).get().then(data => {
            setOrder(data.data());
        })
    },[billID])
    useEffect(() => {
        const subs = auth.onAuthStateChanged(user => {
            if(user){
                getOrderDetails();
            }else{
                history.push("/")
            }
        })
        return () => subs;
    },[history,getOrderDetails])
    return(
		<>
        <div className="invoice-box">
			<table cellPadding="0" cellSpacing="0">
				<div style={{display:'flex', flexDirection:"row",justifyContent:"space-between"}}>
					<div style={{display:'flex',flexDirection:'row'}}>
						<div><img alt="business-logo" src={logo} style={{width: '100px', height:"100px"}} /></div>
						<div style={{display:"flex",flexDirection:"column", justifyContent:"center"}}>
							<div><b style={{color:"skyblue"}}>Ecommerce Billing Private Ltd.</b></div>
							<div>GSTIN : XXXXXXXXXXXX</div>
							<div>STATE : Andhra Pradesh(37)</div>
							<div>PAN : XXXXXXXXXXXX</div>
						</div>
					</div>
					<div style={{display:"flex",flexDirection:"column", justifySelf:"center"}}>
					<div ><b>Total : ₹{order && order.totalPayable.toFixed(2)}/-</b></div>
					<div>Invoice Date : {moment(order && order.date).format("DD/MM/YYYY")}</div>
					<div>Invoice Time: {moment(order && order.date).format(" h:mm a")}</div>
					<div>Invoice No. : {order && order.invoiceNumber}</div>
					</div>
				</div>
				<hr/>
				<div style={{display:'flex', flexDirection:"row",justifyContent:"space-between"}}>
					<div style={{display:"flex",flexDirection:"column", justifySelf:"center"}}>
						<div><b>Customer Name:</b></div>
						<div>{order && order.name}</div>
						<div><b>Contact No. :</b></div>
						<div>+91 {order && order.phone}</div>
					</div>
					{/* <div style={{display:"flex",flexDirection:"column", justifySelf:"center"}}>
						<div><b>Billing Address:</b></div>
						<div>XXXXXX Lane Road</div>
						<div>X249- plot 345 XXXXXX</div>
						<div>Andhra Pradesh</div>
					</div>
					<div style={{display:"flex",flexDirection:"column", justifySelf:"center"}}>
						<div><b>Shipping Address:</b></div>
						<div>XXXXXX Lane Road</div>
						<div>X249- plot 345 XXXXXX</div>
						<div>Andhra Pradesh</div>
					</div> */}
				</div>
				<hr/>
				{/* <tr className="top">
					<td colSpan="2">
						<table>
							<tr>
								<td className="title">
									<img alt="business-logo" src={logo} style={{width: '100%', maxWidth: '100px'}} />

								</td>

								<td>
									Invoice #: {order && order.invoiceNumber}<br />
									Date: {moment(order && order.date).format("dddd, MMMM Do YYYY")}<br />
									Time: {moment(order && order.date).format(" h:mm a")}
								</td>
							</tr>
						</table>
					</td>
				</tr> */}

				{/* <tr className="information">
					<td colSpan="4">
						<table>
							<tr>
								<td>
									Bill Project, Inc.<br />
									12345, Chandni Chowk Road<br />
									New Delhi, south XXXXX
								</td>

								<td>
									{order && order.name}<br />
									Contact:<br />
									+91 {order && order.phone}
								</td>
							</tr>
						</table>
					</td>
				</tr> */}
			</table>
			<table>
				<thead>
					<tr colSpan="8" className="heading">
						<td>Payment Method</td>
						<td>STATUS #</td>
					</tr>
				</thead>
				<tbody>
					<tr colSpan="8">
						<td>{order && order.payment}</td>
						<td>{order && order.status}</td>
					</tr>
				</tbody>
			</table>
			<table>
				<thead>
					<tr className="heading">
						<td>Product</td>
						<td>Price (₹)</td>
						<td align="right">Quantity</td>
						<td align="right">Total Price (₹)</td>
						<td align="right">Discount (₹)</td>
						<td align="right">SGST (₹)</td>
						<td align="right">CGST (₹)</td>
						<td align="right">Total Payable Amount (₹)</td>
					</tr>
				</thead>
				<tbody>
					{
						order &&
						order.products.map((product) => (
							<tr key={product.id}>
								<td>{product.title}</td>
								<td>₹{product.price.toFixed(2)}/-</td>
								<td align="right">{product.quantity}</td>
								<td align="right">₹{product.totalPrice.toFixed(2)}/-</td>
								<td align="right">₹{product.totalDiscount.toFixed(2)}/- @{(product.discount)+"%"}</td>
								<td align="right">₹{product.CGST.toFixed(2)}/- @{(product.tax/2)+"%"}</td>
								<td align="right">₹{product.SGST.toFixed(2)}/- @{(product.tax/2)+"%"}</td>
								<td align="right">₹{(product.SGST+product.CGST+product.totalPrice-product.totalDiscount).toFixed(2)}/-</td>
							</tr>
						))
					}
				</tbody>
				<tfoot>
					<tr className="heading">
						<td colSpan="5"><b>Total:</b></td>
						<td colSpan="2" align="center">₹{order && order.totalTax.toFixed(2)}/-   </td>
						<td align="right">₹{order && order.totalPayable.toFixed(2)}/-</td>
					</tr>
				</tfoot>
			</table>
			<table>
				<tbody>
					<tr>
						<td colSpan="7" align="right">Total Price(exclusive of GST):</td>
						<td colSpan="1">₹{order && order.totalPrice.toFixed(2)}/-</td>
					</tr>
					<tr>
						<td colSpan="7" align="right">Total Tax(SGST+CGST):</td>
						<td colSpan="1">₹{order && order.totalTax.toFixed(2)}/-</td>
					</tr>
					<tr>
						<td colSpan="7" align="right">Total Discount(₹):</td>
						<td colSpan="1">₹{order && order.totalDiscount.toFixed(2)}/-</td>
					</tr>
					<tr className="heading">
						<td colSpan="7" align="right">Total Payable Amount(₹):</td>
						<td colSpan="1">₹{order && order.totalPayable.toFixed(2)}/-</td>
					</tr>
				</tbody>
			</table>
			<br/>
			<div style={{marginTop:"50px", display:'flex',flexDirection:'row', justifyContent:"space-between"}}>
					<div><u>customer sign.</u></div>
					<div><u>Merchant sign.</u></div>
			</div>
		</div>
		<div style={{textAlign:"center", margin:'20px'}}><button onClick={ () => {
                window.print()
            }}>PRINT BILL</button></div>
		</>
    )
}
export default Bill;