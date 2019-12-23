
const { lookpath } = require('lookpath');
const chalk = require('chalk');
const path = require('path');
const mustache = require('mustache');
const fs = require('fs');
const child = require('child_process');

const privateKey = path.join('/Users/cjparnin/.slim', 'baker_rsa');


class Qemu {

    /**
     * Construct a new virtcrud instance.
     *
     * @param {Object} [options]                 Options object.
     */
    constructor(options = {}) {
        this.defaultOptions = {
            cpus: 1,
            mem: 1024,
            syncs: [],
            disk: false,
            verbose: true,
            ssh_port: 2022 // auto-find an available port
        };
    }

    async create(name, options) {
        let { image } = options;
        // since we are mounting by label rather than directory,
        // we need to create a label for each sync
        let syncs = (options.syncs || this.defaultOptions.syncs).map((syncs, index) => {
            let [ host, guest ] = syncs.split(';');

            return {
                host,
                guest,
                label: `share${index}`,
            };
        });

        let sshPort = this.defaultOptions.ssh_port || await this.findAvailablePort();

        let args = {
            name,
            cpus: options.cpus || this.defaultOptions.cpus,
            mem: options.mem || this.defaultOptions.mem,
            syncs,
            kernel: path.join( image, 'vmlinuz'),
            initrd: path.join( image, 'initrd'),
            ssh_port: options.sshPort || sshPort
        };


        let xml = (fs.readFileSync(path.join( path.dirname( require.main.filename ), 'providers', 'scripts', 'kvm.xml.mustache'))).toString();
        let render = mustache.render(xml, args);
        let output = path.join(`${name}.xml`);

        fs.writeFileSync(output, render);

        await this.exec(`create ${output}`, true);

        let sshInfo = await this.getSSHConfig(name);
        console.log(`ssh -i ${sshInfo.private_key} ${sshInfo.user}@${sshInfo.hostname} -p ${sshInfo.port} -o StrictHostKeyChecking=no`);
    }

    async exec(cmd, verbose=false) {
        let opts = verbose ? { stdio: 'inherit' } : {};

        return child.execSync(`virsh -c qemu:///session ${cmd}`, opts);
    }

    async getSSHConfig(name) {
        let port = await this.getSSHPort(name);

        return {user: 'root', port: port, host: name, hostname: '127.0.0.1', private_key: privateKey};
    }

    async getSSHPort(name) {
        let re = /^.+hostfwd=tcp::(\d+)-:22.+$/gm;
        let xml = await this.exec(`dumpxml ${name}`);
        let [, port, ] = re.exec(xml);

        return port;
    }


    async requirements()
    {
        const qemu = await lookpath('qemu-system-x86_64');
        if( !qemu )
        {
            console.log( chalk.red(`Could not find required qemu executable on your path.`) );
            console.log( `Please follow instructions on ${chalk.underline('https://www.qemu.org/download/')} to install` );
            return false;
        }

        const virsh = await lookpath('virsh');
        if( !virsh )
        {
            console.log( chalk.red(`Could not find required virsh executable on your path.`) );
            console.log( `Please follow instructions on ${chalk.underline('https://help.ubuntu.com/lts/serverguide/libvirt.html')} to install` );
            return false;
        }
        return true;
    }

}


// Export
module.exports = Qemu;