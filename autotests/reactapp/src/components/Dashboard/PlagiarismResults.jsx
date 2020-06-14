import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Alert,
  Tab,
  Col,
  ListGroup,
  Row,
  Container,
} from "react-bootstrap";
import Response from "./Response";
import { Link } from "react-router-dom";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const api = {
  // http://localhost:8000/ml/detect-plagiarism/287 for quiz 287
  set_plagiarism: "http://localhost:8000/test/quiz/plagiarize/",
  plagiarism_detection_url: "http://localhost:8000/ml/detect-plagiarism/",
  response_url: "http://localhost:8000/test/response/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};

function Similar(props) {
  const [similarResponses, setSimilarResponses] = useState();
  const [flagStatus, setFlagStatus] = useState({});

  let similarResponseElements = Object.keys(props.similar).map((ele) => {
    if (flagStatus[ele] == undefined) flagStatus[ele] = false;
    return (
      <div key={ele} className="test-form w-25 d-flex justify-content-between">
        <Button
          variant="link"
          onClick={() => {
            props.setCompareTo(ele);
            props.setCompareWith(props.parent);
          }}
        >
          {props.responses ? props.responses[ele] : "Loading..."}
        </Button>
        <div>
          {/* Mark as true positive */}
          <button
            className="btn btn-transparent"
            onClick={() => {
              props.setPlagiarism((oldValue) => {
                return { ...oldValue, [ele]: true, [props.parent]: true };
              });
              props.setCompareTo(null);
              props.setCompareWith(null);
              flagStatus[ele] = true;
            }}
          >
            {flagStatus[ele] ? (
              <img
                style={{ color: "red !important" }}
                style={{ height: "25px" }}
                className="content-image mx-0 mt-2"
                src={require("../static/images/flag_red.png")}
              />
            ) : (
              <img
                style={{ color: "red !important" }}
                style={{ height: "25px" }}
                className="content-image mx-0 mt-2"
                src={require("../static/images/flag.png")}
              />
            )}
          </button>
          {/* Discard as false positive */}
          <button
            className="btn btn-transparent"
            onClick={() => {
              props.setPlagiarism((oldValue) => {
                return { ...oldValue, [ele]: false, [props.parent]: false };
              });
              props.setSimilar((oldState) => {
                let newState = { ...oldState };
                delete newState[ele];
                delete newState[props.parent];
                return newState;
              });
              props.setCompareTo(null);
              props.setCompareWith(null);
            }}
          >
            <img
              style={{ height: "25px" }}
              className="content-image mx-0 mt-2"
              src={require("../static/images/close.png")}
            />
          </button>
        </div>
      </div>
    );
  });
  if (similarResponseElements.length > 0) {
    return (
      <div className="mt-3">
        This response is similar to:
        <br />
        {similarResponseElements}
      </div>
    );
  }

  return <div className="mt-3">No matching responses</div>;
}

function PlagiarismResults({ match }) {
  document.title = "Plagiarism";

  const [plagiarism, setPlagiarism] = useState([]);
  const [results, setResults] = useState();
  // const [countSimilar, setCountSimilar] = useState({});
  const [similar, setSimilar] = useState();
  const [responses, setResponses] = useState();
  const [errorMsg, setErrorMsg] = useState([]);
  const [compareTo, setCompareTo] = useState(null);
  const [compareWith, setCompareWith] = useState(null);

  console.log(similar);
  // console.log(countSimilar);

  // console.log(plagiarism);
  // console.log(similar);
  useEffect(() => {
    axios
      .get(api.plagiarism_detection_url + match.params.quizID, {
        auth: api.credentials,
      })
      .then((res) => {
        // console.log(res);
        setResults(res.data);
        Object.keys(res.data).forEach((responseID) => {
          // setCountSimilar((oldValue) => {
          //   return { ...oldValue, [responseID]: res.data[responseID] };
          // });
          axios
            .get(api.response_url + responseID, { auth: api.credentials })
            .then((result) => {
              // console.log(result);
              setResponses((oldValue) => {
                return { ...oldValue, [responseID]: result.data.taken_by };
              });
            })
            .catch((err) => console.log(err.response));
        });
      })
      .catch((err) => {
        console.log(err.response);
        setErrorMsg((oldMsg) => oldMsg.concat([err.response.data.message]));
      });
  }, []);

  useEffect(() => {
    setSimilar(results);
  }, [results]);

  const handleClick = () => {
    console.log("clicked");
    console.log(plagiarism);
    Object.keys(plagiarism).forEach((responseID) => {
      if (plagiarism[responseID]) {
        axios
          .post(api.set_plagiarism + responseID + "/", {
            auth: api.credentials,
          })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }
    });
  };

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

  let linkElements = [];
  // let studentListElements = null;
  let studentListElements = similar
    ? Object.keys(similar).map((ele, index) => {
        // console.log(ele);
        let matchingResponses = similar[ele];
        // console.log(matchingResponses);
        linkElements.push(
          <Tab.Pane key={index} eventKey={`#link${index}`}>
            <Similar
              parent={ele}
              similar={matchingResponses}
              responses={responses}
              setSimilar={setSimilar}
              setCompareTo={setCompareTo}
              setCompareWith={setCompareWith}
              setPlagiarism={setPlagiarism}
            />
          </Tab.Pane>
        );
        return (
          <ListGroup.Item
            key={index}
            action
            href={`#link${index}`}
            className={
              Object.keys(matchingResponses).length >= 1
                ? "list-group-item-danger"
                : "list-group-item-success"
            }
          >
            {`${
              responses ? (
                responses[ele]
              ) : (
                <div className={"body-text"}>
                  Loading...
                  <img
                    style={{ width: "30px" }}
                    className="content-image mx-3"
                    src={require("../static/images/loading.png")}
                  />
                </div>
              )
            } found ${Object.keys(matchingResponses).length} similar instances`}
          </ListGroup.Item>
        );
      })
    : null;

  // console.log(studentListElements);

  let rightComparison = compareTo ? (
    <Response
      responseID={compareTo}
      matchingResponses={similar[compareTo]}
      plag
    />
  ) : null;

  let leftComparison = compareWith ? (
    <Response
      responseID={compareWith}
      matchingResponses={similar[compareTo]}
      plag
    />
  ) : null;

  return (
    <Container>
      {/* Error messages */}
      {alert}
      <div className="body-text">Plagiarism Results:</div>
      <Tab.Container id="list-group-tabs">
        <ListGroup className="d-flex justify-content-center flex-column m-2">
          {studentListElements ? (
            studentListElements
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
        </ListGroup>
        <Tab.Content className="m-2">{linkElements}</Tab.Content>
      </Tab.Container>

      {responses ? (
        <Button onClick={handleClick} className="d-flex float-right mr-2">
          Save
        </Button>
      ) : null}
      <Row className="row-eq-height mt-5">
        <Col>{leftComparison}</Col>
        <Col>{rightComparison}</Col>
      </Row>
    </Container>
  );
}

export default PlagiarismResults;
