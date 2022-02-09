import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/DashBoard';
import { auth,fs } from '../firebase';
import { setCurrentUser } from '../redux/user/user.action';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Product from '../components/Product';
import CircularProgress from '@mui/material/CircularProgress';

const Shop = (props) => {
    const {currentUser,history,setUser} = props;
    const [loading, setLoading] = React.useState(true);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
     useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                fs.collection("Products").get().then(snapshot => {
                    let productsArray =[];
                    for(var snap of snapshot.docs){
                        var data = snap.data();
                        productsArray.push({...data, id:snap.id});
                    }
                    if(snapshot.docs.length===productsArray.length){
                        setProducts(productsArray);
                        setLoading(false);
                    }
                })
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
    const searchHandler = (event) => {
        event.preventDefault();
        setSearchTerm(event.target.value);
    }
    const filteredProducts = products.filter((pro) => pro.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return(
        <Dashboard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <div style={{margin:' 0 auto'}}>
            <Paper
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center',marginLeft:'10%', width: "80%" , marginTop:"20px"}}
                >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="SEARCH PRODUCTS"
                    inputProps={{ 'aria-label': 'SEARCH BAR' }}
                    onChange={searchHandler}
                />
                <IconButton sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </Paper>
            </div>
            { loading && (<div style={{textAlign:"center", marginTop:100}}>
                <CircularProgress/>
              </div>)}
            <div>
                <div style={{display:'flex',flexDirection:"row",flexWrap:'wrap', justifyContent:'space-around'}}>
                {filteredProducts.map((pro) => (
                    <Product key={pro.id} title={pro.title} item={pro} description={pro.description} imageUrl={pro.url} price={pro.price} />
                ))}
                </div>
            </div>
        </Dashboard>
    )
}
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})

export default connect(mapStateToProps,mapDispatchToProps)(Shop);