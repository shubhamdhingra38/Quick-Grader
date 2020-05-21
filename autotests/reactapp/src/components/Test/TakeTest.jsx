import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TakeTest.css";
import Quiz from "./Quiz";
import {Container, Alert} from "react-bootstrap";


const api = {
    quiz_url: "http://localhost:8000/test/quiz/",
    response_url: "http://localhost:8000/test/response/",
    credentials: {
        username: "ateacher3",
        password: "password123@"
    }
}



function TakeTest() {
    const [status, setStatus] = useState({ code: "", submitted: false });
    const [quizDetail, setQuizDetail] = useState({});
    const [response, setResponse] = useState();
    const [wrongMsg, setWrongMsg] = useState(null);
    const [didMount, setDidMount] = useState(false);


    // can only create one response per test for a student
    const createResponse = () => {
        axios.post(api.response_url, {
            test: status.code
        }, {
            auth: api.credentials
        }).then(res => {
            console.log("created response");
            console.log(res.data);
            setResponse(res.data.id);
        }).then(data => {
            setStatus({ ...status, submitted: true });
        }).catch(err => {
            console.log("HERE");
            setWrongMsg("You have already taken the test.");
        });
    };

    const handleChange = (event) => {
        let value = event.target.value;
        setStatus({ ...status, code: value });
    };

    const handleSubmit = (event) => {
        console.log('A code was submitted');
        event.preventDefault();
        axios.get(api.quiz_url + status.code, {
            auth: api.credentials
        }).then(res => {
            setQuizDetail({ data: res.data });
            // create a new response
            createResponse();
        }).catch(err => {
            setWrongMsg("You probably entered an incorrect code. Try again.");
        });
    };

    useEffect(() => {
        setDidMount(true);
        return () => setDidMount(false);
    }, []);

    if(!didMount)
        return null;
    
    return (
        <Container>

                {status.submitted ? <Quiz {...quizDetail.data} responseId={response}/> :
            <div className="invite-code">
                {wrongMsg ? <Alert className="mt-2" variant="danger" onClose={() => setWrongMsg(false)} dismissible>
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                <p>{wrongMsg}</p>
                </Alert>:null
                }
                <form onSubmit={handleSubmit}>
                    <div className="text-white m-3 form-group">
                        <label className="lead text-success" htmlFor="invitation-code">Invitation Code: </label>
                        <input type="text" id="invitation-code" placeholder="Code here" value={status.code} onChange={handleChange} className="form-control"
                        style={{ width: "300px" }} />
                        <small id="help" className="form-text text-muted">Enter the code shared by the teacher.</small>
                        <button className="btn btn-md btn-success mt-2">Submit</button>
                    </div>
                </form>
            </div>}
        </Container>

    )
}

export default TakeTest;