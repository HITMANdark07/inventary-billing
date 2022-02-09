import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import { auth,fs,storage } from '../firebase/index';
import Button from '@mui/material/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { styled } from '@mui/system';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper'
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { setCurrentUser } from '../redux/user/user.action';
import makeToast from '../Toaster';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import moment from 'moment';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';


const ManageProducts = (props) => {
    const {currentUser,history,setUser} = props;
    const [cat, setCat] = useState([]);
    const [products, setProducts] = useState([]);
    const [title, setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [loading, setLoading] = React.useState(true);
    const [addLoading, setAddLoading]  = useState(false);
    const [price, setPrice] = useState("");
    const [progress, setProgress] = useState(0);
    const [category,setCategory] = useState("");
    const [image,setImage] = useState(null);
    const getCategories = () => {
        fs.collection("Categories").get().then(snapshot => {
            const cats = [];
            for(var snap of snapshot.docs){
                cats.push({...snap.data(),id:snap.id});
            }
            setCat(cats);
            setCategory(cats[0].title)
        }).catch(error => {
            makeToast("error", error.message);
        })
    }
    const getProducts = () => {
        fs.collection("Products").get().then(snapshot => {
            const pros=[];
            for(var snap of snapshot.docs){
                pros.push({...snap.data(),id:snap.id});
            }
            setProducts(pros);
            setLoading(false);
        }).catch(error => {
            makeToast("error", error.message);
            setLoading(false);
        })
    }
    const handleChange = (event, name) => {
        switch(name){
            case "title":
                setTitle(event.target.value);
                break;
            case "description":
                setDescription(event.target.value);
                break;
            case "price":
                setPrice(event.target.value);
                break;
            case "category":
                setCategory(event.target.value);
                break;
            default:
        }
    }
    const types =['image/jpg','image/jpeg','image/png','image/PNG'];
    const handleProductImg=(e)=>{
        let selectedFile = e.target.files[0];
        if(selectedFile){
            if(selectedFile&&types.includes(selectedFile.type)){
                setImage(selectedFile);
            }
            else{
                setImage(null);
                makeToast("error",'please select a valid image file type (png or jpg)')
            }
        }
        else{
            console.log('please select your file');
        }
    }
    useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                getCategories();
                getProducts();
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
    const handleSubmit =(event) => {
        event.preventDefault();
        setAddLoading(true);
        if(image!==null){
            //saving product to database
        const uploadTask=storage.ref(`product-images/${image.name}`).put(image);
        uploadTask.on('state_changed',snapshot=>{
            const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100
            setProgress(progress);
        },error=>{makeToast("error",error.message); setAddLoading(false);},()=>{
            storage.ref('product-images').child(image.name).getDownloadURL().then(url=>{
                fs.collection('Products').add({
                    title,
                    description,
                    category,
                    price: Number(price),
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                    url
                }).then(()=>{
                    makeToast("success",'Product added successfully');
                    setTitle('');
                    setDescription('');
                    setPrice('');
                    setAddLoading(false);
                    setProgress(0);
                    setImage(null);
                    setCategory(cat && cat[0].title);
                    getProducts();
                    document.getElementById('contained-button-file').value='';
                }).catch(error=>{
                    makeToast("error",error.message);
                    setAddLoading(false);
                });
            })
        })
        }else{
            makeToast("warning","please add an image...")
            setAddLoading(false);
        }
    }
    const deleteProduct = (id) => {
        fs.collection("Products").doc(id).delete().then(() => {
            makeToast("success", "Product Deleted...");
            getProducts();
        }).catch((error) => {
            makeToast("error", error.message);
        })
    }
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
        <h2 style={{textAlign:"center"}}>CREATE PRODUCT</h2>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }} style={{maxWidth:"700px", margin:" 20px auto"}}>
        <LinearProgress variant="buffer" value={progress} valueBuffer={progress+ Math.random()*10} />
        <TextField
            margin="normal"
            required
            fullWidth
            name="title"
            value={title}
            onChange={(e) => handleChange(e,"title")}
            label="Title"
            id="title"
            autoFocus
        />
        <TextField
            margin="normal"
            required
            fullWidth
            value={description}
            onChange={(e) => handleChange(e,"description")}
            id="description"
            label="Product Description"
            name="description"
        />
        <TextField
            margin="normal"
            required
            fullWidth
            value={price}
            onChange={(e) => handleChange(e,"price")}
            type="number"
            id="price"
            label="Product Price"
            name="price"
        />
        <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Category</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Category"
            value={category}
            onChange={(e) => handleChange(e,"category")}
        >
            {cat.map((cato) => (
                <MenuItem key={cato.id} value={cato.title}>{cato.title}</MenuItem>
            ))}
        </Select>
        </FormControl>
        <label htmlFor="contained-button-file">
        <input style={{display:"none"}} onChange={handleProductImg} accept="image/*" id="contained-button-file" type="file" />
        <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
            Upload
        </Button>
        </label>
        {addLoading && <div style={{textAlign:"center", marginTop:40}}>
        <CircularProgress/>
        </div>}

        <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={addLoading}
            sx={{ mt: 3, mb: 2 }}
            startIcon={<AddBusinessIcon />}
        >
            {addLoading ? "ADDING..." : "ADD"} PRODUCT
        </Button>
        </Box>
        { loading ? (<div style={{textAlign:"center", marginTop:40}}>
        <CircularProgress/>
        </div>):(
            <TableContainer component={Paper} style={{maxWidth:"800px", margin:"20px auto"}}>
            <Table sx={{ maxWidth: "800px" }} aria-label="customized table">
                <TableHead>
                <TableRow>
                    <StyledTableCell>Product Title</StyledTableCell>
                    <StyledTableCell align="right">Price (₹)</StyledTableCell>
                    <StyledTableCell align="right">Category </StyledTableCell>
                    <StyledTableCell align="right">Created</StyledTableCell>
                    <StyledTableCell align="right">Updated</StyledTableCell>
                    <StyledTableCell align="right">Edit</StyledTableCell>
                    <StyledTableCell align="right">Delete</StyledTableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {products.length>0 &&
                        products.map((cartItem) => (
                            <StyledTableRow key={cartItem.id}>
                            <StyledTableCell component="th" scope="row">
                                {cartItem.title}
                            </StyledTableCell>
                            <StyledTableCell align="right">₹{cartItem.price}/-</StyledTableCell>
                            <StyledTableCell align="right">{cartItem.category} </StyledTableCell>
                            <StyledTableCell align="right">{moment(cartItem.createdAt).fromNow()}</StyledTableCell>
                            <StyledTableCell align="right">{moment(cartItem.modifiedAt).fromNow()}</StyledTableCell>
                            <StyledTableCell align="right" onClick={() => history.push(`/manage-products/${cartItem.id}`)}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<EditIcon/>}
                            >
                                edit
                            </Button>
                            </StyledTableCell>
                            <StyledTableCell align="right" onClick={() => deleteProduct(cartItem.id)}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                startIcon={<DeleteForeverIcon/>}
                            >
                                Del
                            </Button>
                            </StyledTableCell>
                            </StyledTableRow>
                        ))
                    }
                </TableBody>
            </Table>
            </TableContainer>
        )}
        
        </DashBoard>
    )
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
export default connect(mapStateToProps,mapDispatchToProps)(ManageProducts);