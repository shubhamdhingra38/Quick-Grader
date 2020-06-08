import React from "react";
import './style.css';
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import {Row, Col, Container, Button} from "react-bootstrap";
import { Route, Link } from "react-router-dom";
import GenerateReport from "./GenerateReport";


function Analyze(){
  const data = [
    {x: 0, y: 5},
    {x: 1, y: 5},
    {x: 2, y: 4},
    {x: 3, y: 9},
    {x: 4, y: 1},
    {x: 5, y: 7},
    {x: 6, y: 6},
    {x: 7, y: 3},
    {x: 8, y: 2},
    {x: 9, y: 0}
  ];
  return(
    <Container className="mt-5 d-flex justify-content-around flex-wrap">
          <Button className="m-3">Analyze Responses</Button>
          <Button className="m-3">Analyze Performance</Button>
          <Route path="/dashboard/analyze/generate-report" component={GenerateReport} ></Route>
          <Link to="/dashboard/analyze/generate-report" className="m-3 btn" >Generate Report</Link>
    </Container>

  )

}

export default Analyze;