function getHeight() {
	let elemHeight = 0;
	const element = document.querySelector('#primary');
	const elemRect = element.getBoundingClientRect();
	elemHeight = elemRect.height;
	return elemHeight;
}

function sendHeight() {
	const iframeHeight = getHeight();
	const targetOrigin = getTargetOrigin();
	const data = { iframeHeight: iframeHeight };
	window.parent.postMessage(data, targetOrigin);
}

window.addEventListener('load', sendHeight);
window.addEventListener('resize', sendHeight);
