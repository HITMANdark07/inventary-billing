import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import { auth, fs } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import Button from '@mui/material/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import makeToast from '../Toaster';

const UpdateCat = (props) => {
    const {currentUser,history,setUser} = props;
    const {catID} = props.match.params;
    const [title,setTitle] = useState("");
    const [addLoading, setAddLoading]  = useState(false);
    const [description,setDescription] = useState("");
    const getCategory = useCallback(() => {
        fs.collection("Categories").doc(catID).get().then(snapshot => {
            if(snapshot){
            const {title, description} = snapshot.data();
            setTitle(title);
            setDescription(description);
            }
        }).catch(error => {
            makeToast("error", error.message);
        })
    },[catID])
    useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                getCategory();
            }else{
                history.push("/");
            }
        });
        return () => subs;
    },[history,getCategory]);
    const handleLogout=()=>{
        auth.signOut().then(()=>{
            setUser(null);
        })
    }
    const handleChange = (event,name) =>{
        // console.log(event);
        switch(name){
            case "title":
                setTitle(event.target.value)
                break;
            case "description":
                setDescription(event.target.value)
                break;
            default:
        }
    }
    const handleSubmit = (event) => {
        setAddLoading(true);
        event.preventDefault();
        if(title && description){
            fs.collection("Categories").doc(catID).update({
                title,
                description
            }).then(() => {
                    makeToast("success", "Category Updated...");
                    setTitle("");
                    setAddLoading(false);
                    setDescription("");
                    history.goBack();
            }).catch((error) => {
                makeToast("error", error.message);
                setAddLoading(false);
            })
        }
    }
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <h2 style={{textAlign:"center"}}>UPDATE CATEGORY</h2>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }} style={{maxWidth:"700px", margin:" 0 auto"}}>
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
                label="Category Description"
                name="description"
            />
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
                {addLoading ? "UPDATING..." : "UPDATE"} CATEGORY
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
export default connect(mapStateToProps,mapDispatchToProps)(UpdateCat);