

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
            return this.getDefaultInterface();
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

    getDefaultInterface() {
        const si = require('systeminformation');
            
        for( let interface of si.networkInterfaces() )
        {
            if( interface.virtual == false && interface.internal == false && interface.ip4 ){
                return interface.ifaceName;
            }                
        }
        return "Not Found";
      }
}

module.exports = new Env();