declare global {
    interface GetSensorDataResponse {
        status: Status;
        data: SensorDataBody;
        meta: MetaData;
    }

    interface GetDeviceInfoResponse {
        status: Status;
        data: DeviceInfoBody;
        meta: MetaData;
    }

    interface SensorDataBody {
        sensor_data: SensorData[];
    }

    interface SensorData {
        id: number;
        time: string;
        local_date: string;
        local_time: string;
        moisture: number;
        sunlight: number;
        celsius: number;
        fahrenheit: number;
    }

    interface DeviceInfoBody {
        device: DeviceInfo;
    }

    interface DeviceInfo {
        name: string;
        zone_num: number;
        serial: string;
        version: string;
        status: DeviceStatus;
        sw_version: string;
        zones: Zone[];
    }

    interface Zone {
        name: string;
        ith: number;
        enabled: boolean;
        smart: SmartConfiguration;
    }

    enum DeviceStatus {
        STANDBY = "STANDBY",
        SETUP = "SETUP",
        ONLINE = "ONLINE",
        WATERING = "WATERING",
        OFFLINE = "OFFLINE",
        SLEEPING = "SLEEPING",
        POWEROFF = "POWEROFF",
    }

    enum SmartConfiguration {
        SMART = "SMART",
        ASSISTANT = "ASSISTANT",
        TIMER = "TIMER",
    }

    enum Status {
        OK = "OK",
        ERROR = "ERROR",
    }

    interface MetaData {
        time: string;
        tid: string;
        version: string;
        token_limit: number;
        token_remaining: number;
        last_active: string;
        token_reset: string;
    }
}
export {};
