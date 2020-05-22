import React, {useState, useEffect} from "react";
import axios from "axios";
import {Tab, Col, ListGroup, Row, Container} from "react-bootstrap";
import Response from "./Response";
import {Link} from "react-router-dom";


const api = {
    // http://localhost:8000/ml/detect-plagiarism/287 for quiz 287
    plagiarism_detection_url: "http://localhost:8000/ml/detect-plagiarism/",
    response_url: "http://localhost:8000/test/response/",
    credentials: {
        username: "ateacher2",
        password: "password123@"
    }
};

function Similar(props){
    const [similarResponses, setSimilarResponses] = useState();
    console.log(props);
    // console.log(props.responses);
    // useEffect(() => {
        
    // }, []);
    let similarResponseElement = Object.keys(props.similar).map(ele => {
        return (
            <div>
                <Link to= {
                    {
                        pathname: "/dashboard/response/" + ele,
                        matchingResponses: props.similar[ele]
                    }}>{props.responses ? props.responses[ele] : "Loading..."}</Link>
                <br/>
            </div>
        )
    });
    return (
        <div>
            Similar elements here.
            <br/>
            {similarResponseElement}
        </div>
    )
}


function PlagiarismResults({match}){
    const [results, setResults] = useState();
    const [similar, setSimilar] = useState();
    const [responses, setResponses] = useState();

    console.log(similar);
    useEffect(() => {
        axios.get(api.plagiarism_detection_url + match.params.quizID, { auth: api.credentials}).then(res => {
            // console.log(res);
            setResults(res.data);
            Object.keys(res.data).forEach(responseID => {
                axios.get(api.response_url + responseID, { auth: api.credentials}).then(result => {
                    // console.log(result);
                    setResponses(oldValue => {
                        return {...oldValue, [responseID]: result.data.taken_by}
                    });
                }).catch(err => console.log(err.response));
            });
        }).catch(err => console.log(err.response));
    }, []);

    useEffect(() => {
            setSimilar(results);
    }, [results]);

    let linkElements = [];
    // let studentListElements = null;
    let studentListElements = similar ? Object.keys(similar).map((ele, index) => {
        // console.log(ele);
        let matchingResponses = similar[ele];
        console.log(matchingResponses);
        linkElements.push(
            <Tab.Pane eventKey={`#link${index}`}>
                <Similar similar={matchingResponses} responses={responses}/>
            </Tab.Pane>
        );
       return (
        <ListGroup.Item action href={`#link${index}`}
        className={Object.keys(matchingResponses).length >= 1 ? "list-group-item-danger" : "list-group-item-success"}>
            {`${responses ? responses[ele] : "Loading..."} found similar instances ${Object.keys(matchingResponses).length}`}
        </ListGroup.Item>
       ) 
    }) : null;


    // console.log(studentListElements);

    return(
        <Container className="mt-5">
            <Tab.Container id="list-group-tabs">
            <Row>
                <Col sm={4}>
                <ListGroup>
                    {studentListElements ? studentListElements : "Loading..."}
                </ListGroup>
                </Col>
                <Col sm={8}>
                <Tab.Content>
                    {linkElements}
                    {/* <Tab.Pane eventKey="#link1">
                        <p>Something here</p>
                    </Tab.Pane>
                    <Tab.Pane eventKey="#link2">
                        <p>Something else here</p> */}
                    {/* <Sonnet /> */}
                    {/* </Tab.Pane> */}
                </Tab.Content>
                </Col>
            </Row>
            </Tab.Container>
        </Container>
        
    )
}

export default PlagiarismResults;