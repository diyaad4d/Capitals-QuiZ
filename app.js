import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';

const app=express();
const port=3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
dotenv.config();

/* data base */
const db=new pg.Client({
    user:"postgres",
    host: "localhost",
    database: "world",
    password:process.env.DB_PASSWORD,
    port: 5432,
});

db.connect();

let Q=[];
db.query("SELECT * FROM capitals",(err,res)=>{
    if(err)
        console.log("error exuting query",err.stack);
    else
        Q=res.rows;
    db.end();
});

let score=0;
let currentQ={};

app.get('/',async(req,res)=>{
   score=0;
   await nextQ();
   console.log(currentQ);
   res.render('index.ejs',{question:currentQ});
});

app.post('/submit',(req,res)=>{
   let answer=req.body.answer.trim();
   let isCorrect=false;
   if(answer.toLowerCase()===currentQ.capital.toLowerCase()){
       score++;
       isCorrect=true;
       console.log(score);
   }
   nextQ();
   res.render('index.ejs',{
       question:currentQ,
       wasCorrect:isCorrect,
       totalScore:score,
   });
});



async function nextQ(){
    const randomQ=Q[Math.floor(Math.random()*Q.length)];
    currentQ=randomQ;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});