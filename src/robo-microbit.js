
//Services
// const GENERIC_ACCESS = '0000180000001000800000805f9b34fb';

const BUTTON_SERVICE_UUID = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const IO_PIN_SERVICE_UUID = 'e95d127b-251d-470a-a062-fa1922dfa9a8';
const ACCELEROMETER_SERVICE_SERVICE_UUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
const TEMPERATURE_SERVICE_UUID = 'e95d6100-251d-470a-a062-fa1922dfa9a8';

//Characteristic
const ACCELEROMETER_DATA_CHARACTERISTIC_UUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8';
const ACCELEROMETER_PERIOD_CHARACTERISTIC_UUID = 'e95dfb24-251d-470a-a062-fa1922dfa9a8';
const BUTTON_A_STATE_CHARACTERISTIC_UUID = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
const BUTTON_B_STATE_CHARACTERISTIC_UUID = 'e95dda91-251d-470a-a062-fa1922dfa9a8';
const UART_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const TEMPERATURE_CHARACTERISTIC_UUID = 'e95d9250-251d-470a-a062-fa1922dfa9a8';
const TEMPERATURE_PERIOD_CHARACTERISTIC_UUID = 'e95d1b25-251d-470a-a062-fa1922dfa9a8';

const PIN_PWM_CONTROL_CHARACTERISTIC_UUID = 'e95dd822-251d-470a-a062-fa1922dfa9a8';
const PIN_CONFIGURATION_CHARACTERISTIC_UUID = 'e95db9fe-251d-470a-a062-fa1922dfa9a8';

class RoboMicrobit {
    constructor() {
        this.device;
        this.accelerometerDataCharacteristic = null;
        this.accelerometerPeriodCharacteristic = null;
        this.uartCharacteristic = null;
        this.buttonAStateCharacteristic = null;
        this.buttonBStateCharacteristic = null;
        this.temperatureCharacteristic = null;

        this.onUartMessageCallback = function () {}
        this.onDisconnectedCallback = function () {}
        this.onConnectedCallback = function () {}
        this.onAccelerometeDataCallback = function () {}
        this.onButtonAStateChangedCallback = function () {}
        this.onButtonBStateChangedCallback = function () {}
        this.onTemperatureChangedCallback = function () {}
    }

    searchDevice() {

        const filters = [{
            namePrefix: 'BBC micro:bit'
        }]

        const options = {}
        // options.acceptAllDevices = true;
        options.optionalServices = [BUTTON_SERVICE_UUID]
        options.filters = filters

        navigator.bluetooth.requestDevice(options).then(device => {
                // console.log('Device: ');
                // console.log(device);
                // console.log('Device name: ' + device.name);
                // console.log('Device ID: ' + device.id);

                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnectedCallback);;
                return device.gatt.connect();
            })
            .then(server => {
                console.log('server:');
                console.log(server);
                return server.getPrimaryServices();
            })
            .then(services => {
                console.log(services);
                services.forEach(service => {
                    service.getCharacteristics().then(characteristics => {
                            console.log(characteristics);
                            characteristics.forEach(characteristic => {
                                switch (characteristic.uuid) {
                                    case ACCELEROMETER_PERIOD_CHARACTERISTIC_UUID:
                                        this.accelerometerPeriodCharacteristic = characteristic;
                                        break;
                                    case ACCELEROMETER_DATA_CHARACTERISTIC_UUID:
                                        this.accelerometerDataCharacteristic = characteristic;
                                        break;
                                    case UART_CHARACTERISTIC_UUID:
                                        this.uartCharacteristic = characteristic;
                                        break;
                                    case BUTTON_A_STATE_CHARACTERISTIC_UUID:
                                        this.buttonAStateCharacteristic = characteristic;
                                        break;
                                    case BUTTON_B_STATE_CHARACTERISTIC_UUID:
                                        this.buttonBStateCharacteristic = characteristic;
                                        break;
                                    case TEMPERATURE_CHARACTERISTIC_UUID:
                                        this.temperatureCharacteristic = characteristic;
                                        break;
                                    case TEMPERATURE_PERIOD_CHARACTERISTIC_UUID:
                                        this.temperaturePeriodCharacteristic = characteristic;
                                        break;
                                    case PIN_PWM_CONTROL_CHARACTERISTIC_UUID:
                                        this.pinPwmControlCharacteristic = characteristic;
                                        break;
                                    case PIN_CONFIGURATION_CHARACTERISTIC_UUID:
                                        this.pinConfigurationCharacteristic = characteristic;
                                        break;
                                    default:
                                        break;
                                }
                            })
                        })
                        .catch(error => {
                            console.log(error);
                        })
                });
            }).then(() => {
                console.log("connected");
                this.onConnectedCallback(this.device);
            })
            .catch(error => {
                console.log(error);
            })
    }

    disconnect() {
        if (this.device === null || !this.device.gatt.connected) {
            return
        }
        this.device.gatt.disconnect();
    }

    setAccelerometerPeriod(value) {
        if (this.device === null || !this.device.gatt.connected) {
            return
        }
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setUint16(0, value, true /* littleEndian */ );
        this.accelerometerPeriodCharacteristic.writeValue(buffer)
    }

    setTemperaturePeriod(value) {
        if (this.device === null || !this.device.gatt.connected) {
            return
        }
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setUint16(0, value, true /* littleEndian */ );
        this.temperaturePeriodCharacteristic.writeValue(buffer);
    }

    setPinOutput(pin) {
        // TODO: test this part.
        // console.warn("set pin OUTPUT has not been implemented");
        return new Promise((resolve, reject) => {
            this.pinConfigurationCharacteristic.readValue().then(value => {
                const pinConfigure = ~ (0x0001 << pin) & value.getUint32(0);
                const buffer = new ArrayBuffer(4);
                new DataView(buffer).setUint32(0, pinConfigure, true /* littleEndian */ );
                this.pinConfigurationCharacteristic.writeValue(buffer).then(resolve).catch(reject);
            })
        })
        
    }

    setPinInput(pin) {
        // TODO: test this part.
        // console.warn("set pin INPUT has not been implemented");
        return new Promise((resolve, reject) => {
            this.pinConfigurationCharacteristic.readValue().then(value => {
                const pinConfigure = (0x0001 << pin) | value.getUint32(0);
                const buffer = new ArrayBuffer(4);
                new DataView(buffer).setUint32(0, pinConfigure, true /* littleEndian */ );
                this.pinConfigurationCharacteristic.writeValue(buffer).then(resolve).catch(reject);
            })
        })
    }

    setPinPwm(pin, value, period) {
        return new Promise((resolve, reject) => {
            const buffer = new ArrayBuffer(7);
            const view = new DataView(buffer);
            view.setUint8(0, pin, true);
            view.setUint16(1, value, true);
            view.setUint32(3, period, true);
            this.pinPwmControlCharacteristic.writeValue(buffer).then(resolve).catch(reject);
        })
    }

    onUartMessage(callBack) {
        this.onUartMessageCallback = callBack;
    }

    onDisconnected(callBack) {
        this.onDisconnectedCallback = callBack;
    }

    onConnected(callBack) {
        this.onConnectedCallback = callBack;
    }

    onAccelerometeData(callBack) {
        this.onAccelerometeDataCallback = callBack;
    }

    onButtonAStateChanged(callBack) {
        this.onButtonAStateChangedCallback = callBack;
    }

    onButtonBStateChanged(callBack) {
        this.onButtonBStateChangedCallback = callBack;
    }

    onTemperatureChanged(callBack) {
        this.onTemperatureChangedCallback = callBack;
    }

    startUartNotifications() {
        if (this.uartCharacteristic) {
            this.uartCharacteristic.startNotifications();
            this.uartCharacteristic.addEventListener('characteristicvaluechanged', this.onUartMessageCallback);
        }

    }

    stopUartNotifications() {
        if (this.uartCharacteristic) {
            this.uartCharacteristic.stopNotifications();
            this.uartCharacteristic.removeEventListener('characteristicvaluechanged', this.onUartMessageCallback);
        }
    }

    startAccelerometerNotifications() {
        if (this.accelerometerDataCharacteristic) {
            this.accelerometerDataCharacteristic.startNotifications();
            this.accelerometerDataCharacteristic.addEventListener('characteristicvaluechanged', this.onAccelerometeDataCallback);
        }
    }

    stopAccelerometerNotifications() {
        if (this.accelerometerDataCharacteristic) {
            this.accelerometerDataCharacteristic.stopNotifications();
            this.accelerometerDataCharacteristic.removeEventListener('characteristicvaluechanged', this.onAccelerometeDataCallback);
        }

    }

    startButtonAStateNotifications() {
        if (this.buttonAStateCharacteristic) {
            this.buttonAStateCharacteristic.startNotifications();
            this.buttonAStateCharacteristic.addEventListener('characteristicvaluechanged', this.onButtonAStateChangedCallback);
        }
    }

    stopButtonAStateNotifications() {
        if (this.buttonAStateCharacteristic) {
            this.buttonAStateCharacteristic.stopNotifications();
            this.buttonAStateCharacteristic.removeEventListener('characteristicvaluechanged', this.onButtonAStateChangedCallback);
        }
    }

    startButtonBStateNotifications() {
        if (this.buttonBStateCharacteristic) {
            this.buttonBStateCharacteristic.startNotifications();
            this.buttonBStateCharacteristic.addEventListener('characteristicvaluechanged', this.onButtonBStateChangedCallback);
        }
    }

    stopButtonBStateNotifications() {
        if (this.buttonBStateCharacteristic) {
            this.buttonBStateCharacteristic.stopNotifications();
            this.buttonBStateCharacteristic.removeEventListener('characteristicvaluechanged', this.onButtonBStateChangedCallback);
        }
    }

    startTemperatureNotifications() {
        if (this.temperatureCharacteristic) {
            this.temperatureCharacteristic.startNotifications();
            this.temperatureCharacteristic.addEventListener('characteristicvaluechanged', this.onTemperatureChangedCallback);
        }
    }
    stopTemperatureNotifications() {
        if (this.temperatureCharacteristic) {
            this.temperatureCharacteristic.stopNotifications();
            this.temperatureCharacteristic.removeEventListener('characteristicvaluechanged', this.onTemperatureChangedCallback);
        }
    }

    startAllNotifications() {
        this.startAccelerometerNotifications();
        this.startButtonAStateNotifications();
        this.startButtonBStateNotifications();
        this.startUartNotifications();
        this.startTemperatureNotifications();
    }

    stopAllNotifications() {
        this.stopAccelerometerNotifications();
        this.stopButtonAStateNotifications();
        this.stopButtonBStateNotifications();
        this.stopUartNotifications();
        this.stopTemperatureNotifications();
    }

}