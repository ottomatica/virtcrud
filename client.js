const virtcrud = require('./index');


(async () => {

    let qemu = await virtcrud.getProvider('qemu');
    
    if( !await qemu.requirements() )
    {
        return;
    }

    await qemu.create('test-qemu', 
    {
        image: '/Users/cjparnin/.slim/registry/alpine3.8-simple/', 
        privateKey: '/Users/cjparnin/.slim/baker_rsa'
    });


    // virtcrud.create('baker', id, options);
    // virtcrud.create('vagrant', id, options);
    // virtcrud.create('vbox', id, options);
    // virtcrud.create('docker', id, options);
    // virtcrud.create('slim', id, options);

    // let slim = virtcrud.getProvider('slim', options);
    // slim.task('build', options); 
    // slim.create(id, options)   
    // let ip = slim.read('ip');
    // slim.delete(id);

})();
