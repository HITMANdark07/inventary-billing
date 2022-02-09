import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DashBoard from '../components/DashBoard';
import { auth, fs } from '../firebase/index';
import { setCurrentUser } from '../redux/user/user.action';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import makeToast from '../Toaster';
import CircularProgress from '@mui/material/CircularProgress';
import { Redirect } from 'react-router';

const ManageAgents = (props) => {
    const {currentUser,history,setUser} = props;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = React.useState(true);
    const getUsers = () => {
        fs.collection("users").get().then(snapshot => {
            if(snapshot){
                var usr=[];
                for (var snap of snapshot.docs){
                    usr.push({...snap.data(),id:snap.id});
                }
                setUsers(usr);
                setLoading(false);
            }
        }).catch(() => {
            setLoading(false);
        })
    }
    useEffect(() => {
        const subs = auth.onAuthStateChanged((user) => {
            if(user){
                fs.collection("users").doc(user.uid).get().then(snapshot =>{
                    if(snapshot && snapshot.data().role!=="admin"){
                        history.goBack();
                    }
                })
                getUsers();
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
      
      
    return(
        <DashBoard logout={handleLogout} currentUserRole={ currentUser && currentUser.role}>
            <h2 style={{textAlign:"center"}}>MANAGE STAFFS</h2>
            {currentUser && currentUser.role==="staff" && <Redirect to="/" />}
            { loading ? (<div style={{textAlign:"center", marginTop:70}}>
                <CircularProgress/>
              </div>): (
                  <TableContainer component={Paper} sx={{maxWidth:800, margin:'20px auto'}}>
                  <Table sx={{ maxWidth: 800 }} aria-label="customized table">
                      <TableHead>
                      <TableRow>
                          <StyledTableCell>Email</StyledTableCell>
                          <StyledTableCell align="right">Name</StyledTableCell>
                          <StyledTableCell align="right">Request</StyledTableCell>
                          <StyledTableCell align="right">Role</StyledTableCell>
                          <StyledTableCell align="right">Edit</StyledTableCell>
                      </TableRow>
                      </TableHead>
                      <TableBody>
                      {users && users.map((user) => (
                              <Row user={user} key={user.id} />
                          )
                      )}
                      </TableBody>
                  </Table>
                  </TableContainer>
              )}
            
        </DashBoard>
    )
}

const Row =(props) => {
    const {user} = props;
    const [role,setRole]  = useState(user.role);
    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }));
      const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));
    const updateRole = (e) => {
        fs.collection("users").doc(user.id).update({
            role:e.target.value
        }).then(() => {
            setRole(e.target.value);
            makeToast("success","Role Updated...");
        }).catch((error) => {
            makeToast("error", error.message);
        })
    }
    return(
        <StyledTableRow key={user.id}>
        <StyledTableCell component="th" scope="row">
            {user.Email}
        </StyledTableCell>
        <StyledTableCell align="right">{user.FullName}</StyledTableCell>
        <StyledTableCell align="right" ><b style={{background:role==="user" ? "red" : "green",
        padding:'8px',color:"white", borderRadius:"5px"}}>{role==="user" ? "Pending" : "Approved"}</b></StyledTableCell>
        <StyledTableCell align="right">{user.role}</StyledTableCell>
        <StyledTableCell align="right">
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Role</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Role"
                value={role}
                onChange={updateRole}
                disabled={role==="admin"}
                >
                <MenuItem  value={"user"}>USER</MenuItem>
                <MenuItem  value={"admin"}>ADMIN</MenuItem>
                <MenuItem  value={"staff"}>STAFF</MenuItem>
            </Select>
            </FormControl>
        </StyledTableCell>
        </StyledTableRow>
    )
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser
})
const mapDispatchToProps = (dispatch) => ({
    setUser: user => dispatch(setCurrentUser(user))
})
export default connect(mapStateToProps,mapDispatchToProps)(ManageAgents);