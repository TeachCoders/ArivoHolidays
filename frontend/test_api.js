const axios = require('axios');
axios.get('http://localhost:5000/state/1').then(res => console.log(JSON.stringify(res.data, null, 2))).catch(err => console.error(err));
