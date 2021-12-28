
const { exec } = require('child_process');
const { resolve } = require('path');


class PowerShellCommandlets {


    static GetDefaultSwitch() {
        return `(Get-VMSwitch).Name`
    }

    static NewVM(Name, Ram, Disk, SwitchName ) {
        return `New-VM -Name "${Name}" -Generation 2 -MemoryStartupBytes "${Ram}" -VHDPath "${Disk}" -SwitchName "${SwitchName}"`;
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
                resolve( (error, stdout, stderr) );
            });    
        });    
    }

}

module.exports = PowerShellCommandlets;