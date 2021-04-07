import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Audio } from "expo-av"


const Stack = createStackNavigator()


const HomeScreen = ({ navigation }) => {
	return (<View style={styles.container}>
		<Text>Melondy!</Text>
		<Button title="Train" onPress={() => navigation.navigate("Start")} />
		<StatusBar style="auto" />
	</View>)
}

const SAMPLES = [
	require("./assets/samples/0.mp3"),
	require("./assets/samples/1.mp3"),
	require("./assets/samples/2.mp3"),
	require("./assets/samples/3.mp3"),
	require("./assets/samples/4.mp3"),
	require("./assets/samples/5.mp3"),
	require("./assets/samples/6.mp3"),
	require("./assets/samples/7.mp3"),
	require("./assets/samples/8.mp3"),
	require("./assets/samples/9.mp3"),
	require("./assets/samples/10.mp3"),
	require("./assets/samples/11.mp3"),
	require("./assets/samples/12.mp3"),
	require("./assets/samples/13.mp3"),
	require("./assets/samples/14.mp3"),
	require("./assets/samples/15.mp3"),
	require("./assets/samples/16.mp3"),
	require("./assets/samples/17.mp3"),
	require("./assets/samples/18.mp3"),
	require("./assets/samples/19.mp3"),
	require("./assets/samples/20.mp3"),
	require("./assets/samples/21.mp3"),
	require("./assets/samples/22.mp3"),
	require("./assets/samples/23.mp3"),
	require("./assets/samples/24.mp3"),
	require("./assets/samples/25.mp3"),
	require("./assets/samples/26.mp3"),
	require("./assets/samples/27.mp3"),
	require("./assets/samples/28.mp3"),
	require("./assets/samples/29.mp3"),
	require("./assets/samples/30.mp3"),
	require("./assets/samples/31.mp3"),
	require("./assets/samples/32.mp3"),
	require("./assets/samples/33.mp3"),
	require("./assets/samples/34.mp3"),
	require("./assets/samples/35.mp3"),
	require("./assets/samples/36.mp3"),
	require("./assets/samples/37.mp3"),
	require("./assets/samples/38.mp3"),
	require("./assets/samples/39.mp3"),
	require("./assets/samples/40.mp3"),
	require("./assets/samples/41.mp3"),
	require("./assets/samples/42.mp3"),
	require("./assets/samples/43.mp3"),
]

// this is a problem if the 0th sample is not an A
const NOTE_LABELS = (function () {
	const A4 = 24
	const NUM_NOTES = SAMPLES.length

	let labels = new Array(NUM_NOTES)

	const NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]


	for (let i = 0; i < NUM_NOTES; i++) {
		let octave = 4 - Math.floor((A4 - i) / 12)
		labels[i] = NOTES[i % 12] + octave
	}

	return labels
})()

import InputSpinner from "react-native-input-spinner"

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


const STATES = {
	UNSUBMITTED: 0,
	CORRECT: 1,
	INCORRECT: 2,
}

function TrainingOptions() {
	const [sound, setSound] = React.useState([])

	let melody = [12, 24, 19, 15, 17, 14, 15, 12]
	let root = melody[0]
	let [note_states, setNoteStates] = React.useState(() => {
		let note_states = new Array(melody.length)
		for (let i = 0; i < note_states.length; i++) {
			note_states[i] = [root, STATES.UNSUBMITTED]
		}

		note_states[0][1] = STATES.CORRECT
		return note_states
	})

	async function playSound() {
		let _sounds = new Array(melody.length)
		for (let i = 0; i < _sounds.length; i++) {
			_sounds[i] = await Audio.Sound.createAsync(SAMPLES[melody[i]])
		}
		setSound(_sounds)

		for (let i = 0; i < _sounds.length; i++) {
			await _sounds[i].sound.playAsync()
			await sleep(800.0)
			await _sounds[i].sound.stopAsync()
		}
	}

	async function playSuccessSound() {
		let { sound } = await Audio.Sound.createAsync(SAMPLES[36])
		await sound.playAsync()
		await sleep(1000.0)
		await sound.unloadAsync()
	}

	async function playFailureSound() {
		let { sound } = await Audio.Sound.createAsync(SAMPLES[2])
		await sound.playAsync()
		await sleep(1000.0)
		await sound.unloadAsync()
	}

	function check() {
		let correct = true
		for(let i = 0; i < note_states.length; i++) {
			if (note_states[i][0] == melody[i]) {
				note_states[i][1] = STATES.CORRECT
			} else {
				note_states[i][1] = STATES.INCORRECT
				correct = false
			}
		}

		setNoteStates([...note_states])

		if (correct) {
			playSuccessSound()
			// navigate
		} else {
			playFailureSound()
		}
	}

	React.useEffect(() => {
		return () => {
			sound.forEach(s => s.sound.unloadAsync())
		}
	}, [sound])


	return <View style={{alignItems: "center"}}>
		<View height={16} />
		<Button width="90%" title="Play" onPress={playSound} />
		<View height={16} />
		<View width="90%">
			{melody.map((n, i) => {
				let state = note_states[i]
				return (<View key={i} style={{
					flexDirection: "row",
					flexGrow: 1,
					justifyContent: "space-between",
					alignItems: "center",
					padding: 4,
				}}>
					<Text>{i == 0 ? "Root" : "Note #" + i + ""}</Text>
					<InputSpinner
						width="50%"
						value={note_states[i][0]}
						onChange={v => note_states[i][0] = v}
						disabled={state[1] == STATES.CORRECT}
						editable={false}
						customLabel={v => NOTE_LABELS[v]}
						background={(() => {
							switch (state[1]) {
								case STATES.CORRECT:
									return "#1A1"
								case STATES.INCORRECT:
									return "#A11"
								default:
									return "transparent"
							}
						})()}
					/>
				</View>)
			})}
		</View>
		<View height={16} />

		<Button width="90%" title="Check" onPress={check} />
	</View>
}

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Home" component={HomeScreen} options={{ title: "Welcome" }} />
				<Stack.Screen name="Start" component={TrainingOptions} options={{ title: "Train" }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
