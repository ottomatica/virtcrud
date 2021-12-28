const virtcrud = require('./index');


async function vbox() {

    let vbox = await virtcrud.getProvider('vbox');

    if( !await vbox.requirements() )
    {
        return;
    }

    vbox.privateKey = 'C:/Users/chris/.baker/baker_rsa';
    await vbox.create('test-ovf', 
    {   
        ovf: require('path').join(require('os').homedir(), '.bakerx','.persist','images','bionic', 'box.ovf'),
        bridged: true
    });    
}

async function hyperv() {
    let hyperv = await virtcrud.getProvider('hyperv');
    
    // await hyperv.setup();

    await hyperv.create("V1");
}

(async () => {

    await hyperv();

})();
