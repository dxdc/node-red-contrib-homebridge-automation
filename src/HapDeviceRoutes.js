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
    const routes = [
      { method: 'post', path: '/hap-device/refresh/:id', permission: 'hb-event.read', handler: this.refreshDevice },
      { method: 'get', path: '/hap-device/evDevices/', permission: 'hb-event.read', handler: (req, res) => this.getDevices(req, res, 'evDevices') },
      { method: 'get', path: '/hap-device/evDevices/:id', permission: 'hb-event.read', handler: (req, res) => this.getDeviceById(req, res, 'evDevices') },
      { method: 'post', path: '/hap-device/refresh/:id', permission: 'hb-resume.read', handler: this.refreshDevice },
      { method: 'get', path: '/hap-device/evDevices/', permission: 'hb-resume.read', handler: (req, res) => this.getDevices(req, res, 'evDevices') },
      { method: 'get', path: '/hap-device/evDevices/:id', permission: 'hb-resume.read', handler: (req, res) => this.getDeviceById(req, res, 'evDevices') },
      { method: 'post', path: '/hap-device/refresh/:id', permission: 'hb-status.read', handler: this.refreshDevice },
      { method: 'get', path: '/hap-device/evDevices/', permission: 'hb-status.read', handler: (req, res) => this.getDevices(req, res, 'evDevices') },
      { method: 'get', path: '/hap-device/evDevices/:id', permission: 'hb-status.read', handler: (req, res) => this.getDeviceById(req, res, 'evDevices') },
      { method: 'post', path: '/hap-device/refresh/:id', permission: 'hb-control.read', handler: this.refreshDevice },
      { method: 'get', path: '/hap-device/ctDevices/', permission: 'hb-control.read', handler: (req, res) => this.getDevices(req, res, 'ctDevices') },
      { method: 'get', path: '/hap-device/ctDevices/:id', permission: 'hb-control.read', handler: (req, res) => this.getDeviceById(req, res, 'ctDevices') },
    ];

    routes.forEach(({ method, path, permission, handler }) => {
      this.RED.httpAdmin[method](path, this.RED.auth.needsPermission(permission), handler.bind(this));
    });
  }
}

module.exports = HapDeviceRoutes;
