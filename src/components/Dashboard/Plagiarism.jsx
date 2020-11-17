import React, { useState } from "react";
import { Container, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

function Plagiarism() {
  document.title = "Plagiarism";

  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);

  const handleChange = (event) => {
    let val = event.target.value;
    setCode(val);
  };

  return (
    <Container>
      {invalid && (
        <Alert variant="danger" dismissible onClose={() => setInvalid(false)}>
          Invalid code!
        </Alert>
      )}


<div className="invitation-code h-100 mt-5">
        <div className="row align-items-center h-100">
          <img
            style={{ width: "60px" }}
            className="content-image mx-3"
            src={require("../static/images/copyright.png")}
          />
          <p className="font-cursive">
          Enter the code quiz code for which you wish to analyze instances of plagiarism:
          </p>
        </div>

        <div className="justify-content-center d-flex">
          <input
            onChange={handleChange}
            type="text"
            value={code}
            name="code"
            id="code"
            className="p-1 code-share mx-3"
            style={{width: "160px"}}
          />
          <Link to={`/dashboard/plagiarism-results/${code}`}>
            <button className="btn btn-sm btn-success" style={{height: "35px"}}>Detect</button>
          </Link>
        </div>
      </div>


    </Container>
  );
}

export default Plagiarism;
