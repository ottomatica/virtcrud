const path = require('path');
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

    // Add user to Hyper-V admin
    // await hyperv.setup();

    // Prepare basic dir structure
    const fs = require('fs-extra');
    let workingDir = path.join(require('os').homedir(), ".virtcrud");
    if( !fs.existsSync( workingDir ) ) { fs.mkdirSync(workingDir) }
    fs.emptyDirSync( workingDir );

    // Copy base image into vm dir
    let baseImage = path.join( require('os').homedir(), 
        ".slim/registry/ubuntu-20.04-ci-hyperv/rootfs.vhd");
    let vmImage = path.join( workingDir, "rootfs.vhd");
    fs.copyFileSync( baseImage, vmImage );

    // cloudinit iso
    let iso = path.join( require('os').homedir(), 
    ".slim/registry/ubuntu-20.04-ci-hyperv/cidata.iso");

    // await hyperv.stop("VX");
    // await hyperv.delete("VX");
    await hyperv.create("VX", {disk: vmImage, iso: iso});
}

async function vf() {

    let vf =  await virtcrud.getProvider('vf');

    await vf.create( "hello");

}


(async () => {

    await vf();

})();
