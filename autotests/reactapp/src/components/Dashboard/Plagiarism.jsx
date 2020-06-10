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

      <div className="invitation-code">
        <p className="font-cursive ">
          Enter the code quiz code for which you wish to analyze instances of plagiarism:
        </p>
        <div className="code-share">
          <input
            onChange={handleChange}
            type="text"
            value={code}
            name="code"
            id="code"
            style={{width: "200px"}}
          />
          <Link to={`/dashboard/plagiarism-results/${code}`}>
            Detect
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default Plagiarism;
