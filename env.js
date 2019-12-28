

const os = require('os');
const fs = require('fs');
const path = require('path');

class Env {
    constructor() {
    }

    defaultNetworkInterface()
    {
        if( process.platform === 'win32' )
        {
            return 'Local Area Connection';
        }
        else if( process.platform === 'darwin' )
        {
            return 'en0';
        }
        else
        {
            return 'eth0'
        }
    }
}

module.exports = new Env();