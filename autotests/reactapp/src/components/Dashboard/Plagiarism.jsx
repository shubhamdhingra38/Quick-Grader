import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Tab, Col, ListGroup, Row, Container } from "react-bootstrap";
import Response from "./Response";
import { Link } from "react-router-dom";

const api = {
  // http://localhost:8000/ml/detect-plagiarism/287 for quiz 287
  plagiarism_detection_url: "http://localhost:8000/ml/detect-plagiarism/",
  response_url: "http://localhost:8000/test/response/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};

function Similar(props) {
  const [similarResponses, setSimilarResponses] = useState();
  // console.log(props);
  // console.log(props.responses);
  // useEffect(() => {

  // }, []);
  let similarResponseElement = Object.keys(props.similar).map((ele) => {
    return (
      <div key={ele}>
        <Link
          to={{
            pathname: "/dashboard/created-tests/response/" + ele,
            matchingResponses: props.similar[ele],
          }}
        >
          {props.responses ? props.responses[ele] : "Loading..."}
        </Link>
        <br />
      </div>
    );
  });
  if(similarResponseElement.length > 0){
    return (
        <div className="mt-3">
        This response is found similar to:
        <br />
        {similarResponseElement}
        </div>
    );
  }

    return (
        <div className="mt-3">
            No matching responses
        </div>
    )
}

function PlagiarismResults({ match }) {
  const [results, setResults] = useState();
  const [similar, setSimilar] = useState();
  const [responses, setResponses] = useState();
  const [errorMsg, setErrorMsg] = useState([]);

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
        setErrorMsg(oldMsg => oldMsg.concat([err.response.data.message]));
      });
  }, []);

  useEffect(() => {
    setSimilar(results);
  }, [results]);

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
            <Similar similar={matchingResponses} responses={responses} />
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
              responses ? responses[ele] : "Loading..."
            } found similar instances ${Object.keys(matchingResponses).length}`}
          </ListGroup.Item>
        );
      })
    : null;

  // console.log(studentListElements);

  return (
    <Container className="ml-5 m-2 w-75">
        {/* Error messages */}
        {alert}
      <Tab.Container id="list-group-tabs">
        <Row>
          <Col sm={12}>
            <ListGroup className="d-flex justify-content-center flex-column">
              {studentListElements ? studentListElements : "Loading..."}
            </ListGroup>
          </Col>
          <Col sm={8}>
            <Tab.Content>
              {linkElements}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default PlagiarismResults;
