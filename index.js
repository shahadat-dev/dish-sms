const express = require('express')
const app = express()
const uuid4 = require('uuid4')
const port = 7070


let counter = 0

app.get('/api/sms/', (req, res) => {

  const DT = new Date()
  console.log(DT,req.originalUrl)

  const id = uuid4()
  const mobile = '01717541865'
  const body = 'This is sms number ' + counter++

  console.log(`${id} ${mobile} ${body}`)
  
  res.send(`${id} ${mobile} ${body}`)

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))