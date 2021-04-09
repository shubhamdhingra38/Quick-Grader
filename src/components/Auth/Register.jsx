import React, { useState, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import axios from "axios";
import { Alert } from "react-bootstrap";
import { Redirect, Link } from "react-router-dom";
import { useAlert } from "react-alert";
import domain from "../../api";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
const api = {
  auth_url: domain + "auth/users/",
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: "white",
    backgroundColor: "rgb(0, 0, 0)",
  },
}));

function SignUp(props) {
  const classes = useStyles();
  const [creds, setCreds] = useState({ username: "", password: "" }); //user credentials
  const [redirect, setRedirect] = useState(false);
  const alert = useAlert();
  // console.log(creds);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(creds);
    creds["group"] = props.type;
    axios
      .post(api.auth_url, creds, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log(res);
        setRedirect(true);
      })
      .catch((err) => {
        let errors = err.response.data;
        Object.keys(errors).forEach((error) => {
          alert.show(`Required field ${error}`, {
            timeout: 4000,
            type: "error",
          });
        });
      });
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let val = e.target.value;
    setCreds((oldValue) => {
      return { ...oldValue, [name]: val };
    });
  };

  if (redirect) return <Redirect to="/login"></Redirect>;

  return (
    <Container style={{ maxWidth: "400px" }}>
      <Container className="test-form border mt-5 p-3" component="main">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}></Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  onChange={handleChange}
                  autoComplete="fname"
                  name="firstname"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstname"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  id="lastname"
                  label="Last Name"
                  name="lastname"
                  autoComplete="lname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={handleChange}
                  variant="outlined"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={handleChange}
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={handleChange}
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    </Container>
  );
}

function Register(props) {
  useEffect(() => {
    props.setTitle("Sign Up");
  }, []);
  document.title = "Register";
  const [showSignUp, setShowSignUp] = useState(false);
  const [type, setType] = useState(null); //teacher or student
  if (showSignUp) return <SignUp type={type} />;
  return (
    // <SignUp/>
    <Container className="mt-5">
      <div class="row">
        <div class="container col-md-5 col-sm-12">
          <h3 class="title">Student</h3>
          <div class="content w-100">
            <button
              className="btn"
              onClick={() => {
                setShowSignUp(true);
                setType("Student");
              }}
            >
              <div class="content-overlay"></div>
              <img
                className="content-image w-100 mx-0"
                src={require("../static/images/student.jpg")}
              />
              <div class="content-details fadeIn-top fadeIn-left">
                <h3>Register</h3>
                <p>Click here to register as a student.</p>
              </div>
            </button>
          </div>
        </div>
        <div class="container col-md-5 col-sm-12">
          <h3 class="title">Teacher</h3>
          <div class="content w-100">
            <button
              className="btn"
              onClick={() => {
                setShowSignUp(true);
                setType("Faculty");
              }}
            >
              <div class="content-overlay"></div>
              <img
                className="content-image w-100 mx-0"
                src={require("../static/images/teacher.jpg")}
              />
              <div class="content-details fadeIn-top fadeIn-right">
                <h3>Register</h3>
                <p>Click here to register as a teacher.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <p
        class="d-flex justify-content-center mt-4"
        style={{ flexWrap: "wrap" }}
      >
        Already have an account? Click
        <Link to="/login" color="blue">
          &nbsp;here&nbsp;
        </Link>
        to login
      </p>
    </Container>
  );
}

export default Register;
