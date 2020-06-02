import React, { useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { Form, Container, ListGroup } from "react-bootstrap";

const api = {
    quiz_url: "http://localhost:8000/test/quiz/",
    question_url: "http://localhost:8000/test/question/",
    answer_url: "http://localhost:8000/test/answer/",
    choice_url: "http://127.0.0.1:8000/test/choice/",
    credentials: {
        username: "ateacher",
        password: "password"
    }
};


function Choices(props) {
    const [selected, setSelected] = useState(-1);

    const handleSelect = (event) => {
        let [id, index] = event.target.id.split('-');
        setSelected(index);
        props.setAnswers(oldState => {
            // let answer = props.choices[index];
            return { ...oldState, [props.id]: [2, id] };
        });
    };

    let choiceElements = props.localChoices.map((ele, index) => {
        let choice = props.globalChoices[ele];
        return (
            <ListGroup.Item key={`${props.id}-${index}`} className={selected == index ? "bg-info" : null}>
                <div className="choice p-1 d-flex" key={`${props.id}-${index}`} >
                    <input type="radio" id={`${ele}-${index}`} name={`choice-${props.id}`}
                        onChange={handleSelect} checked={selected == index} />
                    <label className="pl-3" htmlFor="{`${props.id}-${index}`}">{choice}</label>
                </div>
            </ListGroup.Item>
        )
    });
    return (
        <div>
            {choiceElements}
        </div>
    )
}


function Answer(props) {
    {/* Answer */ }
    return (
        <Container>
            <Form className="short-answer my-3">
                <Form.Group className="answer">
                    <Form.Label>Answer:</Form.Label>
                    <Form.Control className="p-2" value={props.answers[props.id][1]} onChange={props.onChange}
                        as="textarea" rows="3" id={props.id} name="answer" />
                </Form.Group>
            </Form>
        </Container>
    )
}

function Quiz(props) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [choices, setChoices] = useState({});
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState(false);
    const [unmounted, setUnmounted] = useState(false);




    // when student types answer update
    const handleChange = (event) => {
        let value = event.target.value;
        let id = event.target.id;
        setAnswers(oldObj => {
            return { ...oldObj, [id]: [1, value] };
        });
    }

    const getChoices = (data) => {
        let choices = data.choices;
        let promises = [];
        let choiceId;
        for (choiceId in choices) {
            console.log(api.choice_url + choices[choiceId]);
            promises.push(axios.get(api.choice_url + choices[choiceId], { auth: api.credentials }));
                // .then(res => {
                //     choicesInfo.push([data.id, data.choices]);
                // })
                // .catch(err => console.log(err.response));
        }
        Promise.all(promises).then(res =>{
            res.forEach((choice) =>{
                // choices.push([choice.data.id, choice.data.choice_text]);
                setChoices(oldState => {return {
                    ...oldState, [choice.data.id] : choice.data.choice_text
                }});
            });
            // setQuestions(oldArray => [...oldArray, [data, choices]]);
        });
        // console.log(choices);
    };

    // console.log(questions);
    // console.log(choices);

    // get questions initially  
    useEffect(() => {
        if(unmounted)
            return;
        props.questions.forEach((id) => {
            axios.get(api.question_url + id, { auth: api.credentials }
            ).then(res => {
                setQuestions(oldArray => [...oldArray, res.data]);
                setAnswers(oldObj => { return { ...oldObj, [res.data.id]: [0, ""] } });
                if(res.data.type == 2) {
                    getChoices(res.data);
                }
            });
        });
        return () => setUnmounted(true);
    }, []);


    useEffect(() => {
        if(unmounted)
            return;
        if (Object.keys(answers).length == props.questions.length) {
            setLoading(false);
        }
    }, [answers]);

    // quiz is submitted
    const handleSubmit = (event) => {
        if(unmounted)
            return;
        console.log("Submitted form...");
        console.log(answers);
        for (const id in answers) {
            console.log(id);
            let type = answers[id][0];
            let ans = answers[id][1];
            let body;
            if (type == 1) {
                body = {
                    "response_id": props.responseId,
                    "question_id": id,
                    "short_ans": ans,
                    "choice_id": null
                }
            }
            else {
                body = {
                    "response_id": props.responseId,
                    "question_id": id,
                    "short_ans": "",
                    "choice_id": parseInt(ans)
                }
            }

            axios.post(api.answer_url, body,
                { auth: api.credentials })
                .then(res => {
                    console.log(res.statusText);
                })
                .catch(err => console.log(err.response));
        }
        event.preventDefault();
        setRedirect(true);
    }


    let questions_list = questions.map((data, idx) => {
        if (data.type == 1) {
            // Short answer
            return (<li key={data.id} className="my-3 list-group-item list-group-item-secondary">
                <span style={{ fontSize: "1.2em" }}>Question {idx + 1}. {data.problem}</span>
                <Answer onChange={handleChange} answers={answers} id={data.id} /></li>)
        }
        else {
            // MCQ
            return (<li key={data.id} className="my-3 list-group-item list-group-item-secondary">
                <span style={{ fontSize: "1.2em" }}>Question {idx + 1}. {data.problem}</span>
                <Choices globalChoices={choices} localChoices={data.choices} setAnswers={setAnswers} onChange={handleChange} id={data.id} /></li>)
        }
    });


    if (redirect)
        return <Redirect to="/" />

    return (
        <Container className="border test-form mt-5 p-3" style={{ minHeight: "50vh" }}>
            {/* Info about Quiz */}
            <div className="info">
                <h3 className="display-4">{props.title}</h3>
                <p className="lead">{props.description}</p>
                <hr className="info-hr" />
                {/* Questions with input for answer */}
                {loading ? "Loading..." :
                    <div>
                        <ul className="listgroup text-info">
                            {questions_list}
                        </ul>
                        <button onClick={handleSubmit} type="submit"
                            className="btn btn-md btn-warning mb-3">Submit</button>
                    </div>
                }
            </div>
        </Container>
    )
}

export default Quiz;