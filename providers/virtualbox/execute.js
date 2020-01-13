const exec = require('child_process').exec;
const VBexe = process.platform === 'win32' ? '"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe"' : 'VBoxManage';
const chalk = require('chalk');


module.exports = function(cmd, args, verbose) {

    return new Promise(function (resolve, reject) {

        let runCmd = `${VBexe} ${cmd} ${args}`;

        if( verbose )
        {
            console.log( chalk.gray(`Executing ${runCmd}`) );
        }

        exec(runCmd, (error, stdout, stderr) => {

            if(error) {
                reject(error);
            } 
            else 
            {
                resolve(stdout, stderr);
            }

        });

    }.bind({cmd, args, verbose}));

};