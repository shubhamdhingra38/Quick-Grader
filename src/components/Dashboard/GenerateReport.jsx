import React, { useState } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

const domain = "http://127.0.0.1:8000/";
const api = {
  report_generation_url: domain + "test/report/",
};

function GenerateReport(props) {
  React.useEffect(() => {
    props.setTitle("Download Report");
  }, []);

  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);

  // console.log(code);

  const handleChange = (event) => {
    let val = event.target.value;
    setCode(val);
  };

  const handleSubmit = () => {
    axios({
      url: api.report_generation_url + code + "/",
      method: "GET",
      responseType: "blob", // important
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${props.token}`,
      },
    })
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
      {invalid && (
        <Alert variant="danger" dismissible onClose={() => setInvalid(false)}>
          Invalid code!
        </Alert>
      )}

      <div className="invitation-code h-100 mt-5">
        <div className="row align-items-center h-100">
          <img
            style={{ width: "50px" }}
            className="content-image mx-3"
            src={require("../static/images/csv.png")}
          />
          <p className="font-cursive">
            Enter the code quiz code for which you wish to download the report:
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
            style={{ width: "160px" }}
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
