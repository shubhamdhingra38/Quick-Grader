import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { makeStyles } from "@material-ui/core/";
import Response from "./Response";

const useStyles = makeStyles({
  responseItem: {
    color: "white",
    background: "rgb(50, 50, 50) !important",
    "&:hover": {
      cursor: "pointer",
    },
  },
  testInfo: {
    borderRight: "2px solid black",
  },
  selectedResponse: {
    color: "white",
    background: "darkgreen !important",
  },
});

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const domain = "http://127.0.0.1:8000/";

const api = {
  quiz_url: domain + "test/quiz/",
  my_tests_url: domain + "test/mytests/",
  question_url: domain + "test/question/",
  lock_unlock_quiz_url: domain + "test/quiz/lock/",
  choice_url: domain + "test/choice/",
  // http://localhost:8000/test/response/?quizID=286
  response_url: domain + "test/response/",
  // http://localhost:8000/test/answer/?responseID=36
  answer_url: domain + "test/answer/",
};

function ViewResponses(props) {
  const [responses, setResponses] = useState([]);
  const [selectedID, setSelectedID] = useState();
  const classes = useStyles();

  const handleClick = (event, responseID) => {
    props.setResponseID(responseID);
    setSelectedID(responseID);
  };

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
        setResponses(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  let responseElements = responses.map((data, index) => {
    return (
      <ListItem
        key={data.id}
        onClick={(e) => {
          handleClick(e, data.id);
        }}
        className={
          data.id == selectedID
            ? classes.selectedResponse
            : classes.responseItem
        }
        style={{ backgroundColor: "black", width: "80%" }}
      >
        <div>
          <p>{data.taken_by}</p>
          {data.graded && (
            <p style={{ fontSize: "1.0rem" }}>Score: {data.total_score}</p>
          )}
        </div>
      </ListItem>
    );
  });

  return <List>{responseElements}</List>;
}

// display a single Test
function Test(props) {
  const [lockStatus, setLockStatus] = useState(false);
  const [questions, setQuestions] = useState(() => {
    return [];
  });
  const [choices, setChoices] = useState(() => {
    return {};
  });

  const [selectedResponseID, setSelectedResponseID] = useState();
  const classes = useStyles();

  // console.log(questions);

  // get all the questions for the currenttest
  useEffect(() => {
    setLockStatus(props.data.locked);
    if (questions.length > 0) return;
    // console.log("making requests");
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
      <Grid container spacing={4}>
        <Grid
          container
          item
          direction="column"
          xs={12}
          md={4}
          className={classes.testInfo}
        >
          <Grid item>
            <h3>{props.data.title}</h3>
          </Grid>
          <Grid item>
            <p>{props.data.description}</p>
          </Grid>
          <Grid container item>
            <Grid item xs={6}>
              <p>{props.data.code}</p>
            </Grid>
            <Grid item xs={6}>
              <Button
                onClick={() => {
                  console.log("code", props.data.code, "copied");
                  navigator.clipboard.writeText(props.data.code);
                }}
              >
                Copy
              </Button>
            </Grid>
          </Grid>

          <Grid container item direction="column">
            <Grid item>
              <Typography variant="h6">Responses</Typography>
              <p style={{ fontSize: "0.8rem" }}>
                Click the responses to grade them manually.
              </p>
            </Grid>
            <Grid item>
              <ViewResponses
                setResponseID={setSelectedResponseID}
                id={props.data.id}
                questions={questions}
                token={props.token}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Response
            choices={choices}
            questions={questions}
            responseID={selectedResponseID}
            token={props.token}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

function ShowTests(props) {
  let testElements = props.data.map((data) => {
    return (
      <div key={data.id}>
        <Test data={data} key={data.id} token={props.token} />
        <Divider />
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
    <div
      className={"body-text text-center mt-5"}
      style={{ fontSize: "2.5rem" }}
    >
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
