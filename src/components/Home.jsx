import React from "react";
import Typography from "@material-ui/core/Typography";
import domain from "../api";
import axios from "axios";
import './Main.css';
import { Divider } from "@material-ui/core";

const api = {
  logs_url: domain + "test/logs/",
};

function Home(props) {
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    props.setTitle("Home");
   
  }, []);

  React.useEffect(() => {
    if(props.token){
      axios.get(api.logs_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then(response => setLogs(response.data.responses));
    }
  }, [props.token]);

  function Log(log){
    let d = new Date(log.taken_on);
    let date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
    return (
      <div className="log" style={{marginTop: "8px"}}>
        <p><span style={{color: 'firebrick'}}>{log.username}</span> took quiz <b>{log.test}</b> on the date <span style={{color: 'darkred'}}>{date}</span></p>
        <Divider/>
      </div>
    )
  }

  function Logs(){
    let logElements = logs.map((log) =>  Log(log));
    return logElements;
  }

  return (
    <>
      <Typography variant="h4">Hello, welcome to quickGrader!</Typography>
      <br/>
      {props.token && <React.Fragment>
        <p className="text-muted">Here are all the logs of submitted responses</p>
        <Logs/>  
      </React.Fragment>}
      {!props.token && <p className="lead text-muted">
        Use the power of AI for grading of quizzes and plagiarism detection.
        </p>}
     

    </>
  );
}

export default Home;
