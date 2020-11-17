import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Button, Container } from "react-bootstrap";
import { useHistory, Redirect } from "react-router-dom";

// const api = {
//   quiz_url: "http://localhost:8000/test/quiz/",
//   question_url: "http://localhost:8000/test/question/",
//   choice_url: "http://localhost:8000/test/choice/",
//   // http://localhost:8000/test/response/?quizID=286
//   response_url: "http://localhost:8000/test/response/",
//   // http://localhost:8000/test/answer/?responseID=36
//   answer_url: "http://localhost:8000/test/answer/",
//   grade_url: "http://localhost:8000/test/grade/",
//   grade_others_url: "http://localhost:8000/ml/grade-others/",
//   // http://localhost:8000/ml/semi-auto-grader/314
//   semi_grade_url: "http://localhost:8000/ml/semi-auto-grader/",
// };

// axios.defaults.xsrfHeaderName = "X-CSRFToken";

function AutoGrade(props) {
  document.title = "Auto Grade";

  // //   console.log(props.match.params.quizID);
  // const [questions, setQuestions] = useState([]);
  // const [answers, setAnswers] = useState({});
  // const [marks, setMarks] = useState({});
  // const [questionAnswerMapping, setQuestionAnswerMapping] = useState();
  // const [errorMsg, setErrorMsg] = useState([]);
  // const [redirect, setRedirect] = useState("");
  // let history = useHistory();

  //   console.log(marks);
  // console.log(questions);
  // console.log(answers);
  // console.log(questionAnswerMapping);

//   useEffect(() => {
//     axios
//       .get(api.semi_grade_url + props.match.params.quizID, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Token ${props.token}`,
//         },
//       })
//       .then((res) => {
//         console.log(res);
//         let data = res.data;
//         setQuestionAnswerMapping(data);
//         for (let q_id in data) {
//           axios
//             .get(api.question_url + q_id + "/", {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Token ${props.token}`,
//               },
//             })
//             .then((res) => {
//               console.log(res);
//               setQuestions((oldState) => {
//                 return [...oldState, res.data];
//               });
//             })
//             .catch((err) => console.log(err.response));
//           let answer_ids = data[q_id];
//           answer_ids.forEach((id) => {
//             axios
//               .get(api.answer_url + id + "/", {
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Token ${props.token}`,
//                 },
//               })
//               .then((res) => {
//                 // console.log(res);
//                 setAnswers((oldState) => {
//                   return { ...oldState, [id]: res.data };
//                 });
//               })
//               .catch((err) => {
//                 console.log(err.response);
//               });
//           });
//         }
//       })
//       .catch((err) => {
//         console.log(err.response);
//         if (err.response.status == 400)
//           setErrorMsg((oldMsg) => oldMsg.concat([err.response.data.message]));
//       });
//   }, []);

//   const handleChange = (event) => {
//     // console.log("changed");
//     let val = event.target.value;
//     let id = event.target.id;
//     setMarks((oldMarks) => {
//       return { ...oldMarks, [id]: val };
//     });
//   };

//   const handleSubmit = () => {
//     // console.log("submitted");
//     let promises = [];
//     Object.keys(answers).forEach((key) => {
//       promises.push(
//         axios.post(
//           api.grade_url,
//           {
//             answerID: key,
//             grade: marks[key],
//             type: 2,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Token ${props.token}`,
//             },
//           }
//         )
//       );
//     });
//     Promise.all(promises)
//       .then((res) => {
//         console.log("done here");
//         axios
//           .get(api.grade_others_url + props.match.params.quizID, {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Token ${props.token}`,
//             },
//           })
//           .then((res) => {
//             console.log(res);
//             // history.goBack();
//             setRedirect("/dashboard");
//           })
//           .catch((err) => console.log(err.response));
//       })
//       .catch((err) => console.log(err));
//   };

//   let alertElements = errorMsg.map((ele, index) => {
//     return <li key={index}>{ele}</li>;
//   });

//   let alert =
//     errorMsg.length > 0 ? (
//       <Alert
//         variant="danger"
//         onClose={() => {
//           setErrorMsg([]);
//         }}
//         dismissible
//       >
//         <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
//         <ul>{alertElements}</ul>
//       </Alert>
//     ) : null;

//   let questionElements = questions.map((data, idx) => {
//     let answerIDs = questionAnswerMapping[data.id];
//     let answerElements = answerIDs.map((id) => {
//       return (
//         <div className="answer mt-3" key={id}>
//           <p>Answer: {answers[id] ? answers[id].short_ans : "Loading..."}</p>
//           <div className="max-score mt-2">
//             <label htmlFor={id}>Marks:</label>
//             <input
//               autoComplete="off"
//               id={id}
//               value={marks[id] || ""}
//               onChange={handleChange}
//               className="ml-1"
//               style={{ width: "33px" }}
//               type="text"
//               name="score"
//             />
//             <label htmlFor={id}>/{data.maximum_score}</label>
//           </div>
//           <hr className="info-hr" />
//         </div>
//       );
//     });
//     return (
//       <div
//         className="response"
//         className="my-3 list-group-item list-group-item-secondary"
//         key={data.id}
//         style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
//       >
//         <p key={data.id}>
//           <span style={{ fontSize: "1.2em" }}>
//             Question {idx + 1}. {data.problem}
//           </span>
//         </p>
//         <hr className="info-hr" />
//         {answerElements}
//       </div>
//     );
//   });

//   if (redirect != "") {
//     return (
//       <Redirect
//         to={{
//           pathname: "/dashboard",
//           state: {
//             alertMsg: "Successfully graded every response using AutoGrade",
//           },
//         }}
//       />
//     );
//   }

//   return (
//     <Container>
//       {/* Error messages */}
//       {alert}
//       <p className="mt-3" style={{ fontSize: "1.2rem" }}>
//         The AI algorithm has assigned students in clusters for each answer. By
//         grading a few instances of the cluster, other students belonging to that
//         cluster are graded automatically.
//       </p>
//       <br />
//       <br />
//       <div style={{position: "relative"}}>
//         {questionElements.length > 0 ? (
//           <>
//             {questionElements}
//             <Button
//               onClick={handleSubmit}
//               className="btn btn-sm btn-success"
//               style={{ position: "absolute", right: "0px", marginLeft: "25px" }}
//             >
//               Submit
//             </Button>
//           </>
//         ) : errorMsg.length == 0 ? (
//           "Loading..."
//         ) : null}
//       </div>
//     </Container>
//   );
  return (
    <Container>
      <p className="display-4">Unavailable</p>
      <p className="lead">
        All ML endpoints are unavailable due to Heroku's limited slug size which is exhausted by installing ML libraries.
      </p>
      
      <p className="lead">
      Checkout the <a href="https://github.com/shubhamdhingra38/Quick-Grader">GitHub repository</a> for a quick overview of these features.
      </p>
    </Container>
  )
}

export default AutoGrade;
