import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Toast,
  Alert,
  ListGroupItem,
  ListGroup,
  Container,
  Button,
} from "react-bootstrap";
import { Redirect } from "react-router-dom";

const api = {
  quiz_url: "https://quick-grader.herokuapp.com/test/quiz/",
  question_url: "https://quick-grader.herokuapp.com/test/question/",
  choice_url: "https://quick-grader.herokuapp.com/test/choice/",
  // https://localhost:8000/test/response/?quizID=286
  response_url: "https://quick-grader.herokuapp.com/test/response/",
  // https://localhost:8000/test/answer/?responseID=36
  answer_url: "https://quick-grader.herokuapp.com/test/answer/",
  grade_url: "https://quick-grader.herokuapp.com/test/grade/",
};

axios.defaults.xsrfHeaderName = "X-CSRFToken";

function Response(props) {
  if (!props.plag) document.title = "Grade";
  // console.log(props);
  // console.log(props.location);
  const [answers, setAnswers] = useState([]);
  const [quizInfo, setQuizInfo] = useState();
  const [studentName, setStudentName] = useState("");
  let responseID = props.match
    ? props.match.params.responseID
    : props.responseID;
  console.log(responseID);
  // console.log(answers);

  useEffect(() => {
    axios
      .get(api.response_url + responseID + "/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        setStudentName(res.data.taken_by);
        axios
          .get(api.quiz_url + res.data.test + "/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${props.token}`,
            },
          })
          .then((result) => {
            // console.log(result);
            setQuizInfo(result.data);
          })
          .catch((err) => console.log(err.response));
      })
      .catch((err) => console.log(err.response));

    axios
      .get(api.answer_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
        params: {
          responseID: responseID,
        },
      })
      .then((res) => {
        res.data.forEach((ele) => {
          setAnswers((oldState) => {
            return {
              ...oldState,
              [ele.question_id]: ele,
            };
          });
        });
      })
      .catch((err) => console.log(err.response));
  }, [responseID]);

  return (
    <>
      {quizInfo ? (
        <Test
          plag={props.plag}
          token={props.token}
          responseID={responseID}
          name={studentName}
          matchingResponses={props.matchingResponses}
          data={quizInfo}
          answers={answers}
        />
      ) : (
        <div className={"body-text"}>
          Loading...
          <img
            style={{ width: "30px" }}
            className="content-image mx-3"
            src={require("../static/images/loading.png")}
          />
        </div>
      )}
    </>
  );
}

export default Response;

function Test(props) {
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState({});
  const [marks, setMarks] = useState({});
  const [redirect, setRedirect] = useState(false);
  const [errorMsg, setErrorMsg] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // console.log(props.matchingResponses);
  // console.log(marks);
  // console.log(props.token);
  // console.log(props.data);

  useEffect(() => {
    props.data.questions.forEach((questionID, index) => {
      axios
        .get(api.question_url + questionID + "/", {
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

  const toggleToast = () => setShowToast(!showToast);

  const getChoices = (data) => {
    let choices = data.choices;
    let promises = [];
    let choiceId;
    for (choiceId in choices) {
      // console.log(api.choice_url + choices[choiceId]);
      promises.push(
        axios.get(api.choice_url + choices[choiceId] + "/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${props.token}`,
          },
        })
      );
    }
    Promise.all(promises).then((res) => {
      res.forEach((choice) => {
        setChoices((oldState) => {
          return {
            ...oldState,
            [choice.data.id]: choice.data,
          };
        });
      });
    });
  };

  const handleSubmit = () => {
    // console.log("graded...", props.responseID);
    let obj = {
      grade: marks,
      responseID: props.responseID,
      type: 1,
    };
    console.log(JSON.stringify(obj));
    axios
      .post(api.grade_url, obj, {
        headers: {
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        console.log(res);
        console.log("over here");
        setRedirect(true);
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response.status == 400) {
          console.log("bad request made");
          setErrorMsg((oldVal) =>
            oldVal.concat(["Score cannot exceed maximum value!"])
          );
        }
      });
  };

  const handleChange = (event, max_score) => {
    console.log(event.target);
    let val = event.target.value;
    if (val > max_score) setShowToast(true);
    // setErrorMsg((oldVal) =>
    //   oldVal.concat(["Score cannot exceed maximum value!"])
    // );
    let id = event.target.id;
    // console.log(val);
    setMarks((oldValue) => {
      return { ...oldValue, [id]: val };
    });
  };

  let toast = (
    <div
      style={{
        position: "relative",
        minHeight: "100px",
      }}
    >
      <Toast
        onClose={toggleToast}
        show={showToast}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <Toast.Header>
          <strong className="mr-auto text-dark">Oops! An error occured.</strong>
        </Toast.Header>
        <Toast.Body style={{ backgroundColor: "rgba(255, 0, 0, 0.75)" }}>
          Assigned score cannot exceed maximum value
        </Toast.Body>
      </Toast>
    </div>
  );

  let questionElements = questions.map((data, idx) => {
    if (data.type == 1) {
      let id = data.id;
      // Short answer
      let className = "my-3 list-group-item ";
      // console.log(props);
      if (props.matchingResponses)
        className += props.matchingResponses.includes(data.id)
          ? "list-group-item-danger"
          : "list-group-item-seconday";
      else className += "list-group-item-secondary";
      let marksEle = props.plag ? null : (
        <div className="max-score mt-2">
          <label htmlFor={id}>Marks:</label>
          <input
            id={id}
            value={marks[id]}
            onChange={(e) => handleChange(e, data.maximum_score)}
            className="ml-1"
            style={{ width: "33px" }}
            type="text"
            name="score"
          />
          <label htmlFor={id}>/{data.maximum_score}</label>
        </div>
      );
      return (
        <div className="responses" key={data.id}>
          <li
            key={data.id}
            className={className}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
          >
            <span style={{ fontSize: "1.2em" }}>
              Question {idx + 1}. {data.problem}
            </span>
            <div className="answer">
              <p>
                Answer: {props.answers[id] ? props.answers[id].short_ans : ""}
              </p>
            </div>
          </li>
          {marksEle}
        </div>
      );
    } else {
      // MCQ
      let selected = props.answers[data.id]
        ? props.answers[data.id].choice_id
        : null;
      let questionChoices = data.choices.map((choiceID) => {
        return choices[choiceID] ? (
          <ListGroup.Item
            key={`${props.data.id}-${choices[choiceID].id}`}
            className={
              choiceID == selected
                ? choices[choiceID].is_answer
                  ? "bg-success"
                  : "bg-danger"
                : choices[choiceID].is_answer
                ? "bg-success"
                : null
            }
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
        <div className="responses" key={data.id}>
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
          </li>
        </div>
      );
    }
  });

  let alertElements = errorMsg.map((ele, index) => {
    return <li key={index}>{ele}</li>;
  });

  let alert =
    errorMsg.length > 0 ? (
      <Alert
        variant="danger"
        onClose={() => {
          setErrorMsg([]);
        }}
        dismissible
      >
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <ul className="px-2 py-1">{alertElements}</ul>
      </Alert>
    ) : null;

  if (redirect) return <Redirect to="/dashboard/created-tests/" />;
  let borderClass = props.plag ? null : "test-form";
  return (
    <Container className={`${borderClass} p-3 mt-5 border`} style={{ position: "relative" }}>
      {alert}
      <div>
        <div className="info">
          <h3 className="display-4">{props.data.title}</h3>
          <p className="lead">{props.data.description}</p>
          <p className="text-danger">Attempted by: {props.name}</p>
          <hr className="info-hr" />
        </div>
        {showToast ? toast : null}
        <div style={{ marginBottom: "35px" }}>
          { questionElements }
        </div>
        {props.plag ? null : (
          <Button
            onClick={handleSubmit}
            className="btn btn-md btn-success"
            style={{right: "22px", bottom: "7px", position: "absolute"}}
          >
            Grade
          </Button>
        )}
      </div>
    </Container>
  );
}
