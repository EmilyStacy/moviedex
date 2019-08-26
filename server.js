require('dotenv').config(); 
const cors = require('cors'); 
const express = require('express');
const morgan = require('morgan');
const app = express();
const movieData = require('./movies-data.json');
app.use(morgan('dev'));
app.use(cors());
app.use(function validateBearerToken(req,res,next){
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    console.log('authToken is', authToken.split(' ')[1]);
    console.log('api Token is', apiToken)
    if(!authToken || (authToken.split(' ')[1] !== apiToken)) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
}) 
app.get('/movie',function getMovie(req,res) {
    // res.json(movieData);
    // const {genre,country,avg_note} = req.query;=> cause error: assignment to constant variable. why?
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

const PORT = 8000;
app.listen(PORT,()=> {
    console.log(`Server listening at http://localhost:${PORT}`);
})