'use strict';

const Path = require('path');
const https = require('https')
const express = require('express');
var cors = require('cors')
const bodyParser = require("body-parser");

const jwt = require('./lib/jwt')
const api = require('./service/api')
const axios = require('axios')
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.raw({
	type: 'application/jwt'
}));
app.set('etag', false);
app.disable('etag')
app.use(cors())

var app_id;
var tokenOneSignal;
// Route that is called for every contact who reaches the custom split activity
app.post('/activity/execute', (req, res) => {
	console.log('-------------------------------------------------- execute');
    console.log(req.body);
    jwt(req.body,process.env.jwtSecret,(err, decoded) => {
        if (err) {
            console.error(err);
            return res.status(401).end();
        }
        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            let inArguments = decoded.inArguments[0];
            let uuid = inArguments.uuid;
            let titulo = inArguments.titulo;
            let menssagem = inArguments.menssagem;
            let isUuid = uuid == undefined || uuid == "" || uuid == null;
            let isTitulo = titulo == undefined || titulo == "" || titulo == null;
            let isMenssagem = menssagem == undefined || menssagem == "" || menssagem == null;

            //Valida se os atributos obrigatório para envio estam vazios
            if(isUuid || isTitulo || isMenssagem){
                return res.status(400).end();
            }
            sendNotification(inArguments, decoded.activityObjectID);
            return res.send(200, 'Execute');
            }
    })
    
    
});

function sendNotification(inArguments, activityObjectID) {  
  app_id = inArguments.clientSelected.app_id
  tokenOneSignal = inArguments.clientSelected.token
  const uniqueId = `${activityObjectID}${app_id}`
  const {menssagem} = inArguments
  var newMenssagem = menssagem.replace(/dynamic/i,uniqueId)

    let data = JSON.stringify({
        app_id: inArguments.clientSelected.app_id,
        include_player_ids: [inArguments.uuid],
        data: {"foo": "bar"},
        headings: {"en": inArguments.titulo},
        contents: {"en": newMenssagem},
        chrome_web_icon: inArguments.chrome_web_icon,
        chrome_web_image: inArguments.chrome_web_image,
        web_url: inArguments.web_url,
        app_url: inArguments.app_url,
        safari_icon_256_256: inArguments.safari_icon_256_256,
        safari_icon_128_128: inArguments.safari_icon_128_128,
        safari_icon_64_64: inArguments.safari_icon_64_64,
        safari_icon_32_32: inArguments.safari_icon_32_32,
        safari_icon_16_16: inArguments.safari_icon_16_16,
        delayed_option: inArguments.delayed_option
    })

    console.log(data)
    var options = {
        hostname: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${inArguments.clientSelected.token}`
        }
    };
 
    const req = https.request(options, res => {
      
        res.on('data', data => {
            var resposta = JSON.parse(data.toString());
            save({idNotificao: resposta.id, idJornada:activityObjectID, dataCriacao: new Date(),app_id,token:tokenOneSignal});
        })
    })
    

    req.on('error', error => {
        console.log(error);
    })

    req.write(data)
    req.end()
}

async function save(push){
        const token = await axios.post(`${process.env.authUrl}/v2/token`, { // Retrieving of token
          grant_type: 'client_credentials',
          client_id: process.env.clientId,
          client_secret: process.env.clientSecret
        })
        await api.post(`data/v1/async/dataextensions/key:${process.env.externalDEKEY}/rows`,{"items":[push]}, {
            headers: {
              Authorization: `Bearer ${token.data['access_token']}`
            }
          }) 
}

app.get('/envios/:id', async (req, res) => {
    const token = await axios.post(`${process.env.authUrl}/v2/token`, { // Retrieving of token
    grant_type: 'client_credentials',
    client_id: process.env.clientId,
    client_secret: process.env.clientSecret
  })
  const push = await api.get(`data/v1/customobjectdata/key/${process.env.externalDEKEY}/rowset?$filter=idJornada%20=%20'${req.params.id}'`, {
      headers: {
        Authorization: `Bearer ${token.data['access_token']}`
      }
    }) 
    return res.status(200).json({pushs:push.data['items']});
});

app.get('/clientes', async (req, res) => {
  var clientes = [];
  const token = await axios.post(`${process.env.authUrl}/v2/token`, { // Retrieving of token
  grant_type: 'client_credentials',
  client_id: process.env.clientId,
  client_secret: process.env.clientSecret
})

const clients = await api.get(`data/v1/customobjectdata/key/${process.env.clientDEKEY}/rowset`, {
    headers: {
      Authorization: `Bearer ${token.data['access_token']}`
    }
  }) 
  clients.data['items'].map(client => clientes.push(client))
  return res.status(200).json(clientes);
});

app.post('/store/user',async (req,res) => {
  const token = await axios.post(`${process.env.authUrl}/v2/token`, { // Retrieving of token
    grant_type: 'client_credentials',
    client_id: process.env.clientId,
    client_secret: process.env.clientSecret
  })
  const {DEKEY,items} = req.body
  await api.post(`data/v1/async/dataextensions/key:${DEKEY}/rows`,{
    "items":JSON.parse(items)
  }, {
    headers: {
      Authorization: `Bearer ${token.data['access_token']}`
    }
  }) 
  return res.status(200).json('User Inserted')
})
app.put('/update/user/:id',async (req,res) => {
  const token = await axios.post(`${process.env.authUrl}/v2/token`, { // Retrieving of token
    grant_type: 'client_credentials',
    client_id: process.env.clientId,
    client_secret: process.env.clientSecret
  })
  const {id} = req.params
  const {DEKEY,values} = req.body
  
  await api.put(`hub/v1/dataeventsasync/key:${DEKEY}/rows/player_id:${id}`,{
    "values":values
  }, {
    headers: {
      Authorization: `Bearer ${token.data['access_token']}`
    }
  }) 
  return res.status(200).json('User Updated')
})

// Routes for saving, publishing and validating the custom activity. In this case
// nothing is done except decoding the jwt and replying with a success message.
app.post(/\/activity\/(save|publish|validate)/, (req, res) => {
    console.log(req.body);
    return res.status(200).json({success: true});
});

// Serve the custom activity's interface, config, etc.
app.use(express.static(Path.join(__dirname, '..', 'public'),{
    etag:false
}));

// Start the server and listen on the port specified by heroku or defaulting to 12345
app.listen(process.env.PORT || 12345, () => {
	console.log('Service Cloud customsplit backend is now running!');
});