const Shell = require("./shell");

class VirtualizationFramework {

    async create(name, options) {
        return await Shell.StartVM(name);
    }

    async stop(name, options) {
    }

    async start(name, options) {
    }

    async status(name, options) {
    }


}

module.exports = VirtualizationFramework;