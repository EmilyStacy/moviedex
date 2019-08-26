require('dotenv').config(); 
const cors = require('cors'); 
const express = require('express');
const morgan = require('morgan');
const app = express();
const movieData = require('./movies-data.json');
const morganSetting = process.env.NODE_ENV === 'production'?'tiny':'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(function validateBearerToken(req,res,next){
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    if(!authToken || (authToken.split(' ')[1] !== apiToken)) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
}) 

app.get('/movie',function getMovie(req,res) {
    let response = movieData;
    //question:I wanted to ban empty string but it didn't work and caused problems
    // if(req.query.genre= '' && typeof req.query.genre === "string"){
    //     return res
    //         .status(400)
    //         .send('the genre query cannot be empty')
    // }
    if(req.query.genre) {
         response = response.filter(movie => {
            return movie.genre.toLowerCase().includes(req.query.genre.toLowerCase());
        })
    }
    
    if(req.query.country) {
         response = response.filter(movie => {
             return movie.country.replace(/\s+/, "").toLowerCase() === req.query.country.toLowerCase();
        })
       
    }
    if(req.query.avg_vote) {
        const numQuery = Number(req.query.avg_vote);
         response = response.filter(movie => {
            return Number(movie.avg_vote) >= numQuery}).sort((left,right)=> left.avg_vote > right.avg_vote);
        // filterning doesn't work:response.sort((a,b) =>
        //        {
        //         return a.avg_vote - b.avg_vote;
        //     } );
}
    res.json(response);
})

app.use((error,req,res,next)=> {
    if(process.env.NODE.ENV === 'production') {
        response = {error:{message:"server error"}}
    }else {
        response = {error}
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=> {
    console.log('server starts');
    // console.log(`Server listening at http://localhost:${PORT}`);
})