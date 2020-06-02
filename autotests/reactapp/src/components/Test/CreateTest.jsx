import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TakeTest.css";
import Quiz from "./Quiz";
import { Link, Route, Switch, useRouteMatch, Redirect } from "react-router-dom";
import "./CreateTest.css";
import {
  Form,
  Button,
  Alert,
  ListGroup,
  Card,
  FormGroup,
  InputGroup,
  FormControl,
  Container,
} from "react-bootstrap";

const api = {
  quiz_url: "http://localhost:8000/test/quiz/",
  choice_url: "http://localhost:8000/test/choice/",
  response_url: "http://localhost:8000/test/response/",
  question_url: "http://localhost:8000/test/question/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};

function ShortAnswerQuestion(props) {
  return (
    <Container>
      <Form className="short-answer my-3">
        {/* Question */}
        <Form.Group className="question">
          <Form.Label>Question: {props.id}</Form.Label>
          <Form.Control
            className="p-2"
            value={props.questions[props.id][0]}
            as="textarea"
            rows="3"
            id={props.id}
            name="question"
            onChange={props.handleChange}
            required
          />
        </Form.Group>

        {/* Answer */}
        <Form.Group className="answer">
          <Form.Label>Answer:</Form.Label>
          <Form.Control
            className="p-2"
            value={props.questions[props.id][1]}
            as="textarea"
            rows="3"
            id={props.id}
            name="answer"
            onChange={props.handleChange}
            required
          />
        </Form.Group>
      </Form>
    </Container>
  );
}

function MultipleChoiceQuestion(props) {
  const handleKeyPress = (event) => {
    // Enter key is pressed, add another choice
    if (event.charCode == 13) {
      props.setChoices((oldValue) => {
        // deep copy
        let [questionText, choices, selected] = JSON.parse(
          JSON.stringify(oldValue[props.id])
        );
        choices.push("");
        return { ...oldValue, [props.id]: [questionText, choices, selected] };
      });
    }
  };

  const handleSelect = (event) => {
    // Radio button select
    let [id, index] = event.target.id.split("-");
    props.setChoices((oldValue) => {
      let question = oldValue[id];
      return { ...oldValue, [id]: [question[0], question[1], index] };
    });
  };

  let choices = props.questions[props.id][1];
  let selected = props.questions[props.id][2];
  let choiceElements = choices.map((ele, index) => {
    return (
      <ListGroup.Item
        key={`${props.id}-${index}`}
        className={selected == index ? "bg-success" : null}
      >
        <div className="choice p-1" key={`${props.id}-${index}`}>
          <input
            type="radio"
            id={`${props.id}-${index}`}
            name={`choice-${props.id}`}
            onChange={handleSelect}
            checked={selected == index}
            required
          />
          <input
            type="text"
            value={ele}
            id={`${props.id}-${index}`}
            onChange={props.handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Choice Text"
            name="choice-text"
            className="texts"
            required
          />
        </div>
      </ListGroup.Item>
    );
  });

  return (
    <Container className="multiple-choice">
      {/* Question */}
      <Form className="question my-3">
        <Form.Group>
          <Form.Label>Question {props.id}:</Form.Label>
          <Form.Control
            className="p-2"
            value={props.questions[props.id][0]}
            as="textarea"
            rows="3"
            id={props.id}
            name="question"
            onChange={props.handleChange}
          />
        </Form.Group>
      </Form>
      {/* <textarea className="p-2" value={props.questions[props.id][0]} id="short-ques" type="text" id={props.id} */}
      {/* rows="3" style={{ width: "90%" }} name="question" onChange={props.handleChange} /> */}
      <Card style={{ width: "18rem" }}>
        <ListGroup variant="flush">{choiceElements}</ListGroup>
      </Card>
    </Container>
  );
}

function AddQuestions(props) {
  // console.log(props);
  // Questions with Answer/Choices
  const [questions, setQuestions] = useState({});
  const [inputs, setInputs] = useState([]);
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [maxMarks, setMaxMarks] = useState({});
  const [errorMsg, setErrorMsg] = useState([]);

  // console.log(maxMarks);
  //   console.log(questions);

  const addShortAnswer = () => {
    if (!allowSubmit) {
      setAllowSubmit(true);
    }
    let id = inputs.length + 1;
    setInputs((oldState) =>
      oldState.concat({
        type: 1,
        id: id,
      })
    );
    setQuestions((oldState) => {
      return { ...oldState, [id]: ["", ""] };
    });
  };
  const addMCQ = () => {
    if (!allowSubmit) {
      setAllowSubmit(true);
    }
    let id = inputs.length + 1;
    setInputs((oldState) =>
      oldState.concat({
        type: 2,
        id: id,
      })
    );
    setQuestions((oldState) => {
      return { ...oldState, [id]: ["", [""], -1] };
    });
  };

  // for child components
  const handleChange = (event) => {
    let value = event.target.value;
    if (event.target.name == "question") {
      let id = event.target.id;
      let question = Array.from(questions[id]);
      if (question.length == 3) {
        question = [value, question[1], question[2]];
      } else {
        question = [value, question[1]];
      }
      setQuestions((oldState) => {
        return { ...oldState, [id]: question };
      });
    } else if (event.target.name == "choice-text") {
      let [id, index] = event.target.id.split("-");
      setQuestions((oldState) => {
        let [questionText, choices, choiceAnswer] = JSON.parse(
          JSON.stringify(oldState[id])
        );
        choices[index] = value;
        return { ...oldState, [id]: [questionText, choices, choiceAnswer] };
      });
    } else if (event.target.name == "answer") {
      // answer
      let id = event.target.id;
      let question = Array.from(questions[id]);
      question = [question[0], value];
      setQuestions((oldState) => {
        return { ...oldState, [id]: question };
      });
    } else if (event.target.name == "max-score") {
      let id = event.target.id;
      setMaxMarks((oldValue) => {
        return { ...oldValue, [id]: value };
      });
    }
  };

  // form validation
  const validate = () => {
    let flag = false;
    for (let property in questions) {
      let question = questions[property];
      if (question.length == 2 && question[1].split(" ").length < 3) {
        setErrorMsg((oldMsg) =>
          oldMsg.concat([
            "The length of expected answer must be at least 3 words",
          ])
        );
        flag = true;
      }
      if (question.length == 3 && question[2] == -1) {
        setErrorMsg((oldMsg) =>
          oldMsg.concat(["Every MCQ must have a selected answer"])
        );
        flag = true;
      }
      if (question[0].split(" ").length < 3) {
        setErrorMsg((oldMsg) =>
          oldMsg.concat(["The length of question must be at least 3 words"])
        );
        flag = true;
      }
      if (!maxMarks[property]) {
        setErrorMsg((oldMsg) =>
          oldMsg.concat(["Maximum Marks field cannot be left empty"])
        );
        flag = true;
      } else if (isNaN(maxMarks[property])) {
        setErrorMsg((oldMsg) =>
          oldMsg.concat(["Maximum Marks field must be a number"])
        );
        flag = true;
      }
      if (flag) return false;
    }
    return true;
  };

  const handleSubmit = (event) => {
    if (!allowSubmit) {
      setErrorMsg((oldMsg) =>
        oldMsg.concat(["You must add at least one question"])
      );
      return;
    }
    let res = validate();
    if (!res) {
      return;
    }
    event.preventDefault();
    // console.log("Submitted");
    // console.log(questions);

    const code = props.code;

    let type, problem, ans, choices;
    for (let property in questions) {
      //   console.log(property, "property");
      let question = questions[property];
      //   console.log(question);
      if (question.length == 2) {
        // Type 1 short answer
        type = 1;
        problem = question[0];
        ans = question[1];
      } else {
        // Type 2 MCQ
        type = 2;
        problem = question[0];
        ans = ""; // choice consists of isAnswer property already
      }

      //   console.log("maxscore", maxMarks[property], maxMarks);
      axios
        .post(
          api.question_url,
          {
            type: type,
            problem: problem,
            quiz_code: code,
            ans: ans,
            maximum_score: parseInt(maxMarks[property]),
          },
          {
            auth: api.credentials,
          }
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.type == 2) {
            console.log("type 2");
            console.log(props.id);
            type = 2;
            problem = question[0];
            choices = question[1];
            ans = parseInt(question[2]); // index of answer
            choices.forEach((ele, index) => {
              axios
                .post(
                  api.choice_url,
                  {
                    question_id: res.data.id,
                    choice_text: ele,
                    is_answer: index == ans,
                  },
                  { auth: api.credentials }
                )
                .then((result) => console.log(result))
                .catch((err) => console.log(err.response));
            });
          }
        })
        .catch((err) => console.log(err.response));
    }
    setRedirect(true);
  };

  let inputElements = inputs.map((value) => {
    if (value.type == 1) {
      return (
        <div key={value.id}>
          <ShortAnswerQuestion
            id={value.id}
            questions={questions}
            setQuestions={setQuestions}
            handleChange={handleChange}
          />

          <div className="max-score mt-2 d-flex justify-content-end">
            <label htmlFor={`${value.id}`}>Maximum Marks:</label>
            <input
              onChange={handleChange}
              className="ml-1"
              style={{ width: "50px" }}
              type="text"
              name="max-score"
              id={`${value.id}`}
              required
            />
          </div>
          <hr />
        </div>
      );
    }
    return (
      <div key={value.id}>
        <MultipleChoiceQuestion
          id={value.id}
          questions={questions}
          setChoices={setQuestions}
          handleChange={handleChange}
        />
        <div className="max-score mt-2 d-flex justify-content-end">
          <label htmlFor={`${value.id}`}>Maximum Marks:</label>
          <input
            onChange={handleChange}
            className="ml-1"
            value={maxMarks[value.id]}
            style={{ width: "50px" }}
            type="text"
            name="max-score"
            id={`${value.id}`}
          />
        </div>
        <hr />
      </div>
    );
  });

  let alertElements = errorMsg.map((ele) => {
    return <li>{ele}</li>;
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

  if (redirect)
    return (
      <Container className="invitation-code">
        <p className="text-success font-cursive ">Test has been successfully created!</p>
        <p className="font-cursive ">Share this code with students: </p>
        <div className="code-share">
          <p className="card">{props.code}</p>
          <button
            className="btn btn-sm btn-success"
            onClick={() => navigator.clipboard.writeText(props.code)}
          >
            Copy
          </button>
        </div>
      </Container>
    );
  return (
    <Container>
      {/* Error message */}
      {alert}
      <Container className="border test-form p-3" style={{ minHeight: "80vh" }}>
        {/* Info about Quiz */}
        <div className="info">
          <h3 className="display-4">{props.title}</h3>
          <p className="lead">{props.desc}</p>
          <hr className="info-hr" />
        </div>
        {inputElements}
        <div className="type-ques">
          <label htmlFor="someid" className="mr-3">
            Add Question
          </label>
          <button
            id="someid"
            onClick={addShortAnswer}
            className="mt-2 btn btn-sm btn-info"
          >
            Short Answer
          </button>
          <button onClick={addMCQ} className="mt-2 ml-3 btn btn-sm btn-warning">
            MCQ
          </button>
        </div>
        <br />
        {allowSubmit && (
          <button
            onClick={handleSubmit}
            className="my-3 btn btn-md btn-success"
          >
            Submit
          </button>
        )}
      </Container>
    </Container>
  );
}

function CreateTest(props) {
  let { path, url } = useRouteMatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [redirectInfo, setRedirectInfo] = useState({ status: false });

  const validate = () => {
    if (title.length == 0) return false;
    if (description.length == 0) return false;
    return true;
  };

  const handleSubmit = (event) => {
    // POST and create a new quiz code and get the id
    // console.log("submitted");
    let res = validate();
    if (!res) return;
    axios
      .post(
        api.quiz_url,
        {
          title: title,
          description: description,
        },
        {
          auth: api.credentials,
        }
      )
      .then((res) => {
        setRedirectInfo({
          status: true,
          code: res.data.code,
          id: res.data.id,
        });
      })
      .catch((err) => console.log(err.response));
    event.preventDefault();
  };

  if (redirectInfo.status)
    return (
      <div className="m-3">
        <Redirect to={`${path}/addquestions`} />
        <Route path={`${path}/addquestions`}>
          {
            <AddQuestions
              code={redirectInfo.code}
              id={redirectInfo.id}
              title={title}
              desc={description}
            />
          }
        </Route>
      </div>
    );
  return (
    <Container className="mx-auto mt-5 border p-4 rounded test-creation">
      <Form>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Test Title"
            required
          />
          <Form.Text className="text-muted">
            Enter information about the test
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formDescription">
          <Form.Label name="title">Description</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows="3"
            placeholder="Test Description"
            required
          />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Use AI to grade" />
          <Form.Check type="checkbox" label="Use Plagiarism Detection" />
        </Form.Group>
        <Button onClick={handleSubmit} variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default CreateTest;
