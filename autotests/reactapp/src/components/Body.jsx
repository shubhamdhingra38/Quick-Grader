import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Body.css";
import { Link } from "react-router-dom";

// axios.defaults.xsrfHeaderName = "X-CSRFToken";
// axios.defaults.xsrfCookieName = "csrftoken";

const api = {
  auth_url: "http://localhost:8000/auth/user/",
};

function Body(props) {
  // console.log(props);
  document.title = "Home";

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
  let body = props.token ? msg : <div>Welcome to quickgrader!</div>;

  return <div className="body-text mt-5">{body}</div>;
}

export default Body;
