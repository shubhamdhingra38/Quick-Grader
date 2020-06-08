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
import AutoGrade from "./AutoGrade";


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

function ViewResponses(props) {
  const [responses, setResponses] = useState([]);

  // get the responses intially
  useEffect(() => {
    axios
      .get(api.response_url, {
        params: {
          quizID: props.id,
        },
        auth: api.credentials,
      })
      .then((res) => {
        console.log(res);
        setResponses(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  let responseElements = responses.map((data) => {
    return (
      <ListGroupItem key={data.id}>
        <Link to={"/dashboard/created-tests/response/" + data.id}>
          {data.taken_by}
        </Link>
      </ListGroupItem>
    );
  });
  return <ListGroup className="w-50">{responseElements}</ListGroup>;
}

// display a single Test
function Test(props) {
  // const [viewPlagiarism, setViewPlagiarism] = useState(false);
  const [toolbarStatus, setToolbarStatus] = useState(false);
  const [viewResponses, setViewResponses] = useState(false);
  const [questions, setQuestions] = useState(() => {
    let localStorageQuestions = localStorage.getItem(
      `question${props.data.id}`
    );
    // console.log(JSON.parse(localStorageQuestions));
    return localStorageQuestions ? JSON.parse(localStorageQuestions) : [];
  });
  const [choices, setChoices] = useState(() => {
    let localStorageChoices = localStorage.getItem(`choices${props.data.id}`);
    return localStorageChoices ? JSON.parse(localStorageChoices) : {};
  });

  // console.log(questions);

  // get all the questions for the currenttest
  useEffect(() => {
    if (questions.length > 0) return;
    console.log("making requests");
    props.data.questions.forEach((questionID, index) => {
      axios
        .get(api.question_url + questionID, { auth: api.credentials })
        .then((res) => {
          setQuestions((prevQuestions) => {
            return [...prevQuestions, res.data];
          });
          if (res.data.type == 2) {
            getChoices(res.data);
          }
        })
        .catch((err) => console.log(err.response));
    });
  }, []);

  useEffect(() => {
    // console.log(questions);
    localStorage.setItem(`question${props.data.id}`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`choices${props.data.id}`, JSON.stringify(choices));
  }, [choices]);

  const getChoices = (data) => {
    let choices = data.choices;
    let promises = [];
    let choiceId;
    for (choiceId in choices) {
      console.log(api.choice_url + choices[choiceId]);
      promises.push(
        axios.get(api.choice_url + choices[choiceId], { auth: api.credentials })
      );
      // .then(res => {
      //     choicesInfo.push([data.id, data.choices]);
      // })
      // .catch(err => console.log(err.response));
    }
    Promise.all(promises).then((res) => {
      res.forEach((choice) => {
        // choices.push([choice.data.id, choice.data.choice_text]);
        setChoices((oldState) => {
          return {
            ...oldState,
            [choice.data.id]: choice.data,
          };
        });
      });
      // setQuestions(oldArray => [...oldArray, [data, choices]]);
    });
    // console.log(choices);
  };

  let questionElements = questions.map((data, idx) => {
    if (data.type == 1) {
      // Short answer
      return (
        <div key={data.id} className="my-3 bg-light p-3">
          <span style={{ fontSize: "1.2em" }}>
            Question {idx + 1}. {data.problem}
          </span>
          <div className="answer">
            <p>Answer: {data.ans}</p>
          </div>
          <div className="max-marks d-flex justify-content-end pr-1">
            Maximum Marks: {data.maximum_score}
          </div>
        </div>
      );
    } else {
      // MCQ
      let questionChoices = data.choices.map((choiceID) => {
        return choices[choiceID] ? (
          <ListGroup.Item
            key={`${props.data.id}-${choices[choiceID].id}`}
            className={choices[choiceID].is_answer ? "bg-success" : null}
          >
            <div className="choice p-1">
              <p>{choices[choiceID].choice_text}</p>
            </div>
          </ListGroup.Item>

        ) : (
          "Loading..."
        );
      });

      return (
        <li
          key={data.id}
          className="my-3 list-group-item list-group-item-secondary"
        >
          <span style={{ fontSize: "1.2em" }}>
            Question {idx + 1}. {data.problem}
          </span>
          <div className="choices">
            <ul>{questionChoices}</ul>
          </div>
          <div className="max-marks d-flex justify-content-end pr-1">
            Maximum Marks: {data.maximum_score}
          </div>
        </li>
      );
    }
  });

  return (
    <Container className="test-form my-5 border p-3">
      <div className="info">
        <h3 className="display-4">{props.data.title}</h3>
        <p className="lead">{props.data.description}</p>
        <hr className="info-hr" />
      </div>
      <div className="list-group">{questionElements}</div>

      <Button
        onClick={() => setToolbarStatus((oldValue) => !oldValue)}
        aria-controls="collapse-text"
        aria-expanded={toolbarStatus}
        className="btn-dark my-3"
      >
        {toolbarStatus ? "Hide Toolbar" : "Show Toolbar"}
      </Button>
      <Collapse in={toolbarStatus}>
        <div id="collapse-text">
          <Button
            onClick={() => setViewResponses((value) => !value)}
            className="btn btn-info btn-sm m-1"
          >
            {viewResponses ? "Hide Responses" : "Show Responses"}
          </Button>

          {viewResponses && (
            <div className="responses my-2">
              <ViewResponses id={props.data.id} questions={questions} />
            </div>
          )}

          <Link
            className="btn btn-warning btn-sm m-1"
            to={"/dashboard/created-tests/autograde/" + props.data.id}
          >
            Auto Grade
          </Link>
          <Link
            className="btn btn-danger btn-sm m-1"
            to={"/dashboard/created-tests/plagiarism-results/" + props.data.id}
          >
            Plagiarism Results
          </Link>
        </div>
      </Collapse>
    </Container>
  );
}

function ShowTests(props) {
  let testElements = props.data.map((data) => {
    return (
      <div key={data.id}>
        <Test data={data} key={data.id} />
      </div>
    );
  });
  return <div>{testElements}</div>;
}

function CreatedTests(props) {
  const [myTests, setMyTests] = useState(null);
  console.log(myTests);

  // get list of all tests created by the current user
  useEffect(() => {
    axios
      .get(api.my_tests_url, {
        auth: api.credentials,
      })
      .then((res) => {
        setMyTests(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  return myTests ? <ShowTests data={myTests} /> : <div className={"body-text"}>Loading...</div>;
}

export default CreatedTests;
