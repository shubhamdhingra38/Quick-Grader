import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, List, ListItem, Grid } from "@material-ui/core";
import domain from "../../api";
import Response from "../Test/Response.jsx";
import ViewResponses from "../Test/ViewResponses.jsx";
import { makeStyles } from "@material-ui/core/";

const api = {
  quiz_url: domain + "test/quiz/instance/",
  question_url: domain + "test/question/",
  choice_url: domain + "test/choice/",
  // https://localhost:8000/test/response/?quizID=286
  response_url: domain + "test/response/",
  // https://localhost:8000/test/answer/?responseID=36
  answer_url: domain + "test/answer/",
  grade_url: domain + "test/grade/",
  plagiarism_url: domain + "ml/plagiarism-detection/",
};

const useStyles = makeStyles((theme) => ({
  responseItem: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  selectedResponse: {
    background: theme.palette.success.main,
  },
  root: {
    width: "100%",
    maxWidth: 360,
  },
}));

export default function PlagiarismResults(props) {
  const [showResponses, setShowResponses] = useState(false);
  const [code, setCode] = useState();
  const [selectedResponseID, setSelectedResponseID] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);
  const [responses, setResponses] = useState([]);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [compareAgainst, setCompareAgainst] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState({});
  const classes = useStyles();

  useEffect(() => {
    props.setTitle("Plagiarism Detection - Check for copied responses");
  }, []);

  useEffect(() => {
    setCompareAgainst(null);
  }, [selectedResponseID]);

  // get all the questions for the currenttest
  useEffect(() => {
    if (questions.length > 0 || !quizInfo) return;
    quizInfo.questions.forEach((questionID, index) => {
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
  }, [quizInfo]);

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
  const handleChange = (event) => {
    let val = event.target.value;
    setCode(val);
  };

  const handleSubmit = () => {
    axios
      .get(api.quiz_url + code + "/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        setQuizInfo(res.data);
        let quizID = res.data.id;
        axios
          .get(api.response_url, {
            params: {
              quizID: quizID,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${props.token}`,
            },
          })
          .then((res) => {
            setResponses(res.data);
            setShowResponses(true);
          })
          .catch((err) => console.log(err.response));

        let requestBody = {
          quizID: quizID,
          threshold: 0.5,
        };
        axios
          .post(api.plagiarism_url, requestBody, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${props.token}`,
            },
          })
          .then((res) => {
            setPlagiarismResults(res.data);
            console.log(res.data);
          });
      })
      .catch((err) => console.log(err.response));
  };

  const handleClick = (event) => {
    let id = event.target.id;
    setCompareAgainst(id);
  };

  function GetSimilarResponses(responseID) {
    let similarResponses = plagiarismResults[responseID];
    let responsesMap = {};
    responses.forEach((response) => (responsesMap[response.id] = response));
    let similarResponsesList = Object.keys(similarResponses).map(
      (id, index) => {
        return (
          <ListItem
            onClick={handleClick}
            className={classes.responseItem}
            id={id}
            key={id}
            divider={
              index == Object.keys(similarResponses).length - 1 ? false : true
            }
            style={id == compareAgainst ? { background: "#e57373" } : null}
          >
            {responsesMap[id].taken_by}: {similarResponses[id].length} copied
            responses
          </ListItem>
        );
      }
    );
    return similarResponsesList;
  }

  function ShowSimilarResponses(responseID) {
    return (
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <p>Similar responses are (click to compare):</p>
        </Grid>
        <Grid item>
          <List className={classes.root}>
            {GetSimilarResponses(responseID)}
          </List>
        </Grid>
      </Grid>
    );
  }

  return (
    <Container>
      {/* <Test token={props.token}/> */}
      {!showResponses && (
        <div className="invitation-code h-100 mt-5">
          <div className="row align-items-center h-100">
            <img
              style={{ width: "50px" }}
              className="content-image mx-3"
              src={require("../static/images/csv.png")}
            />
            <p className="font-cursive">Enter the code quiz code:</p>
          </div>

          <div className="justify-content-center d-flex">
            <input
              onChange={handleChange}
              type="text"
              value={code}
              name="code"
              id="code"
              className="p-1 code-share mx-3"
              style={{ width: "160px" }}
            />
            <button onClick={handleSubmit} className="btn btn-sm btn-danger">
              Check
            </button>
          </div>
        </div>
      )}
      {showResponses && (
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <p>Responses are:</p>
            <ViewResponses
              setResponseID={setSelectedResponseID}
              responses={responses}
              plagiarism
              token={props.token}
              plagiarismResults={plagiarismResults}
            />
          </Grid>
          <Grid item>
            {selectedResponseID && ShowSimilarResponses(selectedResponseID)}
          </Grid>
          {showResponses && selectedResponseID && (
            <Grid item container>
              <Grid item md={6} xs={12}
               >
                {questions && choices && (
                  <Response
                    plagiarism
                    choices={choices}
                    questions={questions}
                    responseID={selectedResponseID}
                    token={props.token}
                  ></Response>
                )}
              </Grid>
              <Grid item md={6} xs={12}>
                {compareAgainst && questions && choices ? (
                  <Response
                    plagiarism
                    choices={choices}
                    questions={questions}
                    responseID={compareAgainst}
                    token={props.token}
                  ></Response>
                ) : (
                  <p>Click a similar response to compare against</p>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}
