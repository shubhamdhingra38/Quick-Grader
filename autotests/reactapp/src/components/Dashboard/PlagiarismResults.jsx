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

  let similarResponseElements = Object.keys(props.similar).map((ele) => {
    return (
      <div key={ele}>
        <Button
          variant="link"
          onClick={() => {
            props.setCompareTo(ele);
            props.setCompareWith(props.parent);
          }}
        >
          {props.responses ? props.responses[ele] : "Loading..."}
        </Button>
        {/* <Response responseID={ele} matchingResponses={props.similar[ele]} /> */}
        {/* <Link
          to={{
            pathname: "/dashboard/created-tests/response/" + ele,
            matchingResponses: props.similar[ele],
          }}
        >
          {props.responses ? props.responses[ele] : "Loading..."}
        </Link> */}
        <br />
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

  const [results, setResults] = useState();
  const [similar, setSimilar] = useState();
  const [responses, setResponses] = useState();
  const [errorMsg, setErrorMsg] = useState([]);
  const [compareTo, setCompareTo] = useState(null);
  const [compareWith, setCompareWith] = useState(null);


  // console.log(responses);

  // console.log(similar);
  console.log(compareTo);
  // console.log(compareTo ? similar[compareTo] : "wait");

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
        setErrorMsg((oldMsg) => oldMsg.concat([err.response.data.message]));
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
            <Similar
              parent={ele}
              similar={matchingResponses}
              responses={responses}
              setCompareTo={setCompareTo}
              setCompareWith={setCompareWith}
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
            {`${responses ? responses[ele] : "Loading..."} found ${
              Object.keys(matchingResponses).length
            } similar instances`}
          </ListGroup.Item>
        );
      })
    : null;

  // console.log(studentListElements);

  let rightComparison = compareTo ? (
    <Response responseID={compareTo} matchingResponses={similar[compareTo]} plag/>
  ) : null;

  let leftComparison = compareWith ? (
    <Response responseID={compareWith} matchingResponses={similar[compareTo]} plag/>
  ) : null;

  return (
    <Container>
      {/* Error messages */}
      {alert}
      <div>Plagiarism Results:</div>
      <Tab.Container id="list-group-tabs">
        <ListGroup className="d-flex justify-content-center flex-column m-2">
          {studentListElements ? studentListElements : "Loading..."}
        </ListGroup>
        <Tab.Content className="m-2">{linkElements}</Tab.Content>
      </Tab.Container>
      <Row className="row-eq-height">
        <Col>{leftComparison}</Col>
        <Col>{rightComparison}</Col>
      </Row>
    </Container>
  );
}

export default PlagiarismResults;
