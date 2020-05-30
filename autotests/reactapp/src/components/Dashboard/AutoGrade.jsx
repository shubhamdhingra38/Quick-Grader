import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Container } from "react-bootstrap";

const api = {
    quiz_url: "http://localhost:8000/test/quiz/",
    question_url: "http://localhost:8000/test/question/",
    choice_url: "http://localhost:8000/test/choice/",
    // http://localhost:8000/test/response/?quizID=286
    response_url: "http://localhost:8000/test/response/",
    // http://localhost:8000/test/answer/?responseID=36
    answer_url: "http://localhost:8000/test/answer/",
    grade_url: "http://localhost:8000/test/grade/",
    // http://localhost:8000/ml/semi-auto-grader/314
    semi_grade_url: "http://localhost:8000/ml/semi-auto-grader/",
    credentials: {
        username: "ateacher",
        password: "password"
    }
};

function AutoGrade(props) {
    console.log(props.match.params.quizID);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [marks, setMarks] = useState({});
    const [questionAnswerMapping, setQuestionAnswerMapping] = useState();

    console.log(marks);
    // console.log(questions);
    // console.log(answers);
    // console.log(questionAnswerMapping);

    useEffect(() => {
        axios.get(api.semi_grade_url + props.match.params.quizID, { auth: api.credentials }).then(res => {
            console.log(res);
            let data = res.data;
            setQuestionAnswerMapping(data);
            for (let q_id in data) {
                axios.get(api.question_url + q_id, { auth: api.credentials }).then(res => {
                    console.log(res);
                    setQuestions(oldState => {
                        return [...oldState, res.data];
                    });
                }).catch(err => console.log(err.response));
                let answer_ids = data[q_id];
                answer_ids.forEach(id => {
                    axios.get(api.answer_url + id, { auth: api.credentials }).then(res => {
                        console.log(res);
                        setAnswers(oldState => {
                            return { ...oldState, [id]: res.data };
                        });
                    }).catch(err => console.log(err.response));
                });
            }
        }).catch(err => console.log(err.response));
    }, []);

    const handleChange = (event) => {
        console.log("changed");
        let val = event.target.value;
        let id = event.target.id;
        setMarks(oldMarks => {
            return {...oldMarks, [id] : val};
        });
    };

    const handleSubmit = () => {
        console.log("submitted");
        let promises = [];
        Object.keys(answers).forEach(key => {
            promises.push(axios.post(api.grade_url, {
                answerID: key,
                grade: marks[key],
                type: 2
            }, { auth: api.credentials }));
        });
        Promise.all(promises).then(res => {
            axios.post()
        }).catch(err => console.log(err));
    };

    let questionElements = questions.map((data, idx) => {
        let answerIDs = questionAnswerMapping[data.id];
        let answerElements = answerIDs.map(id => {
            return (
                <div className="answer">
                    <p>
                        Answer: {answers[id] ? answers[id].short_ans : "Loading..."}
                    </p>
                    <div className="max-score mt-2">
                        <label htmlFor={id}>Marks:</label>
                        <input id={id} value={marks[id]} onChange={handleChange} className="ml-1" style={{ width: "50px" }} type="text" name="score" />
                        <label htmlFor={id}>/{data.maximum_score}</label>
                    </div>
                </div>
            )
        });
        return (
            <div className="response" className="my-3 list-group-item list-group-item-secondary">
                <li key={data.id}>
                    <span style={{ fontSize: "1.2em" }}>Question {idx + 1}. {data.problem}</span>
                </li>
                {answerElements}
            </div>
        )
    });

    
    return (
        <Container>
            The grade pages
            <br/>
            { questionElements.length > 0 ? questionElements : "Loading..."}
            <br/>
            <Button onClick={handleSubmit} className="btn btn-sm btn-success">Submit</Button>
        </Container>
    )
}


export default AutoGrade;