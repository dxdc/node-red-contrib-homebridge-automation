const debug = require('debug')('hapNodeRed:HapDeviceRoutes');

class HapDeviceRoutes {
  constructor(RED) {
    this.RED = RED;
  }

  // POST /hap-device/refresh/:id
  async refreshDevice(req, res) {
    const conf = this.RED.nodes.getNode(req.params.id);
    if (conf) {
      try {
        await conf.refreshDeviceList();
        res.status(200).send();
      } catch (e) {
        debug('Error refreshing devices: %s', e.message);
        res.status(500).send({ error: e.message });
      }
    } else {
      debug("Can't refresh until deployed");
      res.status(404).send();
    }
  }

  // GET /hap-device/evDevices/
  getDevices(req, res, key) {
    const devices = this.RED.nodes.getNode(req.params.id)?.[key];
    if (devices && devices.length) {
      res.send(devices);
    } else {
      res.status(404).send({ error: `No devices found for ${key}` });
    }
  }

  // GET /hap-device/evDevices/:id
  getDeviceById(req, res, key) {
    const devices = this.RED.nodes.getNode(req.params.id)?.[key];
    if (devices) {
      // debug(`${key} devices`, devices.length);
      res.send(devices);
    } else {
      res.status(404).send();
    }
  }

  // Register all routes
  registerRoutes() {
    const nodeTypes = [
      { permission: 'hb-event.read', deviceKey: 'evDevices' },
      { permission: 'hb-resume.read', deviceKey: 'evDevices' },
      { permission: 'hb-status.read', deviceKey: 'evDevices' },
      { permission: 'hb-control.read', deviceKey: 'ctDevices' },
    ];

    nodeTypes.forEach(({ permission, deviceKey }) => {
      const auth = this.RED.auth.needsPermission(permission);
      this.RED.httpAdmin.post('/hap-device/refresh/:id', auth, this.refreshDevice.bind(this));
      this.RED.httpAdmin.get(`/hap-device/${deviceKey}/`, auth, (req, res) => this.getDevices(req, res, deviceKey));
      this.RED.httpAdmin.get(`/hap-device/${deviceKey}/:id`, auth, (req, res) => this.getDeviceById(req, res, deviceKey));
    });
  }
}

module.exports = HapDeviceRoutes;
