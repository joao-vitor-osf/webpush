const axios = require('axios')

const api = axios.create({
  baseURL: `${process.env.restUrl}`
})

module.exports = api