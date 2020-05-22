import React, {useState, useEffect} from "react";
import axios from "axios";
import {ListGroupItem, ListGroup, Container} from "react-bootstrap";


const api = {
    quiz_url: "http://localhost:8000/test/quiz/",
    question_url: "http://localhost:8000/test/question/",
    choice_url: "http://localhost:8000/test/choice/",
    // http://localhost:8000/test/response/?quizID=286
    response_url: "http://localhost:8000/test/response/",
    // http://localhost:8000/test/answer/?responseID=36
    answer_url: "http://localhost:8000/test/answer/",
    credentials: {
        username: "ateacher2",
        password: "password123@"
    }
};

function Response(props) {
    // console.log(props.location);
    const [answers, setAnswers] = useState([]);
    const [quizInfo, setQuizInfo] = useState();
    const [studentName, setStudentName] = useState("");

    // console.log(answers);

    useEffect(() => {
        axios.get(api.response_url + props.match.params.responseID, { auth: api.credentials }).then(res => {
            // console.log(res);
            setStudentName(res.data.taken_by);
            axios.get(api.quiz_url + res.data.test, { auth : api.credentials}).then(result => {
                // console.log(result);
                setQuizInfo(result.data);
            }).catch(err => console.log(err.response));
        }).catch(err => console.log(err.response));

        axios.get(api.answer_url, {
            auth: api.credentials,
            params: {
                responseID: props.match.params.responseID
            }
        }).then(res => {
            res.data.forEach(ele => {
                setAnswers(oldState => {
                    return {
                        ...oldState, [ele.question_id]: [ele.short_ans, ele.choice_id]
                    };
                });
            });
        }).catch(err => console.log(err.response));
            // res.data.forEach(ele => {
            //     let questionID = ele.question_id;
            //     axios.get(api.question_url + questionID, { auth: api.credentials}).then(result => {
            //        console.log(result); 
            //        setQuestions(oldState => {
            //             return {...oldState, [result.data.id]: [result.data.type, result.data.problem, result.data.choices]};
            //        });
            //     }).catch(err => console.log(err. response));
            // });
            // // setAnswers(res.data);
        // }).catch(err => console.log(err.response));
    }, []);


    return (
        <div>
            { quizInfo ? <Test name={studentName} matchingResponses={props.location.matchingResponses} data={quizInfo} answers={answers}/> : "Loading..." }
        </div>
    )
}

export default Response;



function Test(props) {
    const [questions, setQuestions] = useState([]);
    const [choices, setChoices] = useState({});


    useEffect(() => {
        props.data.questions.forEach((questionID, index) => {
            axios.get(api.question_url + questionID, { auth: api.credentials }).then(res => {
                setQuestions(prevQuestions => {
                    return [...prevQuestions, res.data];
                });
                if (res.data.type == 2) {
                    getChoices(res.data);
                }

            }).catch(err => console.log(err.response));
        });

    }, []);


    const getChoices = (data) => {
        let choices = data.choices;
        let promises = [];
        let choiceId;
        for (choiceId in choices) {
            // console.log(api.choice_url + choices[choiceId]);
            promises.push(axios.get(api.choice_url + choices[choiceId], { auth: api.credentials }));
        }
        Promise.all(promises).then(res => {
            res.forEach((choice) => {
                setChoices(oldState => {
                    return {
                        ...oldState, [choice.data.id]: choice.data
                    }
                });
            });
        });
    };


    let questionElements = questions.map((data, idx) => {
        if (data.type == 1) {
            let id = data.id;
            // Short answer
            let className = "my-3 list-group-item ";
            // console.log(props);
            if(props.matchingResponses)
                className += props.matchingResponses.find(ele => ele == data.id) ? "list-group-item-danger" : "list-group-item-seconday";
            else
                className += "list-group-item-secondary"
            return (<li key={data.id} className={className}>
                <span style={{ fontSize: "1.2em" }}>Question {idx + 1}. {data.problem}</span>
                <div className="answer">
                    <p>
                        Answer: {props.answers[id] ? props.answers[id][0] : ""}
                    </p>
                </div>
            </li>)
        }
        else {
            // MCQ
            let selected = props.answers[data.id] ? props.answers[data.id][1] : null;
            let questionChoices = data.choices.map((choiceID) => {
                return choices[choiceID] ? (
                    <ListGroup.Item key={`${props.data.id}-${choices[choiceID].id}`} className={choiceID == selected ? "bg-success" : null}>
                        <div className="choice p-1" >
                            <p>
                                {choices[choiceID].choice_text}
                            </p>
                        </div>
                    </ListGroup.Item>
                ) : "Loading..."
            });

            return (
                <li key={data.id} className="my-3 list-group-item list-group-item-secondary">
                    <span style={{ fontSize: "1.2em" }}>Question {idx + 1}. {data.problem}</span>
                    <div className="choices">
                        <ul>
                            {questionChoices}
                        </ul>
                    </div>
                </li>
            )

        }
    });

    return (
        <Container>
            <div className="info">
                <h3 className="display-4">{props.data.title}</h3>
                <p className="lead">{props.data.description}</p>
                <p className="text-danger">Taken by: {props.name}</p>
                <hr className="info-hr" />
            </div>
            {questionElements}
        </Container>
    )
}
