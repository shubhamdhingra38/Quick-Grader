import React from "react";
import "./App.css";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Home from "./components/Home";
import TakeTest from "./components/Test/TakeTest";
import CreateTest from "./components/Test/CreateTest";
import About from "./components/About/About";
import Response from "./components/Test/Response";
import PlagiarismResults from "./components/Dashboard/PlagiarismResults";
import Plagiarism from "./components/Dashboard/Plagiarism";
import AutoGrade from "./components/Dashboard/AutoGrade";
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
        <Main token={token}/>
        <div className={classes.content}>
          <div className={classes.toolbar}/>
          <Switch>
            <Route exact path="/home" render={(props) => <Home {...props} />} />
            <Route exact path="/about">
              <About token={token} />
            </Route>
            <Route exact path="/dashboard/created-tests">
              <CreatedTests token={token} />
            </Route>
            <Route
              path="/dashboard/generate-report"
              component={GenerateReport}
            ></Route>
            <Route
              path="/dashboard/created-tests/response/:responseID"
              render={(props) => <Response token={token} {...props} />}
            />
            <Route path="/dashboard/plagiarism/">
              <Plagiarism token={token} />
            </Route>
            <Route
              path="/dashboard/plagiarism-results/:quizID"
              render={(props) => <PlagiarismResults token={token} {...props} />}
            ></Route>
            <Route
              path="/dashboard/created-tests/autograde/:quizID"
              render={(props) => <AutoGrade token={token} {...props} />}
            ></Route>
          </Switch>
          <Route path="/take-test">
            <TakeTest token={token} />
          </Route>
          <Route path="/login">
            <Login setToken={setNewToken} />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
           <Route path="/logout">
            <Logout token={token} setToken={setNewToken}/>
          </Route>
          <Switch>
            <Route path="/create-test">
              <CreateTest token={token} />
            </Route>
          </Switch>
        </div>

        <Footer />
      </div>
    </Router>
  );
}
