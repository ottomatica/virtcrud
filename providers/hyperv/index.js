
const PowerShellCommandlets = require('./cmdlets');

class HyperV {

    async create(name, options) {

        options = options || {};

        let mem = options.mem || "1GB";
        let network = options.network || await PowerShellCommandlets.execute(PowerShellCommandlets.GetDefaultSwitch() );
        let disk = options.disk;

        await PowerShellCommandlets.execute( PowerShellCommandlets.NewVM(name, mem, disk, network) );

        if( options.iso ) {
            await PowerShellCommandlets.execute( PowerShellCommandlets.AddISO(name, 
                0, 1, options.iso) );
        }

    }

    async stop(name, options) {
    }

    async start(name, options) {
    }

    async status(name, options) {
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