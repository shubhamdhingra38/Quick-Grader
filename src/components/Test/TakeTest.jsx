import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TakeTest.css";
import Quiz from "./Quiz";
import "./CreateTest.css";
import { Container, Alert } from "react-bootstrap";

const api = {
  quiz_url: "https://quick-grader.herokuapp.com/test/quiz/instance/",
  response_url: "https://quick-grader.herokuapp.com/test/response/",
};

axios.defaults.xsrfHeaderName = "X-CSRFToken";

function TakeTest(props) {
  const [status, setStatus] = useState({ code: "", submitted: false });
  const [quizDetail, setQuizDetail] = useState({});
  const [response, setResponse] = useState();
  const [wrongMsg, setWrongMsg] = useState(null);
  const [didMount, setDidMount] = useState(false);

  // console.log(props.token);

  // can only create one response per test for a student
  const createResponse = (id) => {
    axios
      .post(
        api.response_url,
        {
          test: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${props.token}`,
          },
        }
      )
      .then((res) => {
        // console.log("created response");
        // console.log(res.data);
        setResponse(res.data.id);
      })
      .then((data) => {
        setStatus({ ...status, submitted: true });
      })
      .catch((err) => {
        console.log(err.response);
        setWrongMsg("You have already taken the test.");
      });
  };

  const handleChange = (event) => {
    let value = event.target.value;
    setStatus({ ...status, code: value });
  };

  const handleSubmit = (event) => {
    console.log("A code was submitted");
    console.log(status.code);
    event.preventDefault();
    console.log("token being used is ", props.token);
    // console.log(api.quiz_url + status.code + "/");
    axios
      .get(api.quiz_url + status.code + "/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        console.log("result is ", res);
        if (res.data.locked) {
          // console.log("Quiz is locked!");
          setWrongMsg(
            "Sorry. No more responses are allowed, the quiz is locked."
          );
        } else {
          setQuizDetail({ data: res.data });
          // create a new response
          // console.log(res.data);
          createResponse(res.data.id);
        }
      })
      .catch((err) => {
        // console.log(err);
        setWrongMsg("You probably entered an incorrect code. Try again.");
      });
  };

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) return null;

  return (
    <Container>
      {status.submitted ? (
        <Quiz {...quizDetail.data} token={props.token} responseId={response} />
      ) : (
        <div className="body-text">
          <div>
            <form onSubmit={handleSubmit}>
              <div id="code-input" className="text-white form-group">
                <label className="lead text-success" htmlFor="invitation-code">
                  Invitation Code:{" "}
                </label>
                <div className="d-flex">
                  <input
                    type="text"
                    id="invitation-code"
                    placeholder="Code here"
                    value={status.code}
                    onChange={handleChange}
                    className="row form-control"
                    style={{
                      width: "300px",
                      borderWidth: 2,
                      backgroundColor: "#00646421",
                    }}
                  />
                  <button className="btn btn-md ml-5 btn-success">
                    Submit
                  </button>
                </div>
                <p
                  id="help"
                  className="form-text text-muted"
                  style={{ fontSize: "0.8rem" }}
                >
                  *Enter the code shared by the teacher.
                </p>
              </div>
            </form>
          </div>
          {wrongMsg ? (
            <Alert
              className="mt-4 alert-bottom"
              variant="danger"
              onClose={() => setWrongMsg(false)}
              dismissible
            >
              <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
              <p>{wrongMsg}</p>
            </Alert>
          ) : null}
        </div>
      )}
    </Container>
  );
}

export default TakeTest;
