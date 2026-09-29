let tracks = [];

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
let currentTrackIndex = 0;
let autoplay = false;
let lastVolume = Number(volume.value);

const formatTime = (time) => {
	if (!Number.isFinite(time)) return '0:00';
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60).toString().padStart(2, '0');
	return `${minutes}:${seconds}`;
};

function updateMarquee(viewport, text) {
	const track = viewport.querySelector('.marquee-track');
	track.textContent = text;
	viewport.classList.remove('is-marquee');
	viewport.style.removeProperty('--marquee-distance');
	viewport.style.removeProperty('--marquee-duration');

	requestAnimationFrame(() => {
		const overflow = track.scrollWidth - viewport.clientWidth;
		if (overflow <= 1) return;
		viewport.style.setProperty('--marquee-distance', `${overflow}px`);
		viewport.style.setProperty('--marquee-duration', `${Math.max(10, Math.min(22, overflow / 12))}s`);
		viewport.classList.add('is-marquee');
	});
}

function refreshAllMarquees() {
	updateMarquee(songTitle, songTitleTrack.textContent);
	document.querySelectorAll('.playlist-title').forEach((title) => updateMarquee(title, title.querySelector('.marquee-track').textContent));
}

window.addEventListener('resize', refreshAllMarquees);

function renderPlaylist() {
	trackCount.textContent = `${tracks.length} tracks`;
	if (!tracks.length) {
		playlist.innerHTML = '<li class="playlist-empty">Your playlist is empty. Add audio files from your device to start listening.</li>';
		return;
	}
	playlist.innerHTML = tracks.map((track, index) => `
		<li class="playlist-item ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}" tabindex="0" role="button" aria-label="Play ${track.title} by ${track.artist}">
			<div class="playlist-copy"><h3 class="playlist-title marquee-viewport"><span class="marquee-track"></span></h3><p>${track.artist}</p></div>
			<span class="track-duration" data-duration="${index}">--:--</span>
		</li>`).join('');
	playlist.querySelectorAll('.playlist-title .marquee-track').forEach((title, index) => { title.textContent = tracks[index].title; });
	refreshAllMarquees();
}

function loadTrack(index) {
	if (!tracks.length) {
		audio.removeAttribute('src');
		updateMarquee(songTitle, 'No tracks yet');
		songArtist.textContent = 'Add music from your device';
		playingBadge.textContent = 'EMPTY';
		statusMessage.textContent = 'Choose Add music to build your playlist.';
		renderPlaylist();
		return;
	}
	currentTrackIndex = (index + tracks.length) % tracks.length;
	const track = tracks[currentTrackIndex];
	audio.src = track.src;
	updateMarquee(songTitle, track.title);
	songArtist.textContent = track.artist;
	progress.value = 0;
	currentTime.textContent = '0:00';
	duration.textContent = '0:00';
	playingBadge.textContent = 'READY';
	statusMessage.textContent = `Ready to play ${track.title}.`;
	renderPlaylist();
}

function updatePlayButton() {
	const isPlaying = !audio.paused;
	playButton.textContent = isPlaying ? '❚❚' : '▶';
	playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
	playButton.title = isPlaying ? 'Pause' : 'Play';
	playingBadge.textContent = isPlaying ? 'PLAYING' : 'PAUSED';
}

async function togglePlay() {
	if (!tracks.length) {
		statusMessage.textContent = 'Add an audio file before pressing play.';
		return;
	}
	if (!audio.src) loadTrack(currentTrackIndex);
	if (audio.paused) {
		try { await audio.play(); } catch { statusMessage.textContent = 'Add a valid audio file in the audio folder to play this track.'; }
	} else audio.pause();
}

playButton.addEventListener('click', togglePlay);
previousButton.addEventListener('click', () => { if (tracks.length) { loadTrack(currentTrackIndex - 1); togglePlay(); } });
nextButton.addEventListener('click', () => { if (tracks.length) { loadTrack(currentTrackIndex + 1); togglePlay(); } });

playlist.addEventListener('click', (event) => {
	const item = event.target.closest('.playlist-item');
	if (!item) return;
	loadTrack(Number(item.dataset.index));
	togglePlay();
});

playlist.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter' && event.key !== ' ') return;
	event.preventDefault();
	event.target.click();
});

fileInput.addEventListener('change', () => {
	const importedTracks = [...fileInput.files]
		.filter((file) => file.type.startsWith('audio/'))
		.map((file) => ({
			title: file.name.replace(/\.[^/.]+$/, ''),
			artist: 'Local file',
			src: URL.createObjectURL(file),
			local: true
		}));
	if (!importedTracks.length) {
		statusMessage.textContent = 'Please choose an audio file such as MP3, WAV, or M4A.';
		return;
	}
	const hadTracks = tracks.length > 0;
	tracks = hadTracks ? [...tracks, ...importedTracks] : importedTracks;
	const firstImportedIndex = tracks.length - importedTracks.length;
	loadTrack(firstImportedIndex);
	statusMessage.textContent = `${importedTracks.length} song${importedTracks.length === 1 ? '' : 's'} added to your playlist.`;
	fileInput.value = '';
});

clearButton.addEventListener('click', () => {
	tracks.filter((track) => track.local).forEach((track) => URL.revokeObjectURL(track.src));
	tracks = [];
	audio.pause();
	loadTrack(0);
	updatePlayButton();
});

progress.addEventListener('input', () => {
	if (Number.isFinite(audio.duration)) audio.currentTime = (progress.value / 100) * audio.duration;
});

volume.addEventListener('input', () => {
	audio.volume = Number(volume.value);
	lastVolume = audio.volume;
	volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
	muteButton.textContent = audio.volume === 0 ? '×' : '♬';
	muteButton.setAttribute('aria-label', audio.volume === 0 ? 'Unmute' : 'Mute');
});

muteButton.addEventListener('click', () => {
	if (audio.volume > 0) { lastVolume = audio.volume; audio.volume = 0; } else audio.volume = lastVolume || 0.8;
	volume.value = audio.volume;
	volume.dispatchEvent(new Event('input'));
});

autoplayButton.addEventListener('click', () => {
	autoplay = !autoplay;
	autoplayButton.setAttribute('aria-pressed', String(autoplay));
	statusMessage.textContent = autoplay ? 'Autoplay is on.' : 'Autoplay is off.';
});

audio.addEventListener('loadedmetadata', () => {
	duration.textContent = formatTime(audio.duration);
	const itemDuration = document.querySelector(`[data-duration="${currentTrackIndex}"]`);
	if (itemDuration) itemDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
	if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
	currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('play', updatePlayButton);
audio.addEventListener('pause', updatePlayButton);
audio.addEventListener('ended', () => {
	if (autoplay) { loadTrack(currentTrackIndex + 1); togglePlay(); } else updatePlayButton();
});
audio.addEventListener('error', () => {
	updatePlayButton();
	statusMessage.textContent = 'Audio file not found. Add your MP3 file to the audio folder and update script.js.';
});

audio.volume = Number(volume.value);
renderPlaylist();
loadTrack(0);
