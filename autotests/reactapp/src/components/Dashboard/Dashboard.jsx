import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Switch, Link, Redirect, Route } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  ListGroupItem,
  ListGroup,
  Container,
  Accordion,
  Collapse,
} from "react-bootstrap";
import CreatedTests from "./CreatedTests";


axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const api = {
  my_tests_url: "http://localhost:8000/test/mytests/",
  question_url: "http://localhost:8000/test/question/",
  choice_url: "http://localhost:8000/test/choice/",
  // http://localhost:8000/test/response/?quizID=286
  response_url: "http://localhost:8000/test/response/",
  // http://localhost:8000/test/answer/?responseID=36
  answer_url: "http://localhost:8000/test/answer/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};
function Dashboard(props) {
  console.log(props);
  document.title = "Dashboard";
  const [showTests, setShowTests] = useState(false);

  const handleShowTests = (e) => {
    setShowTests((oldValue) => !oldValue);
    // localStorage.setItem('showTests', false);
  };

  if (showTests) {
    return (
        <Redirect to="/dashboard/created-tests/" />
    );
  }

  return (
    <Container>
      <div className="row">
        <div className="container col-md-5 col-sm-12">
          <h3 className="title">Analyze</h3>
          <div className="content w-100">
            <Link to="/dashboard/analyze">
              <div className="content-overlay"></div>
              <img
                className="content-image w-100 mx-3"
                src={require("../static/images/analyze.jpg")}
              />
              <div className="content-details fadeIn-top fadeIn-left">
                <h3>Analyze</h3>
                <p>
                  Using AI assissted visualizations to analyze the performance
                  of students.
                </p>
              </div>
            </Link>
          </div>
        </div>
        <div className="container col-md-5 col-sm-12">
          <h3 className="title">Grade</h3>
          <div className="content w-100">
            <Button variant="link" onClick={handleShowTests}>
              <div className="content-overlay"></div>
              <img
                className="content-image w-100 mx-3"
                src={require("../static/images/test.jpg")}
              />
              <div className="content-details fadeIn-top fadeIn-right">
                <h3>Grade</h3>
                <p>
                  Grade tests or use AI to do it automatically and effortlessly
                  and report cases of plagiarism.
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="body-text">
      </div>
    </Container>
  );
}

export default Dashboard;
