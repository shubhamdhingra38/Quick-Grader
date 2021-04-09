import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Body.css";
import { Container } from "@material-ui/core";
import domain from "../api";

// axios.defaults.xsrfHeaderName = "X-CSRFToken";
// axios.defaults.xsrfCookieName = "csrftoken";
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
