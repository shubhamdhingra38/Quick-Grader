import React, { useEffect } from "react";
import Input from "@material-ui/core/Input";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ProfilePicture from "./ProfilePicture";
import domain from "../../api";

const api = {
  profile_url: domain + "auth/profile/",
};

const useStyles = makeStyles({});

export function stripTrailingSlash(str) {
  if (str.substr(-1) === "/") {
    return str.substr(0, str.length - 1);
  }
  return str;
}

export default function Profile(props) {
  useEffect(() => {
    props.setTitle("Account - Update your Profile");
  }, []);

  const classes = useStyles();
  const [userInfo, setUserInfo] = React.useState({
    loaded: false,
    firstname: "",
    lastname: "",
  });
  const [imageURL, setImageURL] = React.useState();
  const [selectedFile, setSelectedFile] = React.useState();

  const handleChange = (event) => {
    let name = event.target.id;
    let value = event.target.value;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Updating data");

    let formData = new FormData();
    Object.keys(userInfo).forEach((key, index) => {
      if (key == "image") {
        return;
      }
      formData.append(key, userInfo[key]);
    });
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    fetch(api.profile_url, {
      method: "put",
      headers: {
        Authorization: `Token ${props.token}`,
      },
      body: formData,
    })
      .then((result) => result.json())
      .then((result) => console.log(result));
  };

  const gender = [
    {
      value: "M",
      label: "Male",
    },
    {
      value: "F",
      label: "Female",
    },
  ];

  React.useEffect(() => {
    if (props.token) {
      fetch(api.profile_url, {
        method: "get",
        headers: {
          Authorization: `Token ${props.token}`,
        },
      })
        .then((result) => result.json())
        .then((result) => {
          console.log(result);
          setUserInfo({ loaded: true, ...result });
          if (result.image) {
            setImageURL(stripTrailingSlash(domain) + result.image);
          }
        });
    }
  }, [props.token]);

  const informationSection = userInfo.loaded ? (
    <form className={classes.form} noValidate autoComplete="off">
      <Grid container spacing={2}>
        <Grid container item direction="column" sm={12} md={4}>
          <Grid item xs={4}>
            <ProfilePicture
              imageURL={imageURL}
              setImageURL={setImageURL}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </Grid>

          <Grid item>
            <TextField
              id="desc"
              label="Description"
              multiline
              value={userInfo.desc}
              onChange={handleChange}
              rows={2}
              fullWidth={true}
              placeholder="A little bit about yourself"
              className={classes.profileInputElement}
              InputProps={{
                className: classes.formInput,
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.formLabels,
              }}
            />
          </Grid>
        </Grid>

        <Grid container item sm={12} md={8} spacing={3}>
          <Grid item xs={5}>
            <TextField
              id="firstname"
              key="firstname"
              label="First Name"
              value={userInfo.firstname}
              onChange={handleChange}
              className={classes.profileInputElement}
              InputProps={{
                className: classes.formInput,
              }}
              InputLabelProps={{ className: classes.formLabels }}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              id="lastname"
              key="lastname"
              label="Last Name"
              value={userInfo.lastname}
              onChange={handleChange}
              className={classes.profileInputElement}
              InputProps={{
                className: classes.formInput,
              }}
              InputLabelProps={{ className: classes.formLabels }}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              id="gender"
              select
              label="Gender"
              onChange={handleChange}
              SelectProps={{
                native: true,
                className: classes.selectInput,
              }}
              InputLabelProps={{
                className: classes.formLabels,
              }}
            >
              {gender.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={5}>
            <TextField
              id="dob"
              label="Birthday"
              type="date"
              value={userInfo.dob}
              onChange={handleChange}
              className={classes.profileInputElement}
              InputProps={{
                className: classes.formInput,
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.formLabels,
              }}
            />
          </Grid>
        </Grid>
        <Button color="primary" onClick={handleSubmit}>
          Update
        </Button>
      </Grid>
    </form>
  ) : (
    <p>Loading information...</p>
  );

  return (
    <Container className={classes.body}>
      <Typography color="secondary">
        Here, you can update your account information
      </Typography>
      <br />
      {informationSection}
    </Container>
  );
}
