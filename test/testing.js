// import {initialize, participate} from '../dist/ravjs.js';
import {initialize, participate} from '../src/index.js';
import 'process';


// participate()

let socket = initialize({
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjcyMjgwMjkxLCJpYXQiOjE2Njk2NTIyOTEsImp0aSI6IjQwYTMzNTJiNWJjNjQ3MjNiNzEyZGY2ODhlZWM3YTEwIiwidXNlcl9pZCI6IjM0NTQxNTkyMjkifQ.yZRX4viMeafu60JREb91HBlCyLaliOvNvvLG4Scq1hw',
    ravenverse_host: 'xyz.com:8081'
})

process.on('exit',() => {
    socket.disconnect()
    console.log("disconnected")
})