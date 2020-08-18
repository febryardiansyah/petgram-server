module.exports = {
    baseUrl : process.env.MODE === 'PRODUCTION'
    ? 'https://petgram-server.herokuapp.com/': 'http://localhost:3000/',
}