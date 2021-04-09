import React, { useEffect, useState } from "react";
import axios from "axios";
import Test from "../Test/Test";
import Container from "@material-ui/core/Container";
import domain from "../../api";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

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

function ShowTests(props) {
  let testElements = props.data.map((data) => {
    return (
      <div key={data.id}>
        <Test data={data} key={data.id} token={props.token} />
      </div>
    );
  });
  return <Container>{testElements}</Container>;
}

function CreatedTests(props) {
  React.useEffect(() => {
    props.setTitle("Grade Tests [Manually]");
  }, []);
  const [myTests, setMyTests] = useState(null);
  // console.log(myTests);

  // get list of all tests created by the current user
  useEffect(() => {
    if (props.token) {
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
    }
  }, [props.token]);

  return myTests ? (
    <ShowTests data={myTests} token={props.token} />
  ) : (
    <Container
      className={"body-text text-center"}
      style={{ fontSize: "2.5rem" }}
    >
      Loading...
      <img
        style={{ width: "30px" }}
        className="content-image mx-3"
        src={require("../static/images/loading.png")}
      />
    </Container>
  );
}

export default CreatedTests;
