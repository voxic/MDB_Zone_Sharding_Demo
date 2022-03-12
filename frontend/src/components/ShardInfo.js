import React from 'react'
import { Row, Col, Card, Image } from 'react-bootstrap';
import { TransitionGroup, CSSTransition } from "react-transition-group";

export default function shardInfo({ shardData }) {
  return (
        <Card className="shadow-sm">
        <Card.Body>
            <Card.Title className="text-center"><Image src='Icons/Technical_MDB_Sharding3x.png' style={{maxWidth : "50px"}} roundedCircle/><h4>{shardData.name}</h4></Card.Title>
            <Card.Text style={{fontSize : "1.5em"}} className="text-center">
                Documents:
                <span>             
            <TransitionGroup component="span" className="count">
              <CSSTransition
                classNames="count"
                key={shardData.objects}
                timeout={{ enter: 500, exit: 500 }}
              >
                <span> {shardData.objects}</span>
              </CSSTransition>
            </TransitionGroup>
            </span>
            </Card.Text>                
        </Card.Body>
    </Card>
  )
}
