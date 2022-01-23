const Shell = require("./shell");

class VirtualizationFramework {

    async create(name, options) {
        return await Shell.StartVM(options.kernel, options.initrd, options.rootfs, options.kernel_cmdline, options.iso);
    }

    async stop(name, options) {
    }

    async start(name, options) {
    }

    async status(name, options) {
    }


}

module.exports = VirtualizationFramework;