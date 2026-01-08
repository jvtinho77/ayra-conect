const wppconnect = require('@wppconnect-team/wppconnect');

let clientInstance = null;

async function initWPP() {
    try {
        clientInstance = await wppconnect.create({
            session: 'sessionName',
            catchQR: (base64Qr, asciiQR) => {
                console.log(asciiQR); // Log QR code in terminal
                const base64Data = base64Qr.replace(/^data:image\/png;base64,/, "");
                require('fs').writeFileSync(require('path').join(__dirname, 'qr.png'), base64Data, 'base64');
                console.log('QR Code saved to backend/qr.png');
            },
            statusFind: (statusSession, session) => {
                console.log('Status Session: ', statusSession);
            },
            headless: true, // true to start without a window
            devtools: false,
            useChrome: true,
            debug: false,
            logQR: true,
            browserArgs: ['--no-sandbox']
        });

        console.log('WPPConnect initialized and logged in!');
    } catch (error) {
        console.error('Error initializing WPPConnect:', error);
    }
}

function getClient() {
    return clientInstance;
}

module.exports = { initWPP, getClient };
