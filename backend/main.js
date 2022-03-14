const {MongoClient} = require("mongodb")
var express = require('express')
var app = express()
var cors = require("cors")

app.use(express.static('public/'));
const server = require("http").Server(app)
const io = require("socket.io")(server, {cors : { origin: "http://localhost:3000", methods : ["GET", "POST"]}})

var username = ""
var password = ""
var databaseName = ""

// Set at runtime by user
var uri = "";


var client = ''

async function fetchClusterData() {
  try {
    await client.connect();

    const db = client.db(databaseName);
    // find the storage statistics database using the 'dbStats' command
    const result = await db.command({
      dbStats: 1,
    });
    console.log(result);
    io.emit("status", {"status" : "Connected"})
    io.emit("status", {"payload" : result})
  } catch {
    io.emit("status", {"status" : "Error"})


  }
}

async function insertDoc(doc) {
  try {
    await client.connect();
    const database = client.db(databaseName);
    const demo_data = database.collection("demo_data");

    const result = await demo_data.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    setTimeout(()=>{
      fetchClusterData()
    }, 100)
  }
}


io.on('connection', function (socket) {
  console.log("Socket.io up")
  socket.emit("status", "Connected to backend")
  socket.on('message', (msg) =>{
    if(msg.command == "connect"){
      username = msg.payload.username
      password = msg.payload.password
      databaseName = msg.payload.database
      hostname = msg.payload.hostname
      uri = `mongodb+srv://${username}:${password}@${hostname}?retryWrites=true&w=majority`;
      client = new MongoClient(uri);
      fetchClusterData().catch(console.dir);
    } else if (msg.command == "insert") {
        insertDoc(msg.payload)
    }    
  })
})

app.get('*', (req,res) => {
  res.sendFile('public/index.html');
});



server.listen(8080)
console.log("Server running on 8080")
