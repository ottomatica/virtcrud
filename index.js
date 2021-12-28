
const Qemu = require('./providers/libvirt');
const VirtualBox = require('./providers/virtualbox/virtualbox')
const HyperV = require('./providers/hyperv/')

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
            case 'hyperv':
                return new HyperV();
            default:
                throw new Error(`Provider ${type} is not supported`);
        }
    }

}


// Export
module.exports = virtcrud;