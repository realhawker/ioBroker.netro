import * as utils from "@iobroker/adapter-core";
import fetch from "cross-fetch";

class Netro extends utils.Adapter {
    private interval: ioBroker.Interval;
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "netro",
        });
        this.interval = this.setInterval(async () => this.updateDevices(), 10 * 60 * 1000);
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.setState("info.connection", false, true);
        this.log.debug("config: " + JSON.stringify(this.config));

        await this.updateDevices();
    }

    private async updateDevices(): Promise<void> {
        if (this.config.serials) {
            for (let i = 0; i < this.config.serials.length; i++) {
                const serial = this.config.serials[i];
                await this.updateDeviceInfo(serial);
                await this.updateSensorData(serial);
            }
        }
    }

    private async updateDeviceInfo(serial: string): Promise<void> {
        return fetch(`https://api.netrohome.com/npa/v1/info.json?key=${serial}`)
            .then((response) => response.json())
            .then(async (data: GetDeviceInfoResponse) => {
                await this.handleDeviceInfo(serial, data);
            })
            .catch((reason) => this.log.error(reason));
    }

    private async handleDeviceInfo(serial: string, data: GetDeviceInfoResponse): Promise<void> {
        this.setState("info.connection", true, true);
        if (data.status == "OK") {
            this.log.debug("DeviceInfo: serial=" + serial + " data=" + JSON.stringify(data));
            await this.setDeviceInfoStates(serial, data.data.device || data.data.sensor);
        } else {
            this.log.error("DeviceInfo: serial=" + serial + " data=" + JSON.stringify(data));
        }
    }

    private async setDeviceInfoStates(serial: string, data: DeviceInfo): Promise<void> {
        await this.setObjectNotExistsAsync(serial, {
            type: "device",
            common: {
                name: serial,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(serial + ".info", {
            type: "channel",
            common: {
                name: "Info",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(serial + ".info.name", {
            type: "state",
            common: {
                name: "name",
                type: "string",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".info.name", data.name, true);

        await this.setObjectNotExistsAsync(serial + ".info.serial", {
            type: "state",
            common: {
                name: "serial",
                type: "string",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".info.serial", data.serial, true);

        await this.setObjectNotExistsAsync(serial + ".info.version", {
            type: "state",
            common: {
                name: "version",
                type: "string",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".info.version", data.version, true);

        await this.setObjectNotExistsAsync(serial + ".info.status", {
            type: "state",
            common: {
                name: "status",
                type: "string",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".info.status", data.status, true);

        await this.setObjectNotExistsAsync(serial + ".info.sw_version", {
            type: "state",
            common: {
                name: "sw_version",
                type: "string",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".info.sw_version", data.sw_version, true);
    }

    private async updateSensorData(serial: string): Promise<void> {
        const date = new Date();
        const dateString = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
        this.log.debug(dateString);
        return fetch(
            `http://api.netrohome.com/npa/v1/sensor_data.json?key=${serial}&start_date=${dateString}&end_date=${dateString}`,
        )
            .then((response) => response.json())
            .then(async (data: GetSensorDataResponse) => {
                await this.handleSensorData(serial, data);
            })
            .catch((reason) => this.log.error(reason));
    }

    private async handleSensorData(serial: string, data: GetSensorDataResponse): Promise<void> {
        this.setState("info.connection", true, true);
        if (data.status == "OK") {
            this.log.debug("SensorData: serial=" + serial + " data=" + JSON.stringify(data));
            let lastDate = new Date(1970, 1, 1);
            let last = null;
            for (let i = 0; i < data.data.sensor_data.length; i++) {
                if (new Date(data.data.sensor_data[i].time) > lastDate) {
                    last = data.data.sensor_data[i];
                    lastDate = new Date(data.data.sensor_data[i].time);
                }
            }

            if (last) {
                await this.setSensorDataStates(serial, last);
            }
        } else {
            this.log.error("SensorData: serial=" + serial + " data=" + JSON.stringify(data));
        }
    }

    private async setSensorDataStates(serial: string, data: SensorData): Promise<void> {
        await this.setObjectNotExistsAsync(serial, {
            type: "device",
            common: {
                name: serial,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(serial + ".sensor-data", {
            type: "channel",
            common: {
                name: "SensorData",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(serial + ".sensor-data.time", {
            type: "state",
            common: {
                name: "time",
                type: "number",
                role: "value.time",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".sensor-data.time", new Date(data.time).getTime(), true);

        await this.setObjectNotExistsAsync(serial + ".sensor-data.celsius", {
            type: "state",
            common: {
                name: "celsius",
                type: "number",
                unit: "°C",
                role: "value.temperature",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".sensor-data.celsius", data.celsius, true);

        await this.setObjectNotExistsAsync(serial + ".sensor-data.fahrenheit", {
            type: "state",
            common: {
                name: "fahrenheit",
                type: "number",
                unit: "°F",
                role: "value.temperature",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".sensor-data.fahrenheit", data.fahrenheit, true);

        await this.setObjectNotExistsAsync(serial + ".sensor-data.moisture", {
            type: "state",
            common: {
                name: "moisture",
                type: "number",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".sensor-data.moisture", data.moisture, true);

        await this.setObjectNotExistsAsync(serial + ".sensor-data.sunlight", {
            type: "state",
            common: {
                name: "sunlight",
                type: "number",
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setStateAsync(serial + ".sensor-data.sunlight", data.sunlight, true);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            clearInterval(this.interval);
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Netro(options);
} else {
    // otherwise start the instance directly
    (() => new Netro())();
}
