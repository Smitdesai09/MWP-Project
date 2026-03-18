const mongoose = require('mongoose')

const connection = () =>{
    mongoose.connect(process.env.MY_URI)
    .then(()=>{
        console.log('MongoDb Is Running..');
    })
    .catch((err)=>{
        console.error(err);
        process.exit(1)
    })
}

module.exports = connection;