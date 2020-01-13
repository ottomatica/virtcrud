const { lookpath } = require('lookpath');

const slash = require('slash');
const fs = require('fs-extra');
//const ssh = require('ssh2-client');
const path = require('path');
const vbox = require('./index');
const VBoxProvider = require('./VBoxProvider');


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
            bridged: true,
            cpus: options.cpus || this.defaultOptions.cpus,
            mem: options.mem || this.defaultOptions.mem,
            syncs: options.syncs || this.defaultOptions.syncs,
            disk: options.disk || this.defaultOptions.disk,
            verbose: options.verbose || this.defaultOptions.verbose,
            ssh_port: options.ssh_port || this.defaultOptions.ssh_port,
        };

        if( options.iso ) args.attach_iso = options.iso;
        if( options.ovf ) args.ovf = options.ovf;

        if ((await this.driver.list()).filter(e => e.name === name).length == 0) {
            await vbox(args);
        } else if((await this.getState(name)) != 'running') {
            await vbox({start: true, vmname: name, syncs: [], verbose: true});
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
