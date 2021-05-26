import React from "react";
import "./App.css";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Home from "./components/Home";
import TakeTest from "./components/Test/TakeTest";
import CreateTest from "./components/Test/CreateTest";
import About from "./components/About/About";
import Profile from "./components/Profile/Profile"
import Response from "./components/Test/Response";
import PlagiarismResults from "./components/Dashboard/PlagiarismResults";
import Plagiarism from "./components/Dashboard/Plagiarism";
import ClusterGrade from "./components/Dashboard/ClusterGrade";
import CreatedTests from "./components/Dashboard/CreatedTests";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GenerateReport from "./components/Dashboard/GenerateReport";
import Login from "./components/Auth/Login";
import Logout from './components/Auth/Logout'
import Register from "./components/Auth/Register";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },

  toolbar: theme.mixins.toolbar,
}));



export default function App() {

  const [token, setToken] = React.useState();
  const [title, setTitle] = React.useState("quickGrader");
  const classes = useStyles();


  const setNewToken = (val) => {
    console.log("setToken called");
    setToken(val);
    if(!val){
      localStorage.removeItem("token")
    } else{

    localStorage.setItem("token", val);
    }
  };




  React.useEffect(()=>{
    if(localStorage.token){
      setToken(localStorage.token)
    }

  }, [])




  return (
    <Router>
      <div style={{ display: "flex"}} className="mt-5">
        <Main title={title} token={token} />
        <div className={classes.content}>
          <div className={classes.toolbar}/>
          <Switch>
            <Route  exact path="/home" render={(props) => <Home setTitle={setTitle} {...props} token={token} />} />
            <Route exact path="/about">
              <About token={token} setTitle={setTitle}/>
            </Route>
            <Route exact path="/dashboard/created-tests">
              <CreatedTests token={token} setTitle={setTitle}/>
            </Route>
            <Route
              path="/dashboard/generate-report"
            >
              <GenerateReport setTitle={setTitle}/>
            </Route>
            <Route
              path="/dashboard/created-tests/response/:responseID"
              render={(props) => <Response token={token} {...props} />}
            />
            <Route
              path="/dashboard/plagiarism-results/"
              render={(props) => <PlagiarismResults token={token} setTitle={setTitle} {...props} />}
            ></Route>
            <Route
              path="/dashboard/cluster-grade/"
              render={(props) => <ClusterGrade token={token} {...props} setTitle={setTitle}/>}
            ></Route>
          </Switch>
          <Route path="/take-test">
            <TakeTest token={token} />
          </Route>
          <Route path="/login">
            <Login setTitle={setTitle} setToken={setNewToken} />
          </Route>
          <Route path="/register">
            <Register setTitle={setTitle} />
          </Route>
           <Route path="/logout">
            <Logout setTitle={setTitle} token={token} setToken={setNewToken}/>
          </Route>
          <Route path="/account">
            <Profile token={token} setTitle={setTitle}/>
          </Route>
          <Switch>
            <Route path="/create-test">
              <CreateTest setTitle={setTitle} token={token} />
            </Route>
          </Switch>
        </div>

        <Footer />
      </div>
    </Router>
  );
}
