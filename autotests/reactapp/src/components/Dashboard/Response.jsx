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
  quiz_url: "http://localhost:8000/test/quiz/",
  question_url: "http://localhost:8000/test/question/",
  choice_url: "http://localhost:8000/test/choice/",
  // http://localhost:8000/test/response/?quizID=286
  response_url: "http://localhost:8000/test/response/",
  // http://localhost:8000/test/answer/?responseID=36
  answer_url: "http://localhost:8000/test/answer/",
  grade_url: "http://localhost:8000/test/grade/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};

function Response(props) {
  document.title = "Grade";
  // console.log(props.location);
  const [answers, setAnswers] = useState([]);
  const [quizInfo, setQuizInfo] = useState();
  const [studentName, setStudentName] = useState("");

  // console.log(answers);

  useEffect(() => {
    axios
      .get(api.response_url + props.match.params.responseID, {
        auth: api.credentials,
      })
      .then((res) => {
        // console.log(res);
        setStudentName(res.data.taken_by);
        axios
          .get(api.quiz_url + res.data.test, { auth: api.credentials })
          .then((result) => {
            // console.log(result);
            setQuizInfo(result.data);
          })
          .catch((err) => console.log(err.response));
      })
      .catch((err) => console.log(err.response));

    axios
      .get(api.answer_url, {
        auth: api.credentials,
        params: {
          responseID: props.match.params.responseID,
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
  }, []);

  return (
    <>
      {quizInfo ? (
        <Test
          responseID={props.match.params.responseID}
          name={studentName}
          matchingResponses={props.location.matchingResponses}
          data={quizInfo}
          answers={answers}
        />
      ) : (
        "Loading..."
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

  // console.log(marks);

  useEffect(() => {
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

  const toggleToast = () => setShowToast(!showToast);

  const getChoices = (data) => {
    let choices = data.choices;
    let promises = [];
    let choiceId;
    for (choiceId in choices) {
      // console.log(api.choice_url + choices[choiceId]);
      promises.push(
        axios.get(api.choice_url + choices[choiceId], { auth: api.credentials })
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
    console.log("graded...", props.responseID);
    let obj = {
      grade: marks,
      responseID: props.responseID,
      type: 1,
    };
    console.log(JSON.stringify(obj));
    axios
      .post(api.grade_url, obj, {
        auth: api.credentials,
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
        className += props.matchingResponses.find((ele) => ele == data.id)
          ? "list-group-item-danger"
          : "list-group-item-seconday";
      else className += "list-group-item-secondary";
      return (
        <div className="response" key={data.id}>
          <li key={data.id} className={className}>
            <span style={{ fontSize: "1.2em" }}>
              Question {idx + 1}. {data.problem}
            </span>
            <div className="answer">
              <p>
                Answer: {props.answers[id] ? props.answers[id].short_ans : ""}
              </p>
            </div>
          </li>
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
        <div className="response" key={data.id}>
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
        <ul>{alertElements}</ul>
      </Alert>
    ) : null;

  if (redirect) return <Redirect to="/dashboard/created-tests/" />;
  return (
    <Container>
      {alert}
      <div className="border test-form p-3 mt-3">
        <div className="info">
          <h3 className="display-4">{props.data.title}</h3>
          <p className="lead">{props.data.description}</p>
          <p className="text-danger">Attempted by: {props.name}</p>
          <hr className="info-hr" />
        </div>
        {showToast ? toast : null}
        {questionElements}
        <Button onClick={handleSubmit} className="btn btn-md btn-success">
          Grade
        </Button>
      </div>
    </Container>
  );
}
