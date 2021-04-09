import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Redirect, Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";
import domain from "../../api";

const api = {
  auth_url: domain + "auth/token/",
};

const useStyles = makeStyles((theme) => ({
  paper: {
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
    backgroundColor: "black",
    "&:hover": {
      background: "#3f51b5",
    },
  },
}));

export default function Login(props) {
  useEffect(() => {
    props.setTitle("Sign In");
  }, []);
  const classes = useStyles();
  const [creds, setCreds] = useState({ username: "", password: "" }); //user credentials
  const alert = useAlert();

  const [redirect, setRedirect] = useState(false);
  // const [token, setToken] = useState(null);

  // console.log(creds);
  // console.log(token);

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = JSON.stringify(creds);
    axios
      .post(api.auth_url, data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        console.log(res);
        props.setToken(res.data.token);
        setRedirect(true);
      })
      .catch((err) => {
        console.error(err.response);
        alert.show("Invalid credentials!", {
          timeout: 4000,
          type: "error",
        });
      });
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let val = e.target.value;
    setCreds((oldState) => {
      return { ...oldState, [name]: val };
    });
  };

  if (redirect) {
    return <Redirect to="/"></Redirect>;
  }

  return (
    <Container
      component="main"
      className="test-form border mt-5 p-3"
      style={{ maxWidth: "300px" }}
    >
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
          <Grid container>
            <Grid item>
              <Link to="/register" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
