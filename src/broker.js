const mosca = require('mosca');
const http = require('https');
const mqtt = require('mqtt');
// const fs = require("fs");

//Configuracion MQTT
const hostMQTT = 'mqtt://192.168.5.59:1883';
const settings = {port: 1883}

topic1 = 'record';
topic2 = 'add';
topic3 = 'charger';
topic4 = 'perform';
topic5 = 'quality';

//Configuracion HTTP
const hostHTTP = '192.168.5.59';
const portHTTP = 3000;
//Conexion a la API https://4trz3v4f7f.execute-api.us-east-1.amazonaws.com/productive/handlerdata/recordsprocess
const optionsHTTP = {
    hostname: '4trz3v4f7f.execute-api.us-east-1.amazonaws.com', //'192.168.5.59',
    port: 443, //3008,
    path: '/productive/handlerdata/recordsprocess', //'/api/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

console.clear()
const broker = new mosca.Server(settings)

const client = mqtt.connect(hostMQTT);

broker.on('published', (packet)=>{
    message = packet.payload.toString();
    topic = packet.topic.toString();

    console.clear();
    console.log(`MQTT:Desde el topic '${topic}', se envia el mensaje\n${message}`);

    switch(topic){
        case topic1:
            optionsHTTP.path = '/productive/handlerdata/recordsprocess';
            break;
        case topic2:
            optionsHTTP.path = '/productive/handlerdata/addproducto';
            break;
        case topic3:
            optionsHTTP.path = '/productive/handlerdata/chargerawmaterial';
            break;
        case topic4:
            optionsHTTP.path = '/productive/handlerdata/performance';
            break;
        case topic5:
            optionsHTTP.path = '/productive/handlerdata/qualityproduct';
            break;
        default:
            console.log(`\n%c${'El topic es incorrecto'}`, `color:${'red'}`)
    }
})

//HTTP server
const server = http.createServer((req, res) => {
    // console.log('Se ha accedido desde el navegador');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hola mundo')
})

server.listen(portHTTP, hostHTTP, () => {
    console.log('Servidor funcionando en', hostHTTP, portHTTP);

    client.on('message', (topic, message) => {
        data = JSON.parse(message);
        data.topic = topic;
        // console.log(data)

        // fs.writeFile('datos.txt', message, function(err){
        //     if (!err){
        //         console.log('Se ha persistido los datos en datos.txt');
        //     } else {
        //         throw err;
        //     }
        // });
        
        req = http.request(optionsHTTP, res => {
            console.log(`\nHTTP: Status: ${res.statusCode} ${res.statusMessage}`)
             
            res.on('data', d => {
                console.log(`\nAWS responde desde ${optionsHTTP.path}`)
                process.stdout.write(d)
            })
        })
          
        req.on('error', error => {
        console.error(error)
        })
        
        req.write(JSON.stringify(data))
        req.end()
    })

    client.on('connect', ()=>{
        client.subscribe(topic1);
        client.subscribe(topic2);
        client.subscribe(topic3);
        client.subscribe(topic4);
        client.subscribe(topic5);
    })
})