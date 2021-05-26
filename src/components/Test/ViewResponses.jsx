import React, { useEffect, useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { makeStyles } from "@material-ui/core/";
import FlagIcon from '@material-ui/icons/Flag';
import { IconButton } from '@material-ui/core';
import domain from "../../api";
import axios from "axios";
import { stripTrailingSlash } from "../Profile/Profile";
import Avatar from "@material-ui/core/Avatar";

const api = {
  plagiarism_set_url: domain + "ml/set-plagiarism/",
  public_profile_url: domain + "auth/view-profile",
};

const useStyles = makeStyles((theme) => ({
  responseItem: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  testInfo: {
    borderRight: "2px solid black",
  },
  selectedResponse: {
    background: theme.palette.success.main,
  },
  selectedResponsePlagiarism: {
    background: 'rgba(0, 0, 0, 0.3)',
  },
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));



export default function ViewResponses(props) {
  const [selectedID, setSelectedID] = useState();
  const classes = useStyles();
  const { responses } = props;
  const [plagiarized, setPlagiarized] = useState(() => {
    let plagiarism = {};
    responses.map((data, index) => {
      if(data.plag){
        plagiarism[data.id] = true;
      } else{
        plagiarism[data.id] = false;
      }
    });
    return plagiarism;
  });
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    responses.forEach((data, index) => {
      if(!userInfo[data.id]){
        axios.get(api.public_profile_url + '?username=' + data.taken_by)
        .then(response => {
          setUserInfo(prevState => ({...prevState, [data.id]: response.data}));
        })
      }
    })
  }, []);

  console.log(userInfo);

  const handleClick = (event, responseID) => {
    props.setResponseID(responseID);
    setSelectedID(responseID);
  };

  // get the responses intially
  useEffect(() => {}, []);

  function PlagiarismStatus(responseID){
    let plagiarismStatus = "No matching responses"
    if(props.plagiarism && props.plagiarismResults){
      if(props.plagiarismResults[responseID]){
        plagiarismStatus = `${Object.keys(props.plagiarismResults[responseID]).length} Matching responses`
      }
    }
    return plagiarismStatus
  }

  const handleFlagClick = (id) => {
    let status = !plagiarized[id];
    axios.post(api.plagiarism_set_url, {
        responseID: id,
        plagiarismStatus: status,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
    }).then(response => console.log(response));
    setPlagiarized(prevState => ({
      ...prevState, [id]: !prevState[id]
    }));
  }


  let responseElements = responses.map((data, index) => {
    return (
      <ListItem
        divider={index == responses.length - 1 ? false : true}
        key={data.id}
        className={
          selectedID == data.id
            ? (props.plagiarism ? classes.selectedResponsePlagiarism : classes.selectedResponse)
            : classes.responseItem
        }
        onClick={(e) => {
          handleClick(e, data.id);
        }}
      >
        <Grid container>
          <Grid item xs={2}>
            {userInfo[data.id] && userInfo[data.id].image ?   <Avatar
            style={{
              width: 50,
              height: 50,
              marginTop: "4px",
            }}
            src={stripTrailingSlash(domain) + userInfo[data.id].image}
          />
            :
            <AccountCircleIcon
              style={{
                height: 50,
                width: 50,
                marginTop: "4px",
              }}
            />}

          </Grid>

          <Grid item xs={8}>
            <p>{data.taken_by}</p>
            {data.graded && (
              <p style={{ fontSize: "1.0rem" }}>Score: {data.total_score}</p>
            )}
            {props.plagiarism && PlagiarismStatus(data.id)}
            
          </Grid>

          <Grid item xs={2}>
          {props.plagiarism ? (
              plagiarized[data.id] ?
              <IconButton onClick={() => handleFlagClick(data.id)} aria-label="flag">
                <FlagIcon fontSize='large' style={{color: 'firebrick'}}/>
              </IconButton> :
              <IconButton onClick={() => handleFlagClick(data.id)} aria-label="unflag">
                <FlagIcon fontSize='large'/>
              </IconButton>
            ) : null}
          </Grid>
          
        </Grid>
      </ListItem>
    );
  });

  return (
    <List disablePadding className={classes.root} style={props.plagiarism ? {border: "2px solid black"} : null}>
      {responseElements}
    </List>
  );
}
