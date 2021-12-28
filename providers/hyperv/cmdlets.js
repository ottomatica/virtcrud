
const { exec } = require('child_process');

const sudo = require('sudo-prompt');

class PowerShellCommandlets {

    static AddCurrentUserToHyperVAdmin() {

        let user = `${process.env.USERDOMAIN}\\${process.env.USERNAME}`;
        return `Add-LocalGroupMember -Group 'Hyper-V Administrators' -Member '${user}'`;
    }


    static GetDefaultSwitch() {
        return `(Get-VMSwitch -SwitchType Internal).Name`
    }

    static NewVM(Name, Ram, Disk, SwitchName ) {
        return `New-VM -Name "${Name}" -Generation 2 -MemoryStartupBytes ${Ram} -VHDPath "${Disk}" -SwitchName "${SwitchName}"`;
    }

    static AddISO(Name, ControllerNumber, ControllerLocation, ISOPath) {
        return `Add-VMDvdDrive -VMName ${Name} -ControllerNumber ${ControllerNumber} -ControllerLocation ${ControllerLocation} -Path ${ISOPath}`;
    }

    // <VM>, On, MicrosoftUEFICertificateAuthority
    static SetFirmwareOptions(Name, SecureBootOnOff, Template) {
        return `Set-VMFirmware "${Name}" -EnableSecureBoot ${SecureBootOnOff} -SecureBootTemplate ${Template}`;
    }

    static StartVM(Name) {
        return `Start-VM ${Name}`;
    }


    static execute(cmd) {
        return new Promise ( (resolve, reject) => {
            exec(cmd, {'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                PowerShellCommandlets.report (error, stdout, stderr);
                resolve( stdout.trim() );
            });    
        });
    }

    static report (error, stdout, stderr) {
        if( error ) {
            throw new Error(error);
        }
        if( stderr ) {
            console.error( stderr );
        }
        if( stdout ) {
            console.log( stdout );
        }
    }

    static sudoprompt(cmd, options)
    {
        return new Promise( function(resolve,reject)
        {
            sudo.exec(cmd, options,
            function(error, stdout, stderr) {
                if (error) { return reject(error);}
                resolve(stdout.trim());
            });
        });
    }

}

module.exports = PowerShellCommandlets;