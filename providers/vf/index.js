const Shell = require("./shell");

class VirtualizationFramework {

    constructor() {
        this.process = null;
    }

    async create(name, options) {
        this.process = await Shell.StartVM(options.outLog, options.errLog, 
            options.kernel, options.initrd, options.rootfs, options.kernel_cmdline, options.tty, options.iso);
        this.process.unref();

        return this.process;
    }

    async stop(name, options) {
        if( this.process ) {
            this.process.kill();
        }
    }

    async start(name, options) {
    }

    async status(name, options) {

    }


}

module.exports = VirtualizationFramework;