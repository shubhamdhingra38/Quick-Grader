import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TakeTest.css";
import Quiz from "./Quiz";
import "./CreateTest.css";
import { Container } from "react-bootstrap";
import { useAlert } from "react-alert";
import domain from "../../api";


const api = {
  quiz_url: domain + "test/quiz/instance/",
  response_url: domain + "test/response/",
};

axios.defaults.xsrfHeaderName = "X-CSRFToken";

function TakeTest(props) {
  const [status, setStatus] = useState({ code: "", submitted: false });
  const [quizDetail, setQuizDetail] = useState({});
  const [response, setResponse] = useState();
  const [didMount, setDidMount] = useState(false);
  const alert = useAlert();

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
        alert.show("You have already taken the test.", {
          type: "error",
          timeout: 4000,
        });
      });
  };

  const handleChange = (event) => {
    let value = event.target.value;
    setStatus({ ...status, code: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(api.quiz_url + status.code + "/");
    axios
      .get(api.quiz_url + status.code + "/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        if (res.data.locked) {
          // console.log("Quiz is locked!");
          alert.show(
            "Sorry. No more responses are allowed, the quiz is locked.",
            {
              type: "error",
              timeout: 4000,
            }
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
        alert.show("You entered an incorrect code!", {
          type: "error",
          timeout: 4000,
        });
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
        </div>
      )}
    </Container>
  );
}

export default TakeTest;
