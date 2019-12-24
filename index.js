
const Qemu = require('./providers/libvirt');
const VirtualBox = require('./providers/virtualbox/virtualbox')


/**
 * virtcrud. Manage virtualization.
 */
class virtcrud {

    /**
     * Construct a new virtcrud instance.
     *
     * @param {Object} [options]                 Options object.
     */
    constructor(options = {}) {

    }

    static getProvider(type)
    {
        switch(type) {
            case 'qemu':
                return new Qemu();
            case 'vbox':
                return new VirtualBox();
        }
    }

}


// Export
module.exports = virtcrud;