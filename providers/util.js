const fs            = require('fs');
const path          = require('path');
const child_process = require('child_process');
const os = require('os');
const chalk         = require('chalk');
const sudo = require('sudo-prompt');
const si = require('systeminformation');

// const Client        = require('ssh2').Client;
// const scp2          = require('scp2');
const isPortAvailable = require('is-port-available');

// Adapted from https://stackoverflow.com/a/40686853/547112
module.exports.mkDirByPathSync = function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
  
    targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        if( !fs.existsSync(curDir))
        {
          fs.mkdirSync(curDir);
        }
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
  
      return curDir;
    }, initDir);
  }

module.exports.findAvailablePort = async function findAvailablePort(provider, verbose, startPort=2002,endPort=2999)
{
  let port = startPort;
  let blackListPorts = await module.exports.getPortsUsedByVMs(provider);
  if( verbose )
  {
    console.log(chalk.gray(`Searching between ports ${startPort} and ${endPort} for ssh on localhost for this vm.`));
    console.log(chalk.gray(`Excluding the following ports already used by VirtualBox VMS: ${blackListPorts}`));
  }
  while( port <= endPort )
  {
    if( !blackListPorts.includes(port) )
    {
      var status = await isPortAvailable(port);
      if(status) 
      {
        console.log(chalk.gray(`Port ${port} is available for ssh on localhost!`));
        return port;
      }
    }
    port++;
  }
  throw new Error(`Could not find available port between ${startPort} and ${endPort}`);
}

// A VM could be powered off but assigned a port in its NAT/fowards for ssh/etc.
module.exports.getPortsUsedByVMs = async function getPortsUsedByVMs(provider)
{
  let vms = await provider.list();
  let ports = [];
  for( var vm of vms )
  {
    try {
      let properties = await provider.info(vm.name);
      for( let prop in properties )
      {
        if( prop.indexOf('Forwarding(') >= 0 )
        {
            ports.push( parseInt( properties[prop].split(',')[3]) );
        }
      }
    } catch( e ) {
      console.error(e);      
    }
  }
  return ports;
}

// In Windows creating a host only network often result in failure for a multitude of reasons.
// A common workaround is to disable and enable the network interface.
module.exports.repairNetwork = async function repairNetwork(ifaceName)
{
    // We need to look up the iface identifier, which is different than the ifaceName.
    let iFaces = await si.networkInterfaces();
    let result = iFaces.filter( (iFace) => iFace.ifaceName == ifaceName );
    if( result.length == 0 )
    {
        throw new Error(`Could not find network interface named ${ifaceName}`);
    }
    let networkInterface = result[0].iface;

    // We will use netsh to disable and enable the interface.
    // Unfortunately this requires an admin prompt, so we will request a privilenged shell.
    var options = {
        name: 'ottomatica virtcrud',
    };
    let output = await sudoprompt(`netsh interface set interface "${networkInterface}" disable && netsh interface set interface "${networkInterface}" enable`, options);
    //console.log(output);
}

function sudoprompt(cmd, options)
{
    return new Promise( function(resolve,reject)
    {
        sudo.exec(cmd, options,
        function(error, stdout, stderr) {
            if (error) { reject(error); return;}
            resolve(stdout);
        });
    });
}

module.exports.scp = async function scp(src, dest, destSSHConfig) {
  return new Promise((resolve, reject) => {
    scp2.scp(
      src, {
        host: '127.0.0.1',
        port: destSSHConfig.port,
        username: destSSHConfig.user,
        privateKey: fs.readFileSync(destSSHConfig.private_key, 'utf8'),
        path: dest
      },
      async function (err) {
        if (err) {
          console.error(`Failed to configure ssh keys: ${err}`);
          reject();
        } else {
          resolve();
        }
      }
    );
  });
}

module.exports.sshExec = async function sshExec(cmd, sshConfig, timeout=20000, verbose) {
    let buffer = "";
    return new Promise((resolve, reject) => {
        var c = new Client();
          c
            .on('ready', function() {
                c.exec(cmd, function(err, stream) {
                    if (err){
                        console.error(err);
                    }
                    stream
                        .on('close', function(code, signal) {
                            c.end();
                            resolve(buffer);
                        })
                        .on('data', function(data) {
                            if( verbose )
                            {
                                console.log('STDOUT: ' + data);
                            }
                            buffer += data;
                        })
                        .stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                            reject();
                        });
                });
            })
            .connect({
                host: '127.0.0.1',
                port: sshConfig.port,
                username: sshConfig.user,
                privateKey: fs.readFileSync(sshConfig.private_key),
                readyTimeout: timeout
            });
    });
}


module.exports.checkVirt = function checkVirt() {
  let status = null;
  if (os.platform() === 'win32') {
      let output = child_process.execSync('systeminfo');
      if (output && output.toString().indexOf('Virtualization Enabled In Firmware: Yes') !== -1) {
          status = true;
      } else {
          status = false;
      }
  } else if (os.platform() === 'darwin') {
      let output = child_process.execSync('sysctl -a | grep machdep.cpu.features');
      if (output && output.toString().indexOf('VMX') !== -1) {
          status = true;
      } else {
          status = false;
      }
  } else if (os.platform() === 'linux') {
      let output = null;
      try {
          output = child_process.execSync("cat /proc/cpuinfo | grep -E -c 'svm|vmx'");
      } catch (err) { 
          output = err.stdout.toString();
      }
      
      if (output != 0) {
          status = true;
      } else {
          status = false;
      }
  }
  return status;
}

module.exports.checkHyperV = function checkHyperV() {
  if (os.platform() === 'win32') {
      let output = child_process.execSync('systeminfo');
      if (output && output.toString().includes('A hypervisor has been detected. Features required for Hyper-V will not be displayed.')) {
          return true;
      } else {
          return false;
      }
  }
  return false;
}