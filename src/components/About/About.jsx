import React, { useEffect } from "react";
import "./About.css";
import Typography from "@material-ui/core/Typography";

function About(props) {
  document.title = "About - QuickGrader";
  useEffect(() => {
    props.setTitle("About");
  }, []);
  return (
    <>
      <Typography variant="h4">What is quickGrader?</Typography>
      <Typography paragraph>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque adipisci
        at laudantium, ipsum tempora iusto ut unde nulla explicabo placeat
        repudiandae velit rem molestias esse eos. Tenetur laudantium numquam
        maxime?
      </Typography>
    </>
  );
}

export default About;
