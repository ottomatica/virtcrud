const { lookpath } = require('lookpath');

const slash = require('slash');
const fs = require('fs-extra');
//const ssh = require('ssh2-client');
const path = require('path');
const vbox = require('./index');
const VBoxProvider = require('./VBoxProvider');
const chalk = require('chalk');

// const env = require('../env');
// const ping = require('../health');

// const { slimdir, registry } = env.vars();

// const privateKey = path.join(slimdir, 'baker_rsa');

class VirtualBox {
    constructor()
    {
        this.defaultOptions =
        {
            cpus: 1,
            mem: 1024,
            syncs: [],
            disk: false,
            verbose: true,
            ssh_port: undefined // auto-find a ssh available port
        }

        this.driver = new VBoxProvider();
        this.privateKey = null;
        this.sshUser = 'root'; // root unless overridden.
    }

    
    async requirements()
    {
        const vboxmanage = await lookpath('VBoxManage') || fs.existsSync( "C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" );
        if( !vboxmanage )
        {
            console.log( chalk.red(`Could not find required VBoxManage executable on your path.`) );
            console.log( `Please follow instructions on ${chalk.underline('https://www.virtualbox.org/wiki/Downloads')} to install` );
            return false;
        }
        return true;
    }


    /**
     * Returns State of a VM
     * @param {String} VMName
     */
    async getState(VMName) {
        let vmInfo = await this.driver.info(VMName);
        return vmInfo.VMState.replace(/"/g,'');
    }

    async _getUsedPorts(name)
    {
        let ports = [];
        let properties = await this.driver.info(name);
        for( let prop in properties )
        {
            if( prop.indexOf('Forwarding(') >= 0 )
            {
                try {
                    ports.push( parseInt( properties[prop].split(',')[3]) );
                }
                catch(e) { console.error(e); }
            }
        }
        return ports;
    }

    /**
     * Get ssh configurations
     * @param {Obj} machine
     * @param {Obj} nodeName Optionally give name of machine when multiple machines declared.
     */
    async getSSHConfig(machine, nodeName) {

        // Use VirtualBox driver
        let vmInfo = await this.driver.info(machine);
        let port = null;
        Object.keys(vmInfo).forEach(key => {
            if(vmInfo[key].includes('guestssh')){
                port = parseInt( vmInfo[key].split(',')[3]);
            }
        });
        return {user: this.sshUser, port: port, host: machine, hostname: '127.0.0.1', private_key: this.privateKey};
    }

    async create(name, options)
    {
        let args = {
            vmname: name,
            micro: true,
            quickBoot: true,
            bridged: options.bridged,
            ip: options.ip,
            cpus: options.cpus || this.defaultOptions.cpus,
            mem: options.mem || this.defaultOptions.mem,
            syncs: options.syncs || this.defaultOptions.syncs,
            disk: options.disk || this.defaultOptions.disk,
            verbose: options.verbose || this.defaultOptions.verbose,
            ssh_port: options.ssh_port || this.defaultOptions.ssh_port,
        };

        if( options.image.endsWith('.iso') ) args.attach_iso = options.image;
        if( options.image.endsWith('.ovf')  ) args.ovf = options.image;

        if ((await this.driver.list()).filter(e => e.name === name).length == 0) {
            await vbox(args);
        } else if((await this.getState(name)) != 'running') {
            await vbox({start: true, vmname: name, syncs: [], verbose: true});
        }
    }

    async mountShares(syncs, connector, user, useSudo)
    {
       let sudo = useSudo?"sudo ":"";
       // Handle sync folders
       if( syncs.length > 0 )
       {
           // Add vboxsf to modules so we can enable shared folders; ensure our user is in vboxsf group
           try {
             let cmd = `${sudo} modprobe vboxsf; ${sudo} usermod -a -G vboxsf ${user}`;
             await connector.exec( cmd );
           } catch (error) {
               throw `failed to setup shared folders, ${error}`;
           }

           // Add mount to /etc/fstab for every shared folder
           let count = 0;
           for( var sync of syncs )
           {
               let guest = sync.split(';')[1];

               try {
                   let LINE=`"vbox-share-${count}"    ${guest}   vboxsf  uid=1000,gid=1000   0   0`; let FILE=`/etc/fstab`; 
                   let cmd = `${sudo} mkdir -p ${guest}; grep -qF -- "${LINE}" "${FILE}" || echo "${LINE}" | ${sudo} tee -a "${FILE}"`;
                   await connector.exec( cmd );
               } catch (error) {
                   throw `failed to add fstab entry for shared folder, ${error}`;
               }
               count++;
           }

           // Reload fstab
           try {
               let cmd = `${sudo} mount -a`;
               await connector.exec(cmd);
           } catch (error) {
               throw `failed to setup shared folders, ${error}`;
           }
           
       }

    }


    async stop(name, force = false) {
        await vbox({ stopCmd: true, vmname: name, syncs: [], verbose: false }).catch(e => e);
    }

    async delete(name) {
        let state = await this.getState(name);
        if (state == 'running') {
            await this.stop(name);
        } else if (state === 'not_found') {
            throw new Error(`vm ${name} does not exist`);
        }
        await vbox({ deleteCmd: true, vmname: name, syncs: [], verbose: false }).catch(e => e);
    }

    async exists(name) {
        return await fs.exists(path.join(registry, name, 'slim.iso'));
    }

    async health(name) {
        const sshInfo = await this.getSSHConfig(name);
        return ping(sshInfo);
    }

    async size(name) {
        return fs.statSync(path.join(registry, name, 'slim.iso')).size;
    }

    async list() {
        return await this.driver.list();
    }

    async attach(name) {
        const sshInfo = await this.getSSHConfig(name);
        ssh.shell(`${sshInfo.user}@${sshInfo.hostname}`, {port: sshInfo.port, privateKey: sshInfo.private_key, readyTimeout: 30000});
    }
}

module.exports = VirtualBox;
