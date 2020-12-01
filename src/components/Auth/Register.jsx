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
import axios from "axios";
import { Alert } from "react-bootstrap";
import { Redirect } from "react-router-dom";

axios.defaults.xsrfHeaderName = "X-CSRFToken";


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
  const [errorMsg, setErrorMsg] = useState([]);
  const [redirect, setRedirect] = useState(false);
  // console.log(creds);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(creds);
    creds["group"] = props.type;
    axios
      .post("https://quick-grader.herokuapp.com/auth/users/", creds, {
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((res) => {
        console.log(res);
        setRedirect(true);
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response.status.code == 400) {
          let errors = [];
          Object.keys(err.response.data).forEach((field) => {
            let error = !isNaN(field)
              ? err.response.data[field]
              : `${field}: ${err.response.data[field]}`;
            errors.push(error);
          });
          setErrorMsg(errors);
          console.log(errors);
        }
      });
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let val = e.target.value;
    setCreds((oldValue) => {
      return { ...oldValue, [name]: val };
    });
  };

  let alertElements = errorMsg
    ? errorMsg.map((ele) => {
        if (ele.length > 0) {
          return <li>{ele}</li>;
        }
      })
    : null;

  let alert =
    errorMsg.length > 0 ? (
      <Alert
        variant="danger"
        className="mt-2"
        onClose={() => setErrorMsg([])}
        dismissible
      >
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <ul>{alertElements}</ul>
      </Alert>
    ) : null;

  if (redirect) return <Redirect to="/login"></Redirect>;

  return (
    <Container style={{maxWidth: "400px"}}>
      {alert}
      <Container
        className="test-form border mt-5 p-3"
        component="main"
      >
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
                <Link href="/login" variant="body2">
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

function Register() {
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
      <p class="d-flex justify-content-center mt-4" style={{flexWrap: "wrap"}}>
        Already have an account? Click
        <a href="/login" color="blue">
        &nbsp;here&nbsp;
        </a>
        to login
      </p>
    </Container>
  );
}

export default Register;
