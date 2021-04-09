import React, { useEffect } from "react";
import Input from "@material-ui/core/Input";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import CameraAltIcon from "@material-ui/icons/CameraAlt";

const useStyles = makeStyles({
  profilePicture: {
    width: "100%",
    height: "100%",
    "&:hover": {
      opacity: "0.5",
    },
  },

  imageOverlay: {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    height: "100%",
    width: "100%",
    opacity: "0",
    transition: "0.5s ease",
    background: "rgba(0, 0, 0, 0.5)",
    borderRadius: "50%",
    border: "3px solid red",
    boxShadow: "0 0 1px 0px red inset, 0 0 1px 1px red",
    "&:hover": {
      opacity: "1",
    },
  },

  imageContainer: {
    width: "150px",
    height: "150px",
    position: "relative",
  },

  overlayIcon: {
    position: "absolute",
    top: "30%",
    left: "15%",
    width: "100px",
    height: "50px",
  },
});

export default function ProfilePicture({
  imageURL,
  setImageURL,
  selectedFile,
  setSelectedFile,
}) {
  const classes = useStyles();
  const handleClick = (event) => {
    //upload profile picture
    let file = event.target.files[0];
    setSelectedFile(file);
    setImageURL(URL.createObjectURL(file));
  };
  return (
    <>
      <label htmlFor="profilePictureFile">
        <input
          accept="image/*"
          id="profilePictureFile"
          multiple
          type="file"
          style={{ display: "none" }}
          onChange={handleClick}
        />
        <div className={classes.imageContainer}>
          {imageURL ? (
            <Avatar className={classes.profilePicture} src={imageURL} />
          ) : (
            <AccountCircleIcon className={classes.profilePicture} />
          )}

          <div className={classes.imageOverlay}>
            <CameraAltIcon color="secondary" className={classes.overlayIcon} />
          </div>
        </div>
      </label>
    </>
  );
}
