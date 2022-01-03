
const { exec } = require('child_process');

const sudo = require('sudo-prompt');

class PowerShellCommandlets {

    static AddCurrentUserToHyperVAdmin() {

        let user = `${process.env.USERDOMAIN}\\${process.env.USERNAME}`;
        return PowerShellCommandlets.e(`Add-LocalGroupMember -Group 'Hyper-V Administrators' -Member '${user}'`);
    }

    static GetDefaultSwitch() {
        return PowerShellCommandlets.e(`(Get-VMSwitch -SwitchType Internal).Name`)
    }

    static NewVM(Name, Ram, Disk, SwitchName ) {
        return PowerShellCommandlets.e(`New-VM -Name "${Name}" -Generation 2 -MemoryStartupBytes ${Ram} -VHDPath "${Disk}" -SwitchName "${SwitchName}"`);
    }

    static AddISO(Name, ControllerNumber, ControllerLocation, ISOPath) {
        return PowerShellCommandlets.e(`Add-VMDvdDrive -VMName ${Name} -ControllerNumber ${ControllerNumber} -ControllerLocation ${ControllerLocation} -Path ${ISOPath}`);
    }

    // <VM>, On, MicrosoftUEFICertificateAuthority
    static SetSecureBoot(Name, SecureBootOnOff) {
        return PowerShellCommandlets.e(`Set-VMFirmware "${Name}" -EnableSecureBoot ${SecureBootOnOff}`);
    }

    static StartVM(Name) {
        return PowerShellCommandlets.e(`Start-VM ${Name}`);
    }

    static StopVM(Name) {
        return PowerShellCommandlets.e(`Stop-VM -Save ${Name}`);
    }

    static RemoveVM(Name) {
        return PowerShellCommandlets.e(`Remove-VM -Force ${Name}`);
    }

    static ConvertVHD(Path, Destination, Type) {
        return PowerShellCommandlets.e(`Convert-VHD -Path ${Path} -DestinationPath ${Destination} -VHDType ${Type}`);
    }

    static GetVMState(Name) {
        return PowerShellCommandlets.e(`(Get-VM ${Name}).State`);
    }

    // Sharing..
    // https://linuxhint.com/shared_folders_hypver-v_ubuntu_guest/

    static e(cmd) {
        return new Promise ( (resolve, reject) => {
            exec(cmd, {'shell':'powershell.exe'}, (error, stdout, stderr)=> {
                PowerShellCommandlets.report (stdout, stderr);
                if( error ) {
                    return reject(error);                    
                }
                return resolve( stdout.trim() );
            });    
        });
    }

    static report (stdout, stderr) {
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