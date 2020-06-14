import React from "react";
import "./About.css";
import {Container} from "react-bootstrap";

function About(props){
    document.title = "About";
    return (
        <Container  className="body-text" style={{fontSize: "1.5rem"}}>
          <p className={" font-cursive mt-3"}>
             This project aims to provide an <span style={{color: "red"}}>automated</span> manner in which students can be evaluated. Inspired by the need of
          a <span style={{color: "red"}}> simplistic platform</span> which can be used for academic purpose during the pandemic.
          </p>
         <p className={" font-cursive "}>
           Through use of Artificial Intelligence, two key features are included.
         </p>
           <ul className={"font-cursive", "ml-3"}>
             <li>
               Plagiarism Detection
             </li>
             <li>
               Auto Grading
             </li>
           </ul>
          <div className={"font-cursive row"}>
            <img className={"col-md-4 col-sm-12 img-fluid"}  src={require("../static/images/cluster.png")} alt="Cluster"/>
            <div className={"col-md-8"}>
              <p className={"mt-3 m-3"}><span style={{color: "green"}}>Hierarchical Clustering</span> is used for grouping together of answers submitted
              by the students. This enables the teacher to only manually grade a few points in the cluster (around the center) and other points belonging to that cluster
              can be graded through the score assigned to the nearest point.</p>
              <p className={"mt-3 m-3"}>Content Similarity is done by use of pre-trained sentence embedding model called <span style={{color: "green"}}>Universal Sentence Encoder </span> - by Google.</p>
            </div>
          <br/>
          </div>
          <div className={"font-cursive row"}>
            <div className={"col-md-8"}>
              <p className={"mt-3 m-3"}>Cosine similarity is used as a metric for the degree of similarity. For plagiarism detection, traditional NLP approaches are used
                such as Preprocessing and Tokenization (Bag of Words), Stemming, Lemmatization and POS tagging along with removal of StopWords.</p>
            </div>
            <img className={"col-md-4 col-sm-12 img-fluid"}  src={require("../static/images/cosine.png")} alt="Cluster"/>
          </div>
          <br/>


          Get source code at:
          <a href={"https://github.com/shubhamdhingra38/"}> https://github.com/shubhamdhingra38/</a>

        </Container>
    )
};

export default About;