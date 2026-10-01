// 15 Real Full Studio Songs Playlist
const songs = [
	{
		title: "Flower",
		artist: "JISOO",
		src: "songs/flower.mp3",
		duration: "2:53",
		cover: "image.png"
	},
	{
		title: "All Eyes On Me",
		artist: "JISOO",
		src: "songs/all-eyes-on-me.mp3",
		duration: "2:44",
		cover: "image.png"
	},
	{
		title: "Eyes Closed",
		artist: "JISOO",
		src: "songs/eyes-closed-official-mv.mp3",
		duration: "3:10",
		cover: "image.png"
	},
	{
		title: "Your Love",
		artist: "JISOO",
		src: "songs/jisoo--your-love-special-video-rainforest-wild-asia-singapore.mp3",
		duration: "2:53",
		cover: "image.png"
	},
	{
		title: "Earthquake",
		artist: "JISOO",
		src: "songs/earthquake-dance-performance-video (1).mp3",
		duration: "2:44",
		cover: "image.png"
	},
	{
		title: "Pink Venom",
		artist: "BLACKPINK",
		src: "songs/pink_venom.mp3",
		duration: "3:06",
		cover: "image.png"
	},
	{
		title: "Shut Down",
		artist: "BLACKPINK",
		src: "songs/shut_down.mp3",
		duration: "2:55",
		cover: "image.png"
	},
	{
		title: "Solo",
		artist: "JENNIE",
		src: "songs/solo.mp3",
		duration: "2:49",
		cover: "image.png"
	},
	{
		title: "Kill This Love",
		artist: "BLACKPINK",
		src: "songs/kill_this_love.mp3",
		duration: "3:09",
		cover: "image.png"
	},
	{
		title: "Lovesick Girls",
		artist: "BLACKPINK",
		src: "songs/lovesick_girls.mp3",
		duration: "3:12",
		cover: "image.png"
	},
	{
		title: "How You Like That",
		artist: "BLACKPINK",
		src: "songs/how_you_like_that.mp3",
		duration: "3:01",
		cover: "image.png"
	},
	{
		title: "As If It's Your Last",
		artist: "BLACKPINK",
		src: "songs/as_if_its_your_last.mp3",
		duration: "3:33",
		cover: "image.png"
	},
	{
		title: "Love Story",
		artist: "indila",
		src: "playlists/love-story.mp3",
		duration: "4:45",
		cover: "image.png"
	},
	{
		title: "Raindance (ft. Tems)",
		artist: "Tems",
		src: "playlists/raindance-ft-tems.mp3",
		duration: "3:41",
		cover: "image.png"
	},
	{
		title: "Starlight",
		artist: "hwang in yeop",
		src: "playlists/starlight.mp3",
		duration: "3:25",
		cover: "image.png"
	}
];

let tracks = [...songs, ...plyalists];
let currentTrackIndex = 0;
let autoplay = true;
let isSeeking = false;
let lastVolume = 0.8;

// DOM Elements
const audio = document.querySelector('#audio');
const playlist = document.querySelector('#playlist');
const playButton = document.querySelector('#play-button');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const progress = document.querySelector('#progress');
const volume = document.querySelector('#volume');
const muteButton = document.querySelector('#mute-button');
const autoplayButton = document.querySelector('#autoplay-button');
const songTitle = document.querySelector('#song-title');
const songTitleTrack = songTitle.querySelector('.marquee-track');
const songArtist = document.querySelector('#song-artist');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const volumeValue = document.querySelector('#volume-value');
const trackCount = document.querySelector('#track-count');
const statusMessage = document.querySelector('#status-message');
const playingBadge = document.querySelector('#playing-badge');
const fileInput = document.querySelector('#file-input');
const clearButton = document.querySelector('#clear-button');
const coverImg = document.querySelector('#cover-img');

const formatTime = (time) => {
	if (!Number.isFinite(time) || time < 0) return '0:00';
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60).toString().padStart(2, '0');
	return `${minutes}:${seconds}`;
};

function updateMarquee(viewport, text) {
	if (!viewport) return;
	const track = viewport.querySelector('.marquee-track');
	if (!track) return;
	track.textContent = text;
	viewport.classList.remove('is-marquee');
	viewport.style.removeProperty('--marquee-distance');
	viewport.style.removeProperty('--marquee-duration');

	requestAnimationFrame(() => {
		const overflow = track.scrollWidth - viewport.clientWidth;
		if (overflow <= 2) return;
		viewport.style.setProperty('--marquee-distance', `${overflow}px`);
		viewport.style.setProperty('--marquee-duration', `${Math.max(10, Math.min(22, overflow / 12))}s`);
		viewport.classList.add('is-marquee');
	});
}

function refreshAllMarquees() {
	updateMarquee(songTitle, songTitleTrack.textContent);
	document.querySelectorAll('.playlist-title').forEach((title) => {
		const trackEl = title.querySelector('.marquee-track');
		if (trackEl) updateMarquee(title, trackEl.textContent);
	});
}

window.addEventListener('resize', refreshAllMarquees);

function renderPlaylist() {
	trackCount.textContent = `${tracks.length} tracks`;
	if (!tracks.length) {
		playlist.innerHTML = '<li class="playlist-empty">Your playlist is empty.</li>';
		return;
	}

	playlist.innerHTML = tracks.map((track, index) => `
		<li class="playlist-item ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}" tabindex="0" role="button" aria-label="Play ${track.title} by ${track.artist}">
			<div class="playlist-copy">
				<h3 class="playlist-title marquee-viewport"><span class="marquee-track"></span></h3>
				<p>${track.artist}</p>
			</div>
			<span class="track-duration" data-duration="${index}">${track.duration || '--:--'}</span>
		</li>
	`).join('');

	playlist.querySelectorAll('.playlist-title .marquee-track').forEach((titleEl, index) => {
		titleEl.textContent = tracks[index].title;
	});
	refreshAllMarquees();
}

function loadTrack(index) {
	if (!tracks.length) return;

	currentTrackIndex = (index + tracks.length) % tracks.length;
	const track = tracks[currentTrackIndex];

	audio.src = track.src;
	updateMarquee(songTitle, track.title);
	songArtist.textContent = track.artist;

	if (coverImg) {
		coverImg.src = track.cover || 'image.png';
	}

	progress.value = 0;
	currentTime.textContent = '0:00';
	duration.textContent = track.duration || '0:00';
	playingBadge.textContent = 'READY';
	statusMessage.textContent = `Ready to play ${track.title} by ${track.artist}`;

	renderPlaylist();

	const activeItem = playlist.querySelector(`.playlist-item[data-index="${currentTrackIndex}"]`);
	if (activeItem) {
		activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}
}

function updatePlayButton() {
	const isPlaying = !audio.paused;
	playButton.textContent = isPlaying ? '❚❚' : '▶';
	playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
	playButton.title = isPlaying ? 'Pause' : 'Play';
	playingBadge.textContent = isPlaying ? 'PLAYING' : 'PAUSED';
}

async function togglePlay() {
	if (!tracks.length) return;
	if (!audio.src) loadTrack(currentTrackIndex);

	if (audio.paused) {
		try {
			await audio.play();
			statusMessage.textContent = `Playing: ${tracks[currentTrackIndex].title}`;
		} catch (err) {
			console.error('Play failed:', err);
			statusMessage.textContent = `Playing error: ${err.message}`;
		}
	} else {
		audio.pause();
		statusMessage.textContent = `Paused: ${tracks[currentTrackIndex].title}`;
	}
	updatePlayButton();
}

// Controls
playButton.addEventListener('click', togglePlay);

previousButton.addEventListener('click', () => {
	if (tracks.length) {
		loadTrack(currentTrackIndex - 1);
		togglePlay();
	}
});

nextButton.addEventListener('click', () => {
	if (tracks.length) {
		loadTrack(currentTrackIndex + 1);
		togglePlay();
	}
});

// Playlist Selection
playlist.addEventListener('click', (event) => {
	const item = event.target.closest('.playlist-item');
	if (!item) return;
	const index = Number(item.dataset.index);
	loadTrack(index);
	togglePlay();
});

playlist.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		event.target.click();
	}
});

// File upload support
fileInput.addEventListener('change', () => {
	const importedTracks = [...fileInput.files]
		.filter((file) => file.type.startsWith('audio/') || file.type.startsWith('video/'))
		.map((file) => ({
			title: file.name.replace(/\.[^/.]+$/, ''),
			artist: 'Local Upload',
			src: URL.createObjectURL(file),
			duration: '--:--',
			cover: 'image.png',
			local: true
		}));

	if (!importedTracks.length) return;

	tracks = [...tracks, ...importedTracks];
	const firstImportedIndex = tracks.length - importedTracks.length;
	loadTrack(firstImportedIndex);
	togglePlay();
	fileInput.value = '';
});

// Reset Playlist
clearButton.addEventListener('click', () => {
	tracks.filter((track) => track.local).forEach((track) => URL.revokeObjectURL(track.src));
	tracks = [...songs];
	audio.pause();
	loadTrack(0);
	updatePlayButton();
	statusMessage.textContent = 'Playlist reset to default songs.';
});

// Progress Bar & Scrubbing
progress.addEventListener('mousedown', () => { isSeeking = true; });
progress.addEventListener('touchstart', () => { isSeeking = true; });

progress.addEventListener('input', () => {
	if (Number.isFinite(audio.duration) && audio.duration > 0) {
		const targetTime = (progress.value / 100) * audio.duration;
		currentTime.textContent = formatTime(targetTime);
	}
});

progress.addEventListener('change', () => {
	if (Number.isFinite(audio.duration) && audio.duration > 0) {
		audio.currentTime = (progress.value / 100) * audio.duration;
	}
	isSeeking = false;
});

// Volume & Mute
volume.addEventListener('input', () => {
	audio.volume = Number(volume.value);
	lastVolume = audio.volume;
	volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
	muteButton.textContent = audio.volume === 0 ? '×' : '♬';
	muteButton.setAttribute('aria-label', audio.volume === 0 ? 'Unmute' : 'Mute');
});

muteButton.addEventListener('click', () => {
	if (audio.volume > 0) {
		lastVolume = audio.volume;
		audio.volume = 0;
	} else {
		audio.volume = lastVolume || 0.8;
	}
	volume.value = audio.volume;
	volume.dispatchEvent(new Event('input'));
});

// Autoplay Toggle
autoplayButton.addEventListener('click', () => {
	autoplay = !autoplay;
	autoplayButton.setAttribute('aria-pressed', String(autoplay));
	statusMessage.textContent = autoplay ? 'Autoplay is on.' : 'Autoplay is off.';
});

// Audio Element Event Listeners
audio.addEventListener('loadedmetadata', () => {
	duration.textContent = formatTime(audio.duration);
	const itemDuration = document.querySelector(`[data-duration="${currentTrackIndex}"]`);
	if (itemDuration) itemDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
	if (!isSeeking && audio.duration) {
		progress.value = (audio.currentTime / audio.duration) * 100;
	}
	currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('play', updatePlayButton);
audio.addEventListener('pause', updatePlayButton);

// Automatically move to the next song when current finishes
audio.addEventListener('ended', () => {
	if (autoplay && tracks.length > 0) {
		loadTrack(currentTrackIndex + 1);
		togglePlay();
	} else {
		updatePlayButton();
	}
});

audio.addEventListener('error', (e) => {
	updatePlayButton();
	console.error('Audio playback error:', e);
	statusMessage.textContent = `Error loading audio file: ${tracks[currentTrackIndex]?.src || ''}`;
});

// Spacebar Play/Pause Shortcut
document.addEventListener('keydown', (e) => {
	if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
	if (e.code === 'Space') {
		e.preventDefault();
		togglePlay();
	}
});

// Initialize
autoplayButton.setAttribute('aria-pressed', 'true');
audio.volume = Number(volume.value);
renderPlaylist();
loadTrack(0);
