import React, { useEffect, useState } from "react";
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


const api = {
  my_tests_url: "http://quick-grader.herokuapp.com/test/mytests/",
  question_url: "http://quick-grader.herokuapp.com/test/question/",
  choice_url: "http://quick-grader.herokuapp.com/test/choice/",
  // http://localhost:8000/test/response/?quizID=286
  response_url: "http://quick-grader.herokuapp.com/test/response/",
  // http://localhost:8000/test/answer/?responseID=36
  answer_url: "http://quick-grader.herokuapp.com/test/answer/",
};
function Dashboard(props) {
  console.log(props);
  document.title = "Dashboard";

  return (
    <Container>
      <div className="row">
        <div className="container col-md-5 col-sm-12">
          <h3 className="title">Generate Report</h3>
          <div className="content w-100">
            <Link to="/dashboard/generate-report">
              <div className="content-overlay"></div>
              <img
                className="content-image w-100 mx-3"
                src={require("../static/images/analyze.jpg")}
              />
              <div className="content-details fadeIn-top fadeIn-left">
                <h3>Generate Report</h3>
                <p>
                  Get the detailed result of students, their performance in each
                  question and a total score in .csv format
                </p>
              </div>
            </Link>
          </div>
        </div>
        <div className="container col-md-5 col-sm-12">
          <h3 className="title">Grade</h3>
          <div className="content w-100">
            <Link to="/dashboard/created-tests/">
              <div className="content-overlay"></div>
              <img
                className="content-image w-100 mx-3"
                src={require("../static/images/test.jpg")}
              />
              <div className="content-details fadeIn-top fadeIn-right">
                <h3>Grade</h3>
                <p>
                  Grade tests or use AI to do it automatically and effortlessly
                  and report cases of plagiarism
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="container col-md-5 col-sm-12">
          <h3 className="title">Plagiarism Detection</h3>
          <div className="content w-100">
            <Link to="/dashboard/plagiarism">
              <div className="content-overlay"></div>
              <img
                className="content-image w-100 mx-3"
                src={require("../static/images/plagiarism.jpg")}
              />
              <div className="content-details fadeIn-top">
                <h3>Plagiarism Detection</h3>
                <p>
                  Use AI to report cases of plagiarism between pairs of students
                  and analyze the suspected similar answers to eliminate any
                  false positives
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="body-text"></div>
    </Container>
  );
}

export default Dashboard;
