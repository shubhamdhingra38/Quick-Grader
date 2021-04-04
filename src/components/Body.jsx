import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Body.css";
import { Link } from "react-router-dom";
import { Container } from "@material-ui/core";

// axios.defaults.xsrfHeaderName = "X-CSRFToken";
// axios.defaults.xsrfCookieName = "csrftoken";
const domain = "http://127.0.0.1:8000/";
const api = {
  auth_url: domain + "auth/user/",
};

function Body(props) {
  document.title = "quickGrader | Home";
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    if (!props.token) {
      return;
    }
    axios
      .get(api.auth_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        setUserInfo(res.data);
      })
      .catch((err) => console.error(err.response));
  }, []);

  return <Container></Container>;
}

export default Body;
