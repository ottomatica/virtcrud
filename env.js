

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
            return getDefaultInterface();
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
        for (var devName in os.networkInterfaces()) {
            var iface = interfaces[devName];
        
            for (var i = 0; i < iface.length; i++) {
              var alias = iface[i];
              if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                //return alias.address;
                return devName;
            }
          }
      }
}

module.exports = new Env();