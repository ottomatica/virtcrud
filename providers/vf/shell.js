const path = require("path");
const { spawn } = require('child_process');

const vfTool = path.join(__dirname, "vendor", "vftool", "build", "vftool");
class Shell {

    static async StartVM(kernel, initrd, rootfs, kernel_cmdline, tty, iso) {

        let args = [
            "-k", kernel,
            "-i", initrd,
            "-d", rootfs,
            "-a", kernel_cmdline
        ];

        if( tty ) {
            args.push( "-t");
            args.push( tty );
        }

        if( iso ) {
            args.push("-c");
            args.push(iso);
        }

        return spawn(vfTool, args, {detached: true, stdio: [ 'ignore', 'pipe', 'pipe'] }, );
    }
}

module.exports = Shell;
