import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import { auth, fs } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import Button from '@mui/material/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import makeToast from '../Toaster';
import EditIcon from '@mui/icons-material/Edit';

const ManageCategory = (props) => {
    const {currentUser,history,setUser} = props;
    const [title,setTitle] = useState("");
    const [loading, setLoading] = React.useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [description,setDescription] = useState("");
    const [category, setCategory] = useState([]);
    const getCategories = () => {
        fs.collection("Categories").get().then(snapshot => {
            const cats = [];
            for(var snap of snapshot.docs){
                cats.push({...snap.data(),id:snap.id});
            }
            setCategory(cats);
            setLoading(false);
        }).catch(error => {
            makeToast("error", error.message);
            setLoading(false);
        })
    }
    useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                getCategories();
            }else{
                history.push("/");
            }
        });
        return () => subs;
    },[history]);
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
            fs.collection("Categories").add({
                title,
                description
            }).then(data => {
                if(data){
                    makeToast("success", "Category Added...");
                    setAddLoading(false);
                    setTitle("");
                    setDescription("");
                    getCategories();
                }else{
                    makeToast("error", "Failed");
                    setAddLoading(false);
                }
            })
        }
    }
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <h2 style={{textAlign:"center"}}>CREATE CATEGORY</h2>
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
                {addLoading ? "ADDING..." : "ADD"} CATEGORY
            </Button>
            </Box>
            
            {category.length>0 && <h2 style={{textAlign:"center"}}>CATEGORIES</h2>}
            { loading && (<div style={{textAlign:"center", marginTop:40}}>
            <CircularProgress/>
            </div>)}
            <div style={{maxWidth:"700px", margin:" 0 auto"}}>
            {
                category.map((cat,idx) => 
                (<Accordion key={cat.id}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id={`panel${idx}a-header`}
                >
                <Typography ><b>{cat.title}</b></Typography>
                <Button
                    variant="inherit"
                    startIcon={<EditIcon/>}
                    onClick={() => history.push(`/manage-category/${cat.id}`)}
                >
                </Button>
                </AccordionSummary>
                <AccordionDetails>
                <Typography>
                    {cat.description}
                </Typography>
                </AccordionDetails>
            </Accordion>))
            }
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
export default connect(mapStateToProps,mapDispatchToProps)(ManageCategory);