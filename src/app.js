const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSID, authToken);
const https = require('https');

const message =
    'En este momento la parroquia no cuenta con cupos para enfermos';
const url = 'https://www.natividad.org.ar/turnos_enfermos.php';
const userName = 'Nacho';

const intervalID = setInterval(async () => {
    try {
        const result = await makeRequest();
        if (!result.includes(message)) {
            console.log('Notifying user of availablity.');
            clearImmediate(intervalID);
            notifyUser();
        } else {
            console.log(
                `Not available @ ${new Date().toLocaleTimeString()}. Retrying in 1 minute...`
            );
        }
    } catch (error) {
        console.error(error);
    }
}, 60000);

async function makeRequest() {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data = '';

                // A chunk of data has been received.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    resolve(data);
                });
            })
            .on('error', (err) => {
                reject(err.message);
            });
    });
}

function notifyUser() {
    const currentDateTime = new Date();
    client.messages
        .create({
            body: `Hola ${userName}! A las ${currentDateTime.toLocaleTimeString()} del ${currentDateTime.toLocaleDateString()} detecto que hay turnos disponibles en ${url}.`,
            from: '+17622512919',
            to: '+543416956948'
        })
        .then((message) => console.log(message.sid));
}
