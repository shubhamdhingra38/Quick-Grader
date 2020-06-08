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
import PlagiarismResults from "./components/Dashboard/Plagiarism";
import AutoGrade from "./components/Dashboard/AutoGrade";
import CreatedTests from "./components/Dashboard/CreatedTests";
import Analyze from "./components/Dashboard/Analyze/Analyze";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GenerateReport from "./components/Dashboard/Analyze/GenerateReport";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div>
          <Header />
          <Switch>
            <Route exact path="/">
              <Body />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
            <Route exact path="/dashboard/created-tests">
              <CreatedTests />
            </Route>
            <Route exact path="/dashboard/analyze">
              <Analyze />
            </Route>
            <Route path="/dashboard/analyze/generate-report" component={GenerateReport} ></Route>
            <Route
              path="/dashboard/created-tests/response/:responseID"
              component={Response}
            />
            <Route
              path="/dashboard/created-tests/plagiarism-results/:quizID"
              component={PlagiarismResults}
            />
            <Route
              path="/dashboard/created-tests/autograde/:quizID"
              component={AutoGrade}
            />
          </Switch>
          <Route path="/take-test">
            <TakeTest />
          </Route>
          <Switch>
            <Route path="/create-test" component={CreateTest} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
