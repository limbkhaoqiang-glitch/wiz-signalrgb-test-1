export function Name() { return "WIZ Interface"; }
export function Version() { return "1.0.2"; }
export function VendorId() { return 0x0; }
export function ProductId() { return 0x0; }
export function Type() { return "network"; }
export function Publisher() { return "GreenSky Productions"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() {return [75, 70]; }
export function DefaultScale(){return 10.0;}

/* global
controller:readonly
AutoStartStream:readonly
forcedColor:readonly
minBrightniss:readonly
dimmColor:readonly
forceColor:readonly
*/

export function ControllableParameters() {
	return [
		{"property":"AutoStartStream", "group":"settings", "label":"Automatically Start Stream", "type":"boolean", "default":"false"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "type":"color", "default":"#009bde"},
		{"property":"minBrightniss", "group":"lighting", "label":"Minimal Brightness", "min":1, "max":100, "type":"number", "default":10},
		{"property":"dimmColor", "group":"lighting", "label":"Default Color when dimmed", "type":"color", "default":"#010101"},
		{"property":"forceColor", "group":"settings", "label":"Force Color", "type":"boolean", "default":"false"},
	];
}

let wizpro;

export function Initialize(){
	device.addFeature("udp");
	device.setName(`WIZ ${controller.modelName}`);
	device.setSize(1,1);
	device.setControllableLeds(["LED 1"],[[0,0]]);
	
	wizpro = new WIZProtcol(controller.ip, controller.port);
}

export function Render(){
	if(AutoStartStream){
		let r, g, b;

		if(forceColor){
			const color = device.hexToRgb(forcedColor);
			r = color.r; g = color.g; b = color.b;
		} else {
			const color = device.color(0, 0);
			r = color[0]; g = color[1]; b = color[2];
		}

		wizpro.setPilot(r, g, b);
	}
}

class WIZProtcol {
	constructor(ip, port){
		this.ip = ip;
		this.port = port;
		this.lastR = -1;
		this.lastG = -1;
		this.lastB = -1;
		this.lastBrightness = -1;
	}

	setPilot(r, g, b) {
		let brightness = device.Brightness;
		
		// Logic to differentiate Grey vs Pure White
		const isBalanced = (Math.abs(r - g) <= 2 && Math.abs(g - b) <= 2);
		const isHighIntensity = (r > 165); 

		if(this.lastR !== r || this.lastG !== g || this.lastB !== b || this.lastBrightness !== brightness) {
			this.lastR = r; this.lastG = g; this.lastB = b; this.lastBrightness = brightness;

			if (r === 0 && g === 0 && b === 0) {
				// Off state
				device.write(JSON.stringify({"method":"setPilot","params":{"state": false}}), this.ip, this.port);
			} 
			else if (isBalanced && isHighIntensity) {
				// TRUE WHITE Mode (Dedicated LEDs)
				device.write(JSON.stringify({"method":"setPilot","params":{"temp": 5000, "dimming": brightness}}), this.ip, this.port);
			} 
			else {
				// RGB Mode (Colors and Grey)
				device.write(JSON.stringify({"method":"setPilot","params":{"r": r, "g": g, "b": b, "dimming": brightness}}), this.ip, this.port);
			}
		}
	}
} 

export function Image(){
	return "UklGRvYQAABXRUJQVlA4TOkQAAAvx8AxACq80ratmuVGzMzM0mamnhEzMzMzMzMMipmZmTXMzMy8UczM31p/r7V66xNLmXKFzExb+whUcwLiA2jpADhmKZ+qfQKirWwm+yMxs0KmGCOGA+AUdyqW8l1i/WKIh1LRVImZmekNVpUyNmNnZvauyZbZ8artUJEpdYkjlvk3PMZwGQajnXVkxq7f7FBVKxV11URmZrvrM9PAjg1rytGUosnMzBb2GAV/ZPYfuZRz1KHpIDo2xdgdTmS2o67OXI5WqWsiM6dTZkaxcp+AyynbIdOUBMi2TTva30Zs27ZtO/k/tm2Mbdu2bdt2bJvDsG3bMP9/PMpt1/8JqEDUiv2/Yn+GicjLZxhGPhFcFyYqD09WpgFDP6BHIAYCgxQxJGlDlVUhX0YSIfoGA4QsDLm5/DyWg20A0D8YrrKJWzeHsKoUVk/GmitaC8VroWR6iyXTg80Xr/6sVR3fXCKanL2RqHtgfyEbC2fl5hkYkRiLgTmFV2/myhcsW/7StVQyOwjJoJ7YUukKlE1vIHtzi2yCFkSJXFz8lIfn4MNRMtOAGs1dyLSDCL9uhprM3zlHpqHPkIODj4z+wBCkzC2y5orn6JAP6qwUAN1BFYLGqKcPcCf+8aanqEDEHMMynSAkbdMKmU3kr+GctdLKkzSet2DIMm0GCJrOvGManrKH+DnH6AtMxk6TBXMgaTt6vZnNK7rK3RqHkRGrG7yUPFwZKTJR5WQbjIThqRizgSk7Fag9Nd0xg2Cd8tP1rp9wE67JxpSD5dtDOgDojllDUpW66kgcOyNVwp0Mn9/vMy6ekyMTXf9BhPFMyUlX5S0dAIIFy1dLyoahIB0Fx9x41NoayZ0DAEGnzOxCG7q8vsPlDAq38ctlO5qBb43nz9EBwGymcBOz0m/gln7BpG1rtmg2AJj6LALLxvCCFyeF8/ANhCgz1fR8KuMAgG62Krx80mVFzjk6gKBTlbCO4vPxkYqdbjgrXcDUAaBQ+WbiX5KXSyZnnxkEYJevxCWRh4dUNnoOE7Lw2iYAWDMLSHCJHgTglBqitIESkQYz0XRTY3IWAMS2emweAQDrgZt9WtJk4CFziSgEAM7ErQ2CjE+cahISAdKoT8w+tBAA/VmHqySOR5zqEytmkGb94iYWgMS6Mxbv5w+7VA6mAGnY1w94oAMg1HokdwSFFlX5S0dAIIFy1dLyoahIB0Fx9x41NoayZ0DAEGnzOxCG7q8vsPlDAq38ctlO5qBb43nz9EBwGymcBOz0m/gln7BpG1rtmg2AJj6LALLxvCCFyeF8/ANhCgz1fR8KuMAgG62Krx80mVFzjk6gKBTlbCO4vPxkYqdbjgrXcDUAaBQ+WbiX5KXSyZnnxkEYJevxCWRh4dUNnoOE7Lw2iYAWDMLSHCJHgTglBqitIESkQYz0XRTY3IWAMS2emweAQDrgZt9WtJk4CFziSgEAM7ErQ2CjE+cahISAdKoT8w+tBAA/VmHqySOR5zqEytmkGb94iYWgMS6Mxbv5w+7VA6mAGnY1w94oAMg1HokdwS"; 
}
