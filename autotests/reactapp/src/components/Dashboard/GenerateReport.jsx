import React, { useState } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

const api = {
  // http://localhost:8000/test/report/code/
  report_generation_url: "http://localhost:8000/test/report/",
  credentials: {
    username: "ateacher2",
    password: "password123@",
  },
};

function GenerateReport() {
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);

  // console.log(code);

    const handleChange = (event) => {
      let val = event.target.value;
      setCode(val);
    };

  const handleSubmit = () => {
    axios(
      {
        url: api.report_generation_url + code, //your url
        method: "GET",
        responseType: "blob", // important
      },
      api.credentials
    )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "result.csv"); //or any other extension
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => setInvalid(true));
  };

  return (
    <Container>
      {invalid && <Alert variant="danger" dismissible onClose={() => setInvalid(false)} >Invalid code!</Alert>}

      <div className="invitation-code">
        <p className="font-cursive ">
          Enter the code quiz code for which you wish to download the report:
        </p>
        <div className="code-share">
          <input
            onChange={handleChange}
            type="text"
            value={code}
            name="code"
            id="code"
          />
          <button onClick={handleSubmit} className="btn btn-sm btn-success">
            Download
          </button>
        </div>
      </div>
    </Container>
  );
}
export default GenerateReport;
