const log = console.log;
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/signup.html")
});

app.post("/", (req,res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    let data = {
      members:[
          {
              merge_fields:{
                  "FNAME":firstName,
                  "LNAME":lastName
              },
              email_address:email,
              status:"subscribed"
          }
      ]
    };

    const jsonData = JSON.stringify(data);

    let options = {
        url: "https://us20.api.mailchimp.com/3.0/lists/755e5160f9",
        method: "POST",
        headers:{
            "Authorization":"microshadow "   // should have API key here
        },                                   // but cannot public to github
        body:jsonData                        // during development, copy the API key from .txt file
    };

    request(options, (err,respond,body) => {
        log(respond.statusCode);
        if(err){
            res.sendFile(__dirname + "/failure.html")
        }else if (respond.statusCode === 200) {
            res.sendFile(__dirname + "/success.html")
        }else {
            res.sendFile(__dirname + "/failure.html")
        }
    })
});

app.post("/failure", (req,res) => {
    res.sendFile(__dirname + "/signup.html")
});

app.post("/success", (req,res) => {
    res.sendFile(__dirname + "/signup.html")
});

app.listen(process.env.PORT || 3000, () => {
    log("server is running on port 3000...")
});