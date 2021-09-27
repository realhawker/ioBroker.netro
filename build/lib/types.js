"use strict";
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["STANDBY"] = "STANDBY";
    DeviceStatus["SETUP"] = "SETUP";
    DeviceStatus["ONLINE"] = "ONLINE";
    DeviceStatus["WATERING"] = "WATERING";
    DeviceStatus["OFFLINE"] = "OFFLINE";
    DeviceStatus["SLEEPING"] = "SLEEPING";
    DeviceStatus["POWEROFF"] = "POWEROFF";
})(DeviceStatus || (DeviceStatus = {}));
var SmartConfiguration;
(function (SmartConfiguration) {
    SmartConfiguration["SMART"] = "SMART";
    SmartConfiguration["ASSISTANT"] = "ASSISTANT";
    SmartConfiguration["TIMER"] = "TIMER";
})(SmartConfiguration || (SmartConfiguration = {}));
var Status;
(function (Status) {
    Status["OK"] = "OK";
    Status["ERROR"] = "ERROR";
})(Status || (Status = {}));
//# sourceMappingURL=types.js.map