const path = require("path");
const { spawn } = require('child_process');

const vfTool = path.join(__dirname, "vendor", "vftool", "build", "vftool");
class Shell {

    static async StartVM(kernel, initrd, rootfs, kernel_cmdline, iso) {

        let args = [
            "-k", kernel,
            "-i", initrd,
            "-d", rootfs,
            "-a", kernel_cmdline,
            "-t", "tty1"
        ];

        if( iso ) {
            args.push("-c");
            args.push(iso);
        }

        return spawn(vfTool, args, {detached: true, stdio: [ 'ignore', 'pipe', 'pipe'] }, );
    }
}

module.exports = Shell;
