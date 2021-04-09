import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";

function Logout(props) {
  const { token, setToken } = props;
  useEffect(() => {
    props.setTitle("Sign Out");
  }, []);
  useEffect(() => {
    if (token) {
      setToken(null);
    }
  }, []);
  if (!token) {
    return (
      <>
        <Typography>You are not logged in!</Typography>
      </>
    );
  }
  return (
    <>
      <Typography>You have been logged out.</Typography>
    </>
  );
}

export default Logout;
