var mongoose = require('mongoose');

const url = "mongodb+srv://root:root@cluster0.nfcca.mongodb.net/E-commerce?retryWrites=true&w=majority"

module.exports.start = function()
{
  mongoose.connect(url).then(function()
  {
    console.log("db is live")
  })
}