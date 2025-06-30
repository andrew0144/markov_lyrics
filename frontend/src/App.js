import { useState } from "react";
import axios from "axios";
import "./App.css";
import {
	Button,
	FormControl,
	FormControlLabel,
	RadioGroup,
	Radio,
	FormLabel,
	Autocomplete,
	TextField,
	Typography,
	Snackbar,
	Alert,
	Container,
	Fab,
	Box,
	Fade,
	Backdrop,
	Modal,
	Card,
} from "@mui/material";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import LinearProgress from "@mui/material/LinearProgress";
import HelpIcon from "@mui/icons-material/Help";
import CancelIcon from "@mui/icons-material/Cancel";

// prod url
axios.defaults.baseURL = "https://markovlyrics.com/";

// axios.defaults.baseURL = "http://localhost:8000/";
// sets up the material ui theme for the app
const theme = responsiveFontSizes(
	createTheme({
		palette: {
			mode: "dark",
			primary: {
				main: "#7986cb",
			},
			secondary: {
				main: "#f50057",
			},
			text: {
				primary: "#7986cb",
			},
		},
		typography: {
			fontFamily: `'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
			fontSize: 17,
		},
	})
);

function App() {
	// some state hook setup
	const [songLyric, setSongLyric] = useState(null);
	const [length, setLength] = useState("one-line");
	const [checked, setChecked] = useState([]);
	const [text, setText] = useState("");
	const [artistName, setArtistName] = useState("");
	const [isSearchingSong, setIsSearchingSong] = useState(false);
	const [songName, setSongName] = useState("");
	const [successOpen, setSuccessOpen] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const artists = [
		"adele",
		"al-green",
		"alicia-keys",
		"amy-winehouse",
		"beatles",
		"bieber",
		"bjork",
		"blink-182",
		"bob-dylan",
		"bob-marley",
		"britney-spears",
		"bruce-springsteen",
		"bruno-mars",
		"cake",
		"dickinson",
		"disney",
		"dj-khaled",
		"dolly-parton",
		"dr-seuss",
		"drake",
		"eminem",
		"janisjoplin",
		"jimi-hendrix",
		"johnny-cash",
		"joni-mitchell",
		"Kanye_West",
		"lady-gaga",
		"leonard-cohen",
		"Lil_Wayne",
		"lin-manuel-miranda",
		"lorde",
		"ludacris",
		"michael-jackson",
		"missy-elliott",
		"nickelback",
		"nicki-minaj",
		"nirvana",
		"notorious_big",
		"nursery_rhymes",
		"patti-smith",
		"paul-simon",
		"prince",
		"r-kelly",
		"radiohead",
		"rihanna",
	];

	const fabStyle = {
		margin: 0,
		top: "auto",
		right: 10,
		bottom: 10,
		left: "auto",
		position: "fixed",
	};

	const modalStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: "80%",
		maxWidth: "900px",
		maxHeight: "80vh",
		border: "2px solid white",
		backgroundColor: "#7986cb",
		borderRadius: "10px",
		color: "white",
		p: 4,
	};

	// gets the generated lyrics from the backend using an axios request
	function generateLyrics() {
		axios({
			method: "GET",
			url: "/generate",
			params: {
				length: length,
				artists: JSON.stringify(checked.map((name) => name + ".txt")),
				user_text: text,
			},
		})
			.then((response) => {
				const res = response.data;
				setSongLyric({
					artists: res.text_dataset,
					text: res.text,
				});
			})
			.catch((error) => {
				if (error.response) {
					console.log(error.response);
					console.log(error.response.status);
					console.log(error.response.headers);
				}
			});
	}

	// loads the lyrics for a song using an axios request
	async function loadSongLyrics() {
		console.log(length);
		setIsSearchingSong(true);
		try {
			const lyrics_response = await axios({
				method: "GET",
				url: `/${artistName}/${songName}`,
				baseURL: "https://api.lyrics.ovh/v1",
			});
			console.log(lyrics_response);
			const lyrics = lyrics_response.data.lyrics;
			console.log(lyrics);
			if (!lyrics) {
				throw new Error("Lyrics not found");
			}
			const response = await axios({
				method: "GET",
				url: "/loadlyrics",
				params: {
					lyrics: lyrics,
					artistName: artistName,
				},
			});
			const res = response.data;
			if (res.error) {
				throw new Error(res.error);
			}
			console.log(res);
			setSuccessOpen(true);
			setIsSearchingSong(false);
		} catch (error) {
			setErrorOpen(true);
			setIsSearchingSong(false);
			console.log(error);
		}
	}

	function reset() {
		setSongLyric(null);
		setLength("one-line");
		setChecked([]);
		setText("");
		setArtistName("");

		axios({
			method: "GET",
			url: "/reset",
		})
			.then((response) => {
				const res = response.data;
				console.log(res);
			})
			.catch((error) => {
				if (error.response) {
					console.log(error.response);
					console.log(error.response.status);
					console.log(error.response.headers);
				}
			});
	}

	// the app's JSX. did not break up into sub-components since the app is fairly simple and only one page
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<div className="App-div">
					<h1>Markov Chain Song Lyric Generator</h1>
					<FormControl className="form-control" sx={{ mt: 2 }}>
						<FormLabel
							sx={{ textAlign: "left" }}
							id="demo-radio-buttons-group-label"
						>
							Length
						</FormLabel>
						<RadioGroup
							row
							value={length}
							onChange={(event) => setLength(event.target.value)}
							aria-labelledby="demo-radio-buttons-group-label"
							defaultValue="one-line"
							name="radio-buttons-group"
						>
							<FormControlLabel
								value="one-line"
								control={<Radio />}
								label="One Liner"
							/>
							<FormControlLabel
								value="verse"
								control={<Radio />}
								label="Verse"
							/>
							<FormControlLabel
								value="song"
								control={<Radio />}
								label="Full Song"
							/>
						</RadioGroup>
					</FormControl>
					<Container sx={{ maxWidth: "100%" }}>
						<FormControl className="form-control" sx={{ mb: 2 }}>
							<Autocomplete
								id="autocomplete-checkboxes"
								value={checked}
								multiple
								options={artists}
								getOptionLabel={(option) => option}
								onChange={(event, newValue) => {
									setChecked(newValue);
								}}
								renderInput={(params) => (
									<TextField
										sx={{ paddingTop: 0.5 }}
										{...params}
										variant="standard"
										label="Artists Selected"
										placeholder="Choose Artists.."
									/>
								)}
							/>
						</FormControl>
					</Container>

					<Container sx={{ maxWidth: "100%" }}>
						<FormControl className="form-control" sx={{ mx: 2 }}>
							<FormLabel
								sx={{ mb: 1, textAlign: "left" }}
								id="demo-radio-buttons-group-label"
							>
								Load Song's Lyrics
							</FormLabel>
							<Container
								sx={{
									display: "flex",
									padding: "0px !important",
									gap: 2,
									justifyContent: "space-between",
								}}
							>
								<TextField
									value={artistName}
									id="outlined-basic"
									label="Artist Name"
									variant="outlined"
									placeholder="Enter Artist's Name"
									onChange={(event) => setArtistName(event.target.value)}
									sx={{ flexGrow: 1, mb: 2 }}
								/>
								<TextField
									value={songName}
									id="outlined-basic"
									label="Song Name"
									variant="outlined"
									placeholder="Enter Song Name"
									onChange={(event) => setSongName(event.target.value)}
									sx={{ flexGrow: 1, mb: 2 }}
								/>
							</Container>

							<Button
								sx={{ mb: 2 }}
								variant="contained"
								onClick={loadSongLyrics}
							>
								Load Song's Lyrics
							</Button>
							{isSearchingSong && <LinearProgress />}
						</FormControl>
					</Container>

					<FormControl className="form-control">
						<FormLabel sx={{ mb: 1, textAlign: "left" }} id="user-text-label">
							User Text
						</FormLabel>
						<TextareaAutosize
							value={text}
							aria-label="user_text"
							minRows={3}
							maxRows={8}
							placeholder="Enter your text here.."
							style={{ my: 2, padding: 2, backgroundColor: "#282c34", color: "rgba(255, 255, 255, 0.7)", width: "100%", borderRadius: 4, fontSize: 16 }}
							onChange={(event) => setText(event.target.value)}
              spellCheck="false"
						/>
					</FormControl>

					<Container>
						<FormControl
							className="form-control"
							sx={{ my: 2, flexDirection: "row", gap: 2 }}
						>
							<Button
								sx={{ my: 2, width: "50%" }}
								variant="contained"
								onClick={generateLyrics}
							>
								Generate Song Lyric
							</Button>
							<div style={{ width: "50%", display: "flex", gap: 16 }}>
								<Button
									sx={{ my: 2, flexGrow: 1 }}
									variant="contained"
									onClick={reset}
								>
									<CancelIcon />
								</Button>
								<Button
									sx={{ my: 2, flexGrow: 1 }}
									variant="contained"
									aria-label="add"
									onClick={() => setModalOpen(true)}
									className="help-button"
								>
									<HelpIcon />
								</Button>
							</div>
						</FormControl>
					</Container>

					<Card
						sx={{
							padding: "16px 0",
							marginBottom: 2,
						}}
					>
						<Typography
							sx={{ justifyContent: "center" }}
							className="form-control"
						>
							{songLyric ? (
								<div>
									<Typography
										sx={{
											fontSize: 25,
											marginBottom: -2,
											fontWeight: "bold",
											textDecoration: "underline",
										}}
									>
										{songLyric.artists && (
											<span>
												Generated Song Lyric using {songLyric.artists}
											</span>
										)}
									</Typography>
									<br></br>
									{songLyric.text}
								</div>
							) : (
								<div>
                  <Typography
										sx={{
											fontSize: 25,
											marginBottom: -2,
											fontWeight: "bold",
											textDecoration: "underline",
										}}
									>
											<span>
												Generated Song Lyric:
											</span>
									</Typography>
									<br></br>
									No lyrics generated yet.
								</div>
							)}
						</Typography>
					</Card>

					<Snackbar
						open={successOpen}
						autoHideDuration={6000}
						onClose={() => setSuccessOpen(false)}
					>
						<Alert
							onClose={() => setSuccessOpen(false)}
							severity="success"
							sx={{ width: "100%" }}
						>
							Successfuly loaded lyrics from {songName} by {artistName}.
						</Alert>
					</Snackbar>

					<Snackbar
						open={errorOpen}
						autoHideDuration={6000}
						onClose={() => setErrorOpen(false)}
					>
						<Alert
							onClose={() => setErrorOpen(false)}
							severity="error"
							sx={{ width: "100%" }}
						>
							Failed to load lyrics for {songName} by {artistName}. Please try
							again or check spelling.
						</Alert>
					</Snackbar>

					<Modal
						aria-labelledby="transition-modal-title"
						aria-describedby="transition-modal-description"
						open={modalOpen}
						onClose={() => setModalOpen(false)}
						onClick={() => setModalOpen(false)}
						closeAfterTransition
						slots={{ backdrop: Backdrop }}
						slotProps={{
							backdrop: {
								timeout: 500,
							},
						}}
					>
						<Fade in={modalOpen}>
							<Box sx={modalStyle}>
								<Typography
									id="transition-modal-title"
									variant="h6"
									component="h2"
								>
									About this App
								</Typography>
								<Typography
									id="transition-modal-description"
									sx={{ mt: 2 }}
									className="modal-box"
								>
									This app uses Markov Chains to generate song lyrics from a
									corpus of text.
									<br></br>
									<br></br>
									You can select any number of artists from the database, and
									the app will generate lyrics based on the text from all of
									their songs.
									<br></br>
									<br></br>
									If you don't see your favorite song, you can load it by typing
									in the "Artist Name" and "Song Name" fields and clicking the
									"Get Song's Lyrics" button, and the app will use the lyrics
									from that song. The app will then generate lyrics based on
									that song's lyrics. For example, try typing in "Otis Redding"
									as the Artist Name and "Dock of the Bay" as the Song Name to
									see the generated lyrics.
									<br></br>
									<br></br>For extra customization, you can enter your own text
									into the "User Text" field, and the app will generate lyrics
									based on that text.
									<br></br>
									<br></br>Lastly, you can select the length of the generated
									output. To clear all inputs and unload any lyrics loaded from
									songs, hit the "Reset" button."
								</Typography>
							</Box>
						</Fade>
					</Modal>
				</div>
			</ThemeProvider>
		</div>
	);
}

export default App;
