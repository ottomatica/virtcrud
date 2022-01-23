const path = require("path");
const exec = require("child_process").exec;

const vfTool = path.join(__dirname, "vendor", "vftool", "build", "vftool");
class Shell {

    static async StartVM(kernel, initrd, rootfs, kernel_cmdline, iso) {

        let cmd = `${vfTool} \
        -k ${kernel} \
        -i ${initrd} \
        -d ${rootfs} \
        -a "${kernel_cmdline}" \
        -t "tty1"`;

        if( iso ) {
            cmd += "\\\n -c ${iso}"
        }

        return Shell.exec(cmd);
    }

    static async exec(cmd) {
        return new Promise ( (resolve, reject) => {
            exec(cmd, (error, stdout, stderr)=> {
                if( error ) {
                    return reject(error);                    
                }
                return resolve( stdout.trim() );
            });    
        });
    }

}

module.exports = Shell;
