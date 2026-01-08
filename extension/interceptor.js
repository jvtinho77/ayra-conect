(function () {
    console.log("WPP Audio Interceptor Injected ☢️");
    const originalPlay = window.Audio.prototype.play;
    window.Audio.prototype.play = function () {
        try {
            if (this.src && this.src.startsWith('blob:')) {
                console.log("Audio Play Intercepted:", this.src);
                window.dispatchEvent(new CustomEvent('WPP_AUDIO_INTERCEPTED', {
                    detail: { src: this.src }
                }));
            }
        } catch (e) { console.error("Interceptor Error:", e); }
        return originalPlay.apply(this, arguments);
    };
})();
