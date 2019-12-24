
const Qemu = require('./providers/libvirt');


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
        }
    }

}


// Export
module.exports = virtcrud;