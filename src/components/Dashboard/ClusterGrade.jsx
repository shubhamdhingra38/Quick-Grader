import React, { useState, useEffect } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from '@material-ui/core/TextField'
import axios from "axios";
import domain from "../../api";
import "./ClusterGrade.css";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

const api = {
  clusters_generate_url: domain + "ml/clusters-generate/",
  cluster_grade_url: domain + "ml/cluster-grade/",
  quiz_url: domain + "test/quiz/instance/",
  question_url: domain + "test/question/",
  choice_url: domain + "test/choice/",
  // https://localhost:8000/test/response/?quizID=286
  response_url: domain + "test/response/",
  // https://localhost:8000/test/answer/?responseID=36
  answer_url: domain + "test/answer/",
  grade_url: domain + "test/grade/",
};

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

export default function ClusterGrade(props) {
  useEffect(() => {
    props.setTitle("Cluster Grade");
  }, []);

  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizInfo, setQuizInfo] = useState({});
  const [answerInfo, setAnswerInfo] = useState({});
  const [questionsInfo, setQuestionsInfo] = useState([]);
  const [clusters, setClusters] = useState(null);
  const [gradeInfo, setGradeInfo] = useState({});

  console.log(gradeInfo);

  const handleChange = (event) => {
    let val = event.target.value;
    setCode(val);
  };

  const handleChangeGrade = (event) => {
    let id = event.target.id;
    let val = parseInt(event.target.value);

    setGradeInfo((prevState) => ({
      ...prevState,
      [id]: val,
    }));
  };

  const handleGrade = (event) => {
    let id = event.target.id;
    console.log("grading...");
    let grades = {};
    clusters[id].forEach((answerID) => {
      grades[answerID] = gradeInfo[answerID];
    });
    let requestBody = {
      questionID: id,
      grades: grades,
    };
    console.log("requestBody", requestBody);
    axios
      .post(api.cluster_grade_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => console.log(res));
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
        let requestBody = {
          quizID: res.data.id,
        };

        //get cluster centers
        //{questionID: clusterCenters}
        axios
          .post(api.clusters_generate_url, requestBody, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${props.token}`,
            },
          })
          .then((res) => {
            setClusters(res.data);
            let keys = Object.keys(res.data);
            keys.forEach((questionID) => {
              let answersToGrade = res.data[questionID];
              let promises = [];
              answersToGrade.forEach((answerID) => {
                promises.push(
                  axios.get(api.answer_url + answerID + "/", {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${props.token}`,
                    },
                  })
                );
              });
              Promise.all(promises).then((res) => {
                res.forEach((answer) => {
                  setAnswerInfo((prevState) => ({
                    ...prevState,
                    [answer.data.id]: answer.data,
                  }));
                });
                setShowAnswers(true);
              });
            });
          });
        let questions = res.data.questions;
        let promises = [];
        questions.forEach((questionID) => {
          promises.push(
            axios.get(api.question_url + questionID + "/", {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${props.token}`,
              },
            })
          );
        });
        Promise.all(promises).then((res) => {
          res.forEach((resJson) => {
            if (resJson.data.type === 1) {
              setQuestionsInfo((prevState) => [...prevState, resJson.data]);
            }
          });
          setShowQuiz(true);
        });
      });
  };

  useEffect(() => {
    //when all the questions are loaded
  }, [setShowQuiz]);

  console.log(questionsInfo);

  let questionElements;
  if (showQuiz && showAnswers && clusters) {
    questionElements = questionsInfo.map((question, idx) => {
      if (clusters[question.id]) {
        return (
          <div className="cluster mx-2 my-5">
            <p className="cluster-question-text lead">
              Question{idx + 1}. {question.problem}
            </p>
            <List className="cluster-answers">
              {clusters[question.id].map((answerID, idx) => {
                if (answerInfo[answerID])
                  return (
                    <ListItem className="cluster-answer" divider>
                      <Grid container direction="column">
                        <Grid item>
                          <p className="cluster-answer-text ">
                            Answer {idx + 1}. {answerInfo[answerID].short_ans}
                          </p>
                        </Grid>
                        <Grid item>
                          <TextField
                            label="Score"
                            id={answerID}
                            value={gradeInfo[answerID]}
                            onChange={handleChangeGrade}
                            type="text"
                            placeholder="Marks"
                          />
                        </Grid>
                        <Grid item></Grid>
                      </Grid>
                    </ListItem>
                  );
                else return <div>Loading...</div>;
              })}
              <button
                id={question.id}
                onClick={handleGrade}
                className="btn btn-sm btn-success grade-btn"
              >
                Grade
              </button>
            </List>
          </div>
        );
      } else {
        return <div>Loading...</div>;
      }
    });
  }

  return (
    <Container>
      {!showQuiz && (
        <div className="invitation-code h-100 mt-5">
          <div className="row align-items-center h-100">
            <img
              style={{ width: "50px" }}
              className="content-image mx-3"
              src={require("../static/images/copyright.png")}
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
            <button onClick={handleSubmit} className="btn btn-sm btn-success">
              Load
            </button>
          </div>
        </div>
      )}

      {showQuiz && showAnswers && (
        <div className="test-form my-5 border p-3">
          <Grid container direction="column">
            <p className="display-4">{quizInfo.title}</p>
            <p className="h3">{quizInfo.description}</p>
            <p className="text-muted">Author: {quizInfo.author}</p>

            <Grid item container direction="column">
              <div>{questionElements}</div>
            </Grid>
          </Grid>
        </div>
      )}
    </Container>
  );
}
