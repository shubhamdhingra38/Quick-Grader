import React, { useEffect, useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { makeStyles } from "@material-ui/core/";

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
    background: theme.palette.error.light,
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
  console.log("props", props)
  const [selectedID, setSelectedID] = useState();
  const classes = useStyles();
  const { responses } = props;

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
            <AccountCircleIcon
              style={{
                height: 50,
                width: 50,
                paddingTop: "8px",
              }}
            />
          </Grid>

          <Grid item xs={10}>
            <p>{data.taken_by}</p>
            {data.graded && (
              <p style={{ fontSize: "1.0rem" }}>Score: {data.total_score}</p>
            )}
            {props.plagiarism && PlagiarismStatus(data.id)}
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
