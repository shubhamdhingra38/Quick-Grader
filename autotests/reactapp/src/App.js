import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Body from './components/Body';
import TakeTest from './components/Test/TakeTest';
import CreateTest from "./components/Test/CreateTest";
import About from "./components/About/About";
import Dashboard from "./components/Dashboard/Dashboard";
import Response from "./components/Dashboard/Response";
import PlagiarismResults from "./components/Dashboard/Plagiarism";


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Router>
        <div>
          <Header/>
          <Switch>
            <Route exact path="/">
              <Body/>
            </Route>
            <Route exact path="/about">
              <About/>
            </Route>
            <Route exact path="/dashboard">
              <Dashboard/>
            </Route>
            <Route path="/dashboard/response/:responseID" component={Response}/>
            <Route path="/dashboard/plagiarism-results/:quizID" component={PlagiarismResults}/>
          </Switch>
          <Route path="/taketest">
            <TakeTest/>
          </Route>
          <Switch>
            <Route path="/createtest" component={CreateTest}/>
          </Switch>
          <Footer/>
        </div>
      </Router>
    )
  }
}


export default App;
