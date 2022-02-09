import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import {Link} from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { auth, fs } from '../firebase/index';
import makeToast from '../Toaster';
import { connect } from 'react-redux';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link to="/signup">
        BillingProject.com
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

function SignUpSide({currentUser,history}) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if(currentUser && (currentUser.role==="admin" || currentUser.role==="staff")){
      history.push("/shop");
    }
  },[currentUser,history]);
  const handleSubmit = async(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    if(data.get("email") && data.get("password") && data.get("name")){
      setLoading(true);
      try{
        const res = await auth.createUserWithEmailAndPassword(data.get("email"),data.get("password"));
        const user = res.user;
        await fs.collection("users").doc(user.uid).set({
         FullName: data.get("name"),
         Email: data.get("email"),
         role: 'user'
        })
        setLoading(false);
        auth.signOut();
        makeToast("warning", "Account Created. Contact admin for authorization.")
        history.push("/");
      }catch(error){
        makeToast("error",error.message);
        setLoading(false);
      }
    //   auth.createUserWithEmailAndPassword(data.get("email"),data.get("password")).then((credentials)=>{
    //     setLoading(false);
    //     fs.collection('users').doc(credentials.user.uid).set({
    //         FullName: data.get("name"),
    //         Email: data.get("email"),
    //         role: 'user'
    //     }).then(()=>{
    //       makeToast("warning", "Account Created. Contact admin for authorization.")
    //         props.history.push("/");
    //     }).catch(error=>console.log(error.message));
    // }).catch((error)=>{
    //     makeToast("error", error.message);
    //     setLoading(false);
    // })
    }else{
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://flatlogic.com/blog/wp-content/uploads/2018/08/article_openSource.png)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              REGISTER YOURSELF
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              { loading && (<div style={{textAlign:"center"}}>
                <CircularProgress/>
              </div>)}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                CREATE ACCOUNT
              </Button>
              <Grid container>
                <Grid item>
                  <Link to="/" variant="body2" style={{textDecoration:'none',color:'bla'}}>
                    {"Already have an account? Sign In"}
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
const mapStateToprops = (state) => ({
  currentUser: state.user.currentUser,
})
export default connect(mapStateToprops)(SignUpSide);