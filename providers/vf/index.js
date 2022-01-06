const Shell = require("./shell");

class VirtualizationFramework {

    async create(name, options) {
        return await Shell.StartVM(name);        
    }

    async stop(name, options) {
        return await PowerShellCommandlets.StopVM(name);
    }

    async start(name, options) {
        return await PowerShellCommandlets.Start(name);
    }

    async status(name, options) {
        return await PowerShellCommandlets.GetVMState(name);s
    }


}

module.exports = VirtualizationFramework;