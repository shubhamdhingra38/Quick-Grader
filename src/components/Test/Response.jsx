import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
  questionWithAnswer: {
    background: "white",
    borderRadius: "7px",
    padding: "8px",
  },
  choiceList: {
    background: "red",
  },
  selectedChoice: {
    background: "rgba(255, 0, 0, 0.5)",
  },
  choice: {
    color: "black",
  },
  question: {
    borderBottom: "2px solid grey",
    paddingBottom: "4px",
  },
  gradeButton: {
    marginTop: "15px",
    marginBottom: "10px",
    background: "rgba(0, 100, 0, 0.3)",
    "&:hover": {
      background: "rgba(150, 0, 0, 0.3)",
    },
  },
});

const domain = "http://127.0.0.1:8000/";

const api = {
  quiz_url: domain + "test/quiz/",
  question_url: domain + "test/question/",
  choice_url: domain + "test/choice/",
  // https://localhost:8000/test/response/?quizID=286
  response_url: domain + "test/response/",
  // https://localhost:8000/test/answer/?responseID=36
  answer_url: domain + "test/answer/",
  grade_url: domain + "test/grade/",
};

axios.defaults.xsrfHeaderName = "X-CSRFToken";

function Response(props) {
  const { questions, responseID, choices } = props;
  const [mapQuestionToAnswer, setMapQuestionToAnswer] = useState({});
  const [grade, setGrade] = useState({});
  const classes = useStyles();

  const handleClick = () => {
    console.log("Submitting for grading");
    console.log(grade);
    axios
      .post(
        api.grade_url,
        {
          gradeInfo: grade,
          responseID: responseID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${props.token}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
        props.updateResponse(responseID);
      })
      .catch((err) => console.error(err.response));
  };

  useEffect(() => {
    if (responseID) {
      axios
        .get(api.answer_url + `?responseID=${responseID}`, {
          headers: {
            Authorization: `Token ${props.token}`,
          },
        })
        .then((res) => {
          let answers = res.data;
          answers.forEach((answer) => {
            let qID = answer.question_id;

            setMapQuestionToAnswer((prevState) => ({
              ...prevState,
              [qID]: answer,
            }));
          });
        })
        .catch((err) => console.error(err.response));
    }
  }, [responseID]);

  return (
    <>
      {Object.keys(mapQuestionToAnswer).length == questions.length && (
        <>
          <ListQuestionsAnswers
            questions={questions}
            choicesData={choices}
            mapQuestionToAnswer={mapQuestionToAnswer}
            setGrade={setGrade}
            grade={grade}
          />
          <Grid container item>
            <Grid item xs={10}></Grid>
            <Grid item xs={2}>
              <Button
                onClick={handleClick}
                variant="contained"
                className={classes.gradeButton}
              >
                Grade
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default Response;

function ListQuestionsAnswers({
  questions,
  mapQuestionToAnswer,
  choicesData,
  grade,
  setGrade,
}) {
  useEffect(() => {
    let initState = {};
    //reset initial state
    questions.forEach((question) => {
      if (question.type == 1) {
        let answer = mapQuestionToAnswer[question.id];
        initState[answer.id] = 0;
      }
    });
    setGrade(initState);
  }, [mapQuestionToAnswer]);

  const handleChange = (event) => {
    let qID = event.target.id;
    let val = event.target.value;
    setGrade((prevState) => ({
      ...prevState,
      [qID]: val,
    }));
  };

  let questionAnswers = questions.map((question, index) => {
    let answer = mapQuestionToAnswer[question.id];
    return (
      <Grid key={`$q${question.id}a${answer.id}`} container item spacing={3}>
        <Grid item xs={10}>
          <QuestionWithAnswer
            question={question}
            choicesData={choicesData}
            answer={answer}
            index={index}
          />
        </Grid>
        <Grid item xs={2}>
          Max Marks: {question.maximum_score}
          {question.type == 1 && (
            <TextField
              label="Enter marks"
              id={answer.id.toString()}
              value={grade[question.id]}
              onChange={handleChange}
            />
          )}
        </Grid>
      </Grid>
    );
  });
  return (
    <Grid container direction="column" spacing={2}>
      {questionAnswers}
    </Grid>
  );
}

function QuestionWithAnswer({ question, answer, choicesData, index }) {
  const classes = useStyles();
  return (
    <div className={classes.questionWithAnswer}>
      <Typography paragraph className={classes.question}>
        {index + 1}. {question.problem}
      </Typography>
      {question.type == 2 ? (
        <ChoicesList
          choices={question.choices}
          choicesData={choicesData}
          selectedChoice={answer.choice_id}
        />
      ) : (
        answer.short_ans
      )}
    </div>
  );
}

function ChoicesList({ choices, selectedChoice, choicesData }) {
  const classes = useStyles();
  let choicesList = choices.map((choice, index) => {
    return (
      <ListItem
        divider={index != choices.length - 1}
        className={
          selectedChoice == choice ? classes.selectedChoice : classes.choice
        }
        key={choice}
      >
        <Choice choice={choicesData[choice]} key={choice} />
      </ListItem>
    );
  });
  return <List>{choicesList}</List>;
}

function Choice({ choice }) {
  const classes = useStyles();
  return <ListItemText primary={choice.choice_text}></ListItemText>;
}
