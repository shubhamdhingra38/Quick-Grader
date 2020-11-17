import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Body.css";
import { Link } from "react-router-dom";
import { Alert, Container } from "react-bootstrap";

// axios.defaults.xsrfHeaderName = "X-CSRFToken";
// axios.defaults.xsrfCookieName = "csrftoken";

const api = {
  auth_url: "http://quick-grader.herokuapp.com/auth/user/",
};

function Body(props) {
  // console.log(props);
  // console.log(props.location);
  document.title = "Home";
  const [showAlert, setShowAlert] = useState(0);

  const [welcomeMsg, setWelcomeMsg] = useState({
    loading: true,
    msg: "",
    group: "Unassigned",
  });
  useEffect(() => {
    axios
      .get(api.auth_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        setWelcomeMsg({
          loading: false,
          msg: res.data.username,
          group: res.data.group,
        });
        console.log(res.data);
      })
      .catch((err) => console.log(err.response));
  }, []);

  let btnText =
    welcomeMsg.group == "Unassigned"
      ? "Invalid"
      : welcomeMsg.group == "Faculty"
      ? "Create Test"
      : "Take Test";
  let redirectTo =
    welcomeMsg.group == "Faculty" ? "/create-test" : "/take-test";
  let info = (
    <div>
      <p className="font-cursive">
        Welcome, <b style={{ color: "orange" }}>{welcomeMsg.msg}</b>
      </p>
      <p className="font-cursive">
        You are currently logged in as a:{" "}
        <b className={welcomeMsg.group}>{welcomeMsg.group}</b>
      </p>
      <Link
        to={{
          pathname: redirectTo,
          userDetails: welcomeMsg.msg,
        }}
        className="btn btn-sm btn-dark"
      >
        {btnText}
      </Link>
    </div>
  );
  let msg = welcomeMsg.loading ? (
    <div>
      Loading...
      <img
        style={{ width: "30px" }}
        className="content-image mx-3"
        src={require("./static/images/loading.png")}
      />
    </div>
  ) : (
    info
  );
  let body = props.token ? (
    msg
  ) : (
    <div>
      <div id="container">
        <div id="outer_space">
          <div id="pencil">
            <div id="top"></div>
            <div id="top_border"></div>
            <div id="design">
              <div id="small_design"></div>
              <div id="small_design"></div>
              <div id="small_design"></div>
              <div id="small_design"></div>
            </div>
          </div>
          <div id="bottom">
            <div id="nib"></div>
          </div>
        </div>
        <p style={{ fontSize: "1.8rem" }}>
        Welcome to quickgrader!
      </p>
        <div id="line"></div>
        
      </div>
    </div>
  );

  if (
    showAlert == 0 &&
    props.location.state != null &&
    props.location.state.alertMsg != ""
  ) {
    setShowAlert(1);
  }
  return (
    <Container style={{}}>
      {showAlert == 1 ? (
        <Alert
          className="mt-4 alert-bottom"
          variant="success"
          onClose={() => setShowAlert((prevVal) => prevVal + 1)}
          dismissible
        >
          <p>{props.location.state.alertMsg}</p>
        </Alert>
      ) : null}
      <div className="body-text mt-5" style={{ fontSize: "1.3rem" }}>
        {body}
      </div>
      
    </Container>
  );
}

export default Body;
