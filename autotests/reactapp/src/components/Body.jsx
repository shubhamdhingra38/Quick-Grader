import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Body.css";
import {Link} from "react-router-dom";

axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'


const api = {
    quiz_url: "http://localhost:8000/auth/user/",
    credentials: {
        username: "ateacher2",
        password: "password123@"
    }
}

function Body() {
    document.title = "Home";
    const [welcomeMsg, setWelcomeMsg] = useState({ loading: true, msg: "", group: "Unassigned" });
    useEffect(() => {
        axios.get(api.quiz_url, {
            auth: api.credentials
        }
        ).then(res => {
            setWelcomeMsg({ loading: false, msg: res.data.username, group: res.data.group });
            console.log(res.data);
        });
    }, []);

    let btnText = welcomeMsg.group == "Unassigned" ? "Invalid" : (welcomeMsg.group == "Faculty" ? "Create Test" : "Take Test")
    let redirectTo = welcomeMsg.group == "Faculty" ? "/create-test" : "/take-test";
    let info = <div>
        <p className="font-cursive">Welcome, <b style={{ color: "orange" }}>{welcomeMsg.msg}</b></p>
        <p className="font-cursive">You are currently logged in as a: <b className={welcomeMsg.group}>{welcomeMsg.group}</b></p>
        <Link to={{
                pathname: redirectTo,
                userDetails: welcomeMsg.msg
            }
        } className="btn btn-sm btn-dark">{btnText}</Link>
    </div>
    let msg = welcomeMsg.loading ? <p>Loading...</p> : info;

    return (
        <div className="m-3 body-text">
            {msg}
        </div>
    )
}

export default Body;