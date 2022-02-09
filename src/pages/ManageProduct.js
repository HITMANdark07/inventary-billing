import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import Button from '@mui/material/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { auth, fs, storage } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import CircularProgress from '@mui/material/CircularProgress';
import makeToast from '../Toaster';
import { InputLabel, LinearProgress } from '@mui/material';

const ManageProduct = (props) => {
    const {history, currentUser,setUser} = props;
    const {productID} = props.match.params;
    const [cat, setCat] = useState([]);
    const [title, setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [addLoading, setAddLoading]  = useState(false);
    const [progress, setProgress] = useState(0);
    const [category,setCategory] = useState("");
    const [image,setImage] = useState(null);
    const getProduct = useCallback(() => {
        fs.collection("Products").doc(productID).get().then(snapshot => {
            if(snapshot){
                const {title, description, price, category} = snapshot.data();
                setCategory(category);
                setTitle(title);
                setDescription(description);
                setPrice(price);
            }
        })
    },[productID])
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
                getProduct();
            }else{
                history.push("/");
            }
        });
        return () => subs;
    },[currentUser,history,getProduct]);
    const handleLogout=()=>{
        auth.signOut().then(()=>{
            setUser(null);
        })
    }
    const handleUpdate = (e) => {
        e.preventDefault();
        setAddLoading(true);
        if(image!==null){
        const uploadTask=storage.ref(`product-images/${image.name}`).put(image);
        uploadTask.on('state_changed',snapshot=>{
            const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100
            setProgress(progress);
        },error=>{
            makeToast("error", error.message);
            setAddLoading(false);
        },()=>{
            storage.ref('product-images').child(image.name).getDownloadURL().then(url=>{
                fs.collection('Products').doc(productID).update({
                    title,
                    description,
                    price: Number(price),
                    category,
                    modifiedAt: Date.now(),
                    url
                }).then(()=>{
                    makeToast("success", "Product Updated");
                    getProduct();
                    setProgress(0);
                    setAddLoading(false);
                    setImage(null);
                    document.getElementById('contained-button-file').value='';
                }).catch(error=>{
                    makeToast("error", error.message);
                    setAddLoading(false);
                });
            })
        })
        }else{
            fs.collection('Products').doc(productID).update({
                title,
                description,
                price: Number(price),
                category,
                modifiedAt: Date.now()
            }).then(() => {
                makeToast("success", "Product Updated");
                setImage(null);
                setAddLoading(false);
                getProduct();
                setProgress(0);
                document.getElementById('contained-button-file').value='';
            }).catch(error=>{
                makeToast("error", error.message);
                setAddLoading(false);
            });
        }
    }
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <h2 style={{textAlign:"center"}}>UPDATE PRODUCT</h2>
        <Box component="form" onSubmit={handleUpdate} sx={{ mt: 1 }} style={{width:"700px", margin:" 0 auto"}}>
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
            id="description"
            value={description}
            onChange={(e) => handleChange(e,"description")}
            label="Product Description"
            name="description"
        />
        <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            value={price}
            onChange={(e) => handleChange(e,"price")}
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
        <input style={{display:"none"}} onChange={handleProductImg} accept="image/*" id="contained-button-file"  type="file" />
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
            {addLoading ? "UPDATING..." : "UPDATE"} PRODUCT
        </Button>
        </Box>
        </DashBoard>
    )
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
export default connect(mapStateToProps,mapDispatchToProps)(ManageProduct);