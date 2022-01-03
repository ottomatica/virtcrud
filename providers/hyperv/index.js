
const PowerShellCommandlets = require('./cmdlets');
const path = require('path');

class HyperV {

    async create(name, options) {

        options = options || {};

        let mem = options.mem || "1GB";
        let network = options.network || await PowerShellCommandlets.GetDefaultSwitch();
        let disk = options.disk;

        let diskInfo = path.parse(disk);

        if( diskInfo.ext === ".vhd" ) {
            let dest = path.join( path.dirname(disk), diskInfo.name + ".vhdx" ); 
            await PowerShellCommandlets.ConvertVHD(disk, dest, "Dynamic");
        }
        
        await PowerShellCommandlets.NewVM(name, mem, disk, network);
        await PowerShellCommandlets.SetSecureBoot(name, "off");

        if( options.iso ) {
            await PowerShellCommandlets.AddISO(name, 0, 1, options.iso);
        }

        return true;
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

    async requirements()
    {
    }

    async setup() {

        await PowerShellCommandlets.sudoprompt( "powershell " + PowerShellCommandlets.AddCurrentUserToHyperVAdmin(), 
        {
            name: "Add current user to HyperV admin group"
        } );

    }

}


module.exports = HyperV;