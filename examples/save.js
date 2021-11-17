import * as QRCode from "../lib/index.js";
const path = './tmp.png';
QRCode.toFile(path, 'life of the party bros', {
    color: {
        dark: '#00F',
        light: '#0000' // Transparent background
    }
}, function (err) {
    if (err)
        throw err;
    console.log('saved.');
});
