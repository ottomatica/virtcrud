

const os = require('os');
const fs = require('fs');
const path = require('path');

class Env {
    constructor() {
    }

    async defaultNetworkInterface()
    {
        if( process.platform === 'win32' || process.platform === 'linux' )
        {
            return await this.getDefaultInterface();
        }
        else if( process.platform === 'darwin' )
        {
            return 'en0';
        }
    }

    async getDefaultInterface() {
        const si = require('systeminformation');
            
        let interfaces = await si.networkInterfaces();
        for( var iFace of interfaces )
        {
            if( iFace.virtual == false && iFace.internal == false && iFace.ip4 ){
                return iFace.ifaceName;
            }                
        }
        return "Not Found";
      }
}

module.exports = new Env();