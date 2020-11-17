import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import {
  ListGroupItem,
  ListGroup,
  Container,
  Collapse,
} from "react-bootstrap";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const api = {
  my_tests_url: "http://quick-grader.herokuapp.com/test/mytests/",
  question_url: "http://quick-grader.herokuapp.com/test/question/",
  lock_unlock_quiz_url: "http://quick-grader.herokuapp.com/test/quiz/lock/",
  choice_url: "http://quick-grader.herokuapp.com/test/choice/",
  // http://localhost:8000/test/response/?quizID=286
  response_url: "http://quick-grader.herokuapp.com/test/response/",
  // http://localhost:8000/test/answer/?responseID=36
  answer_url: "http://quick-grader.herokuapp.com/test/answer/",
};

function ViewResponses(props) {
  const [responses, setResponses] = useState([]);

  // console.log(props.token);
  // get the responses intially
  useEffect(() => {
    axios
      .get(api.response_url, {
        params: {
          quizID: props.id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        setResponses(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  let responseElements = responses.map((data, index) => {
    return (
      <ListGroupItem
        key={data.id}
        style={
          data.graded & 1 ? { backgroundColor: "rgba(200, 200, 200, 1)" } : null
        }
      >
        <div className="d-flex justify-content-between">
          <Link target="_blank" to={"/dashboard/created-tests/response/" + data.id}>
            {data.taken_by}
          </Link>
          {data.graded && (
            <p className="lead mb-0" style={{ fontSize: "1.0rem" }}>
              Score: {data.total_score}
            </p>
          )}
        </div>
      </ListGroupItem>
    );
  });

  return <ListGroup className="w-50">{responseElements}</ListGroup>;
}

// display a single Test
function Test(props) {
  const [toolbarStatus, setToolbarStatus] = useState(false);
  const [viewResponses, setViewResponses] = useState(false);
  const [lockStatus, setLockStatus] = useState(false);
  const [questions, setQuestions] = useState(() => {
    return [];
  });
  const [choices, setChoices] = useState(() => {
    return {};
  });

  // console.log(questions);

  // get all the questions for the currenttest
  useEffect(() => {
    setLockStatus(props.data.locked);
    if (questions.length > 0) return;
    // console.log("making requests");
    props.data.questions.forEach((questionID, index) => {
      axios
        .get(api.question_url + questionID + '/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${props.token}`,
          },
        })
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
      promises.push(
        axios.get(api.choice_url + choices[choiceId] + '/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${props.token}`,
          },
        })
      );
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
        <div key={data.id} className="my-3 bg-light p-3">
          <span style={{ fontSize: "1.2em" }}>
            Question {idx + 1}. {data.problem}
          </span>
          <div className="choices mt-3">
            <ul>{questionChoices}</ul>
          </div>
          <div className="max-marks d-flex justify-content-end pr-1">
            Maximum Marks: {data.maximum_score}
          </div>
        </div>
      );
    }
  });

  const changeLockStatus = () => {
    axios
      .get(api.lock_unlock_quiz_url + props.data.code + "/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => setLockStatus(!lockStatus))
      .catch((err) => console.log(err));
  };

  return (
    <Container className="test-form my-5 border p-3">
      <div className="info">
        <h3 className="display-4">{props.data.title}</h3>
        <div className="d-flex justify-content-between">
          <p className="lead">{props.data.description}</p>
          <div className="code-share">
            <p className="card" style={{ color: "black" }}>
              {props.data.code}
            </p>
            <button
              className="btn btn-sm btn-info"
              onClick={() => navigator.clipboard.writeText(props.data.code)}
            >
              Copy
            </button>
          </div>
        </div>

        <hr className="info-hr" />
      </div>

      <div className="list-group">{questionElements}</div>

      <div className="toolbar d-flex justify-content-end">
        <Link
          onClick={() => setToolbarStatus((oldValue) => !oldValue)}
          aria-controls="collapse-text"
          aria-expanded={toolbarStatus}
          className="my-3 d-flex justify-content-end"
        >
          {toolbarStatus ? (
            <img
              style={{ height: "30px" }}
              className="content-image mx-3"
              src={require("../static/images/collapse.png")}
            />
          ) : (
            <img
              style={{ height: "30px" }}
              className="content-image mx-3"
              src={require("../static/images/info.png")}
            />
          )}
        </Link>

        {/* Lock/Unlock the quiz (stop accepting responses)  */}
        <button
          className="lock-unlock btn btn-transparent"
          onClick={changeLockStatus}
        >
          {lockStatus ? (
            <img
              style={{ height: "30px" }}
              className="content-image mx-1"
              src={require("../static/images/unlock.png")}
            />
          ) : (
            <img
              style={{ height: "30px" }}
              className="content-image mx-1"
              src={require("../static/images/lock.png")}
            />
          )}
        </button>
      </div>

      <Collapse in={toolbarStatus} className="mt-4">
        <div id="collapse-text mt-2">
          <Link onClick={() => setViewResponses((value) => !value)}>
            {viewResponses ? (
              <div className="d-flex">
                <img
                  style={{ height: "25px" }}
                  className="content-image mx-1"
                  src={require("../static/images/responses.png")}
                />
                <p className="text-dark">Hide Responses</p>
              </div>
            ) : (
              <div className="d-flex">
                <img
                  style={{ height: "25px" }}
                  className="content-image mx-1"
                  src={require("../static/images/responses.png")}
                />
                <p className="text-dark">Show Responses</p>
              </div>
            )}
          </Link>
          {viewResponses && (
            <div className="responses my-1 mb-3">
              <p className="lead" style={{ fontSize: "0.8rem" }}>
                Click the responses to grade them manually.
              </p>
              <ViewResponses
                id={props.data.id}
                questions={questions}
                token={props.token}
              />
            </div>
          )}

          <Link
            className="m-0"
            to={"/dashboard/created-tests/autograde/" + props.data.id}
          >
            <div className="d-flex">
              <img
                style={{ height: "25px" }}
                className="content-image mx-1"
                src={require("../static/images/autograde.png")}
              />
              <p className="text-dark">Auto Grade</p>
            </div>
          </Link>
          {/* <Link
            className="btn btn-danger btn-sm m-1"
            to={"/dashboard/created-tests/plagiarism-results/" + props.data.id}
          >
            Plagiarism Results
          </Link> */}
        </div>
      </Collapse>
    </Container>
  );
}

function ShowTests(props) {
  let testElements = props.data.map((data) => {
    return (
      <div key={data.id}>
        <Test data={data} key={data.id} token={props.token} />
      </div>
    );
  });
  return <div>{testElements}</div>;
}

function CreatedTests(props) {
  const [myTests, setMyTests] = useState(null);
  // console.log(myTests);

  // get list of all tests created by the current user
  useEffect(() => {
    axios
      .get(api.my_tests_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        setMyTests(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  return myTests ? (
    <ShowTests data={myTests} token={props.token} />
  ) : (
    <div className={"body-text mt-5"}>
      Loading...
      <img
        style={{ width: "30px" }}
        className="content-image mx-3"
        src={require("../static/images/loading.png")}
      />
    </div>
  );
}

export default CreatedTests;
