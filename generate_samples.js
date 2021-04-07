


let num_samples = 44
let a4 = 24
let a4_freq = 440.0

function note_frequency(n) {
	// magic
	return Math.pow(2.0, (n - a4) / 12.0) * a4_freq
}

function sine_wave(freq, t, offset) {
	return Math.sin ((t * freq + offset) * Math.PI * 2.0)
}

function square_wave(freq, t, offset) {
	return Math.sign(sine_wave(freq, t, offset))
}

function sawtooth_wave(freq, t, offset) {
	return 2.0 * ((t * freq + offset) - Math.floor(t * freq + offset + 0.5))
}

const Lame = require("lamejs")
const I16_MAX = Math.pow(2, 14) - 1

function envelope(x) {
	function f(x) {
		return 0.6 * Math.sin(4.0 * x + 1.0) - 0.3 * Math.pow(Math.cos(4.0 * x - 1), 3)
	}

	return f(0.6 * x - 0.1) + 0.8 * Math.max(1.0 - 24.0 * x * x, 0.0)
}

function generate_sample(note) {
	let mp3encoder = new Lame.Mp3Encoder(1, 44100, 128)
	let samples = new Int16Array(44100)

	for(let i = 0; i < samples.length; i++) {
		let note_freq = note_frequency(note)
		let t = i / 44100.0

		let sample = sine_wave(note_freq, t, 0.0)
		sample += sine_wave(note_freq * 0.5, t, 0.0) / 8.0
		sample += sine_wave(note_freq * 2.0, t, 0.0) / 6.0
		sample += sine_wave(note_freq * 3.0, t, 0.0) / 8.0
		sample += sine_wave(note_freq * 6.0, t, 0.0) / 12.0

		sample *= envelope(t)

		samples[i] = sample * 1.3 * I16_MAX
	}

	let tmp1 = mp3encoder.encodeBuffer(samples)
	let tmp2 = mp3encoder.flush()

	let mp3data = new Int8Array(tmp1.length + tmp2.length)
	for(let i = 0; i < tmp1.length; i++) mp3data[i] = tmp1[i]
	for(let i = 0; i < tmp2.length; i++) mp3data[tmp1.length + i] = tmp2[i]

	return mp3data
}

const fs = require("fs")

for(let i = 0; i < num_samples; i++) {
	fs.writeFileSync("assets/samples/" + i + ".mp3", generate_sample(i))
}
