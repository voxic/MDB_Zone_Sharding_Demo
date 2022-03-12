import React from 'react';
import { useRef, useEffect, useState } from 'react'
import { Container,Collapse, Row, Col, Card, Button, Form, Table, Image, InputGroup, FormControl, ButtonGroup, Modal } from 'react-bootstrap';
import { Calculator, Cash, House } from 'react-bootstrap-icons';
import socketIOClient from 'socket.io-client';
import ShardInfo from './components/ShardInfo';


function App() {

  const [configOpen, setConfigOpen] = useState(true);

  const [data, setData] = useState({
    project : "",
    hostname : "xxxx.mongodb.net",
    username : "",
    password : "",
    exDocument1 : generateRandomDomDocument(),
    database : ""
  });

  const [clusterInfo, setClusterInfo] = useState({});
  const [shardInformation, setShardInformation] = useState("");
  const [shardInfoLoaded, setShardInfoLoaded] = useState(false)
  const [isConnected, setIsConnected] = useState(false);

  const [connectButtonStatus, setConnectButtonStatus] = useState(false)
  const [connectButtonText, setConnectButtonStatusText] = useState(()=> {
    return(<span style={{color : "red"}}>All fields are required!</span>)
  })

  const [socketResponse, setSocketResponse] = useState("");
  const [socket, setSocket] = useState("");

  const clusterHostnameRef = useRef();
  const usernameRef = useRef();
  const databaseRef = useRef();
  const passwordRef = useRef();
  const exDocument1Ref = useRef();

  const loadFieldRef = useRef();

  function handleInput(){

    const tempData = {...data}

    // Set all input field refs
    tempData.password = passwordRef.current.value;
    tempData.username = usernameRef.current.value;
    tempData.hostname = clusterHostnameRef.current.value;
    tempData.database = databaseRef.current.value;
    tempData.exDocument1 = JSON.parse(exDocument1Ref.current.value);
    setData(tempData);

  }

  function handleConnectButton(){
    socket.emit("message", {"command" : "connect", "payload" : data})
    setConnectButtonStatusText(()=> {
      return(<span style={{color : "black"}}>Connecting...</span>)
    })    
    setConnectButtonStatus(true)
  }

  function generateRandomDomDocument(){

    const cha = ["f","e","a","x","t","y","w","b"]

    var randomCountry = ""
    if(Math.random() <= 0.6){
      randomCountry = "SE"
    }else {
      randomCountry = "US"
    }
    const randomTrack = "Z1"+cha[Math.floor(Math.random() * (8 - 0) + 0)]+"ieo"+cha[Math.floor(Math.random() * (8 - 0) + 0)]+"pg"+cha[Math.floor(Math.random() * (8 - 0) + 0)]+String(Math.floor(Math.random() * (9999999 - 1111111) + 1111111)+"sdds"+cha[Math.floor(Math.random() * (8 - 0) + 0)]+"sd")
    return(
    {
      "tracking_num": randomTrack,
      "location": randomCountry
    })

  }

  useEffect(()=>{

    const newSocket = socketIOClient("http://localhost:8080")
    setSocket(newSocket)

    newSocket.on("status", (msg) =>{
      setSocketResponse(msg)
    })

    return () => newSocket.disconnect()

  }, [setSocket])


  useEffect(()=>{
    if(isConnected){
      if(clusterInfo.raw){
        var tempData = []
        Object.keys(clusterInfo.raw).map((shard) => {
            tempData.push({
              name: shard.split("/")[0],
              objects: clusterInfo.raw[shard].objects
            })
        })
        console.log(tempData)
        setShardInformation(tempData)
        setShardInfoLoaded(true)
      }
    }
  }, [clusterInfo])

  useEffect(()=>{
    console.log(socketResponse)
    if(socketResponse.status == "Connected"){
      setConnectButtonStatusText(()=> {
        return(<span style={{color : "green"}}>Connected</span>)
      }) 
    }else if(socketResponse.status == "Error"){
      setConnectButtonStatus(false)
      setConnectButtonStatusText(()=> {
        return(<span style={{color : "red"}}>Unable to connect</span>)
      }) 
    }else if(socketResponse.payload){
      console.log(socketResponse.payload)
      setClusterInfo(socketResponse.payload) 
      setIsConnected(true)
    } else {
      console.log(socketResponse)
    }

  }, [socketResponse])

  useEffect(()=>{

    passwordRef.current.value = data.password;
    usernameRef.current.value = data.username;
    clusterHostnameRef.current.value = data.hostname;
    exDocument1Ref.current.value = JSON.stringify(data.exDocument1, null, '\t');

    if(data.hostname != ' ' && data.username != '' && data.password != ''){
      if(!isConnected){
        setConnectButtonStatus(false)
        setConnectButtonStatusText("")
      }

    } else {
      setConnectButtonStatusText(()=> {
        setConnectButtonStatus(true)
        return(<span style={{color : "red"}}>All fields are required!</span>)
      })
    }

  }, [data])

  function handleInsertButton(){

    socket.emit("message", {
      "command" : "insert",
      "payload" : data.exDocument1
    })
    var tempData = {...data}
    tempData.exDocument1 = generateRandomDomDocument()
    setData(tempData)

  }



  return (
      <Container fluid="lg" className="px-4" style={{ marginTop: "50px" }}>
      <Row style={{marginBottom: "10px"}}>
        <Col lg={12} className="text-center">
          <h1><Image src='Icons/Technical_MDB_Sharding3x.png' style={{maxWidth : "150px"}} roundedCircle/> MongoDB Sharding Demo</h1>
        </Col>
      </Row>
      
      <Row style={{marginBottom: "10px"}}>
        <Col lg="12" className="p-2">
            <Card className="shadow-sm">
            <Collapse in={configOpen}>
              <Card.Body>
                <Card.Title><h2><Image src="Icons/Technical_MDB_Server3x.png" style={{maxWidth : "70px"}} fluid/> Connection settings</h2></Card.Title>
                  <Card.Text>
                    Construct the MongoDB connectionstring
                  </Card.Text>
                  
                  <Form>
                    <Form.Group controlId="hostname">
                      <Form.Label>Hostname</Form.Label>
                      <Form.Control ref={clusterHostnameRef}  type="text" placeholder="xxxx.mongodb.net" onBlur={handleInput}/>            
                    </Form.Group>
                    <Form.Group controlId="database">
                      <Form.Label>Database</Form.Label>
                      <Form.Control ref={databaseRef} type="text" placeholder="" onInput={handleInput} />            
                    </Form.Group>                    
                    <Form.Group controlId="username">
                      <Form.Label>Username</Form.Label>
                      <Form.Control ref={usernameRef} type="text" placeholder="" onInput={handleInput} />            
                    </Form.Group>
                    <Form.Group controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control ref={passwordRef} type="password" placeholder="" onInput={handleInput} />            
                    </Form.Group>                                                
                  </Form>
                
                  <Button disabled={connectButtonStatus} onClick={handleConnectButton} variant="success" size="sm">Connect</Button> {connectButtonText}       
              </Card.Body>
              </Collapse>
              <Button onClick={() => setConfigOpen(!configOpen)} variant="secondary" size="lg">Show/Hide config</Button> 
            </Card>
        </Col>
        <Col lg="12" className="p-2">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="text-center"><h2><Image src="Icons/Technical_MDB_DocumentModel3x.png" style={{maxWidth : "70px"}} fluid/> Insert documents</h2></Card.Title>
                <Card.Text>
                  Use buttons below to inser example documents
                </Card.Text>            
                <Form>
                <Form.Group style={{maxWidth: "55%"}} controlId="formBasicEmail">
                    <Form.Label>Example document 1</Form.Label>
                    <Form.Control ref={exDocument1Ref} as="textarea" rows={4} onInput={handleInput} />           
                  </Form.Group>
                  <Button disabled={!connectButtonStatus} onClick={handleInsertButton} style={{marginBottom: "10px"}} variant="success" size="sm">Insert</Button>                                          
                </Form>       
              </Card.Body>
            </Card>
        </Col>           
        <Col lg="12" className="p-2">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title><h2 className="text-center"><Image src='Icons/Technical_MDB_Sharding3x.png' style={{maxWidth : "70px"}} roundedCircle/>Shards</h2></Card.Title>
                <Container fluid="lg" className="px-4" style={{ marginTop: "50px" }}>
                  {
                    shardInfoLoaded ? (
                        <Row>
                          {shardInformation.map((shard) => {
                            return(
                            <Col>
                              <ShardInfo shardData={{name:shard.name, objects: shard.objects}} />
                            </Col>)
                          })}
                      </Row>
                    ) : ''
                  }

                </Container>
                
                
              </Card.Body>
            </Card>
        </Col>        
      </Row>
      </Container>
  );
}

export default App;
