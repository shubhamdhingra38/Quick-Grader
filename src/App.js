import React from "react";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Body from "./components/Body";
import TakeTest from "./components/Test/TakeTest";
import CreateTest from "./components/Test/CreateTest";
import About from "./components/About/About";
import Dashboard from "./components/Dashboard/Dashboard";
import Response from "./components/Dashboard/Response";
import PlagiarismResults from "./components/Dashboard/PlagiarismResults";
import Plagiarism from "./components/Dashboard/Plagiarism";
import AutoGrade from "./components/Dashboard/AutoGrade";
import CreatedTests from "./components/Dashboard/CreatedTests";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GenerateReport from "./components/Dashboard/GenerateReport";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
    };
    this.setToken.bind(this);
  }

  componentDidUpdate() {
    // console.log(this.state);
  }

  componentWillMount() {
    this.setState({
      token: localStorage.getItem("token"),
    });
  }

  setToken = (val) => {
    // console.log("setToken called");
    this.setState({
      token: val,
    });
    localStorage.setItem("token", this.state.token);
  };

  render() {
    return (
      <Router>
        <div>
          <Header token={this.state.token} />
          <Switch>
            <Route exact path="/" render={(props) => <Body token={this.state.token} {...props}/>}/>
            <Route exact path="/about">
              <About token={this.state.token} />
            </Route>
            <Route exact path="/dashboard">
              <Dashboard token={this.state.token} />
            </Route>
            <Route exact path="/dashboard/created-tests">
              <CreatedTests token={this.state.token} />
            </Route>
            <Route
              path="/dashboard/generate-report"
              component={GenerateReport}
            ></Route>
            <Route
              path="/dashboard/created-tests/response/:responseID"
              render={(props) => (
                <Response token={this.state.token} {...props} />
              )}
            />
            <Route path="/dashboard/plagiarism/">
              <Plagiarism token={this.state.token} />
            </Route>
            <Route
              path="/dashboard/plagiarism-results/:quizID"
              render={(props) => (
                <PlagiarismResults token={this.state.token} {...props} />
              )}
            ></Route>
            <Route path="/dashboard/created-tests/autograde/:quizID" render={(props) => (
              <AutoGrade token={this.state.token} {...props} />
            )}>

            </Route>
          </Switch>
          <Route path="/take-test">
            <TakeTest token={this.state.token} />
          </Route>
          <Route path="/login">
            <Login setToken={this.setToken} />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Switch>
            <Route path="/create-test">
              <CreateTest token={this.state.token} />
            </Route>
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
