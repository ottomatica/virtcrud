
const Kvm = require('./providers/kvm/libvirt');
const VirtualBox = require('./providers/virtualbox/virtualbox')
const HyperV = require('./providers/hyperv/')
const VirtualizationFramework = require('./providers/vf/')
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
            case 'kvm':
                return new Kvm();
            case 'vbox':
                return new VirtualBox();
            case 'hyperv':
                return new HyperV();
            case 'vf':
                return new VirtualizationFramework();
            default:
                throw new Error(`Provider ${type} is not supported`);
        }
    }

}


// Export
module.exports = virtcrud;