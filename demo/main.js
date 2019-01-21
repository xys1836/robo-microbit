const microbit = new RoboMicrobit();

microbit.onDisconnected((device) => {
	document.getElementById('device-name').innerHTML = 'device name: ';
	document.getElementById('status').innerHTML = 'status: disconnected';
	document.getElementById('ultrasonic-ranger').innerHTML = 'Distance: 0 cm';
	document.getElementById('accelerator').innerHTML =
		'Accelerator: X: 0 Y: 0 Z: 0';
})

microbit.onConnected((device) => {
	console.log("connected to:" + device.name);
	
	document.getElementById('device-name').innerHTML = 'device name: ' + device.name;
	document.getElementById('status').innerHTML = 'status: connected';
	setTimeout(function () {
		microbit.startAllNotifications();
	}, 2000);
})

microbit.onUartMessage((event) => {
	const value = event.target.value
	const strArray = [];
	for (let i = 0; i < value.byteLength; i++) {
		strArray[i] = value.getUint8(i);
	}
	const str = String.fromCharCode.apply(null, strArray);
	const distance = str.split('.')[0] + '.' + str.split('.')[1].slice(0, 2);
	document.getElementById('ultrasonic-ranger').innerHTML = 'Distance: ' + distance + ' cm';
})

microbit.onAccelerometeData((event) => {
	const acceleratorX = event.target.value.getInt16(0) / 1000.0;
	const acceleratorY = event.target.value.getInt16(2) / 1000.0;
	const acceleratorZ = event.target.value.getInt16(4) / 1000.0;
	document.getElementById('accelerator').innerHTML =
		'Accelerator: X: ' + acceleratorX + ' Y: ' + acceleratorY + ' Z: ' + acceleratorZ;
})

microbit.onButtonAStateChanged((event) => {
	console.log(event.target.value.getUint8(0))
	const button_a = document.getElementById('microbit-button-a');
	const status = event.target.value.getUint8(0)
	if (status === 0) {
		console.log("on button A pressed up");
		button_a.style.backgroundColor = 'white';
		button_a.style.color = 'black';

	} else if (status === 1) {
		console.log("on button A pressed down");
		button_a.style.backgroundColor = 'grey';
		button_a.style.color = 'white';
	} else if (status === 2) {
		console.log("on button A long pressed (longer than 3s?)");
		button_a.style.backgroundColor = 'black';
		button_a.style.color = 'white';
	}

})

microbit.onButtonBStateChanged((event) => {
	console.log(event.target.value.getUint8(0))
	const status = event.target.value.getUint8(0)
	const button_b = document.getElementById('microbit-button-b');
	if (status === 0) {
		console.log("on button B pressed up");
		button_b.style.backgroundColor = 'white';
		button_b.style.color = 'black';
	} else if (status === 1) {
		console.log("on button B pressed down");
		button_b.style.backgroundColor = 'grey';
		button_b.style.color = 'white';
	} else if (status === 2) {
		console.log("on button B long pressed (longer than 3s?)");
		button_b.style.backgroundColor = 'black';
		button_b.style.color = 'white';
	}
})

microbit.onTemperatureChanged(event => {
	const temperature = event.target.value.getUint8(0);
	document.getElementById('temperature-value').innerHTML = 'Temperature: ' + temperature;
})

const periodButton = document.getElementById('accelerator-period-button');
periodButton.onclick = function () {
	const period = document.getElementById('accelerator-period').value;
	microbit.setAccelerometerPeriod(period);
}

const startAllNotificiationButton = document.getElementById('start-all-notification');
startAllNotificiationButton.onclick = function () {
	microbit.startAllNotifications();
}

const stopAllNotificiationButton = document.getElementById('stop-all-notification');
stopAllNotificiationButton.onclick = function () {
	microbit.stopAllNotifications();
}

const testButton = document.getElementById('test-button');
testButton.onmousedown = function () {
	console.log("onmousedown");
	const range = document.getElementById('pwm-range').value;
	microbit.setPinOutput(1).then(_ => {
		microbit.setPinPwm(1, range * 10.0, 1000);
	})
}

testButton.onmouseup = function () {
	console.log("onmouseup");
	microbit.setPinPwm(1, 0, 1000);
}