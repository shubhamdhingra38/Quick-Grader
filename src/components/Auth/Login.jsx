import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { createMuiTheme } from "@material-ui/core/styles";
import { Alert } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "rgb(0, 0, 0)",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: "white",
    backgroundColor: "rgb(0, 0, 0)",
  },
}));

export default function Login(props) {
  const classes = useStyles();
  const [creds, setCreds] = useState({ username: "", password: "" }); //user credentials
  const [errorMsg, setErrorMsg] = useState();
  const [redirect, setRedirect] = useState(false);
  // const [token, setToken] = useState(null);

  // console.log(creds);
  // console.log(token);

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = JSON.stringify(creds);
    axios
      .post("http://quick-grader.herokuapp.com/auth/token/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        // console.log(res);
        props.setToken(res.data.token);
        setRedirect(true);
      })
      .catch((err) => {
        console.error(err.response);
        setErrorMsg("Invalid credentials");
      });
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let val = e.target.value;
    setCreds((oldState) => {
      return { ...oldState, [name]: val };
    });
  };


  
  let alert = errorMsg ? (
    <Alert
      variant="danger"
      className="mt-1"
      onClose={() => setErrorMsg(null)}
      dismissible
    >
      <p>{errorMsg}</p>
    </Alert>
  ) : null;

  if(redirect){
    return (
      <Redirect to="/"></Redirect>
    )
  }

  return (
    <Container component="main" className="test-form border mt-5 p-3" maxWidth="xs">
      {alert}
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
            checked
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.submit}
            style={{ color: "rgba(0, 0, 0, 1) !important" }}
            onClick={handleSubmit}
          >
            Sign In
          </Button>
          <Grid container className={classes.text}>
            <Grid item className={classes.text}>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
