interface VocalQueue {
	source: Howl
	callBack: Function
}

const audioPath = 'resources/audios'

export class AudioManager {
	private audioSourceMap: Map<string, Howl> = new Map();
	private bgm: Howl = null;
	private effectMap: Map<string, Howl> = new Map();
	private vocalMap: Map<string, Howl> = new Map();
	private vocalQueue: VocalQueue[] = [];

	public bgmVolume: number = 1;
	public soundVolume: number = 1;
	public isMute: boolean = false;

	private isHtmlFocus: boolean = true;
	private audioNode: cc.Node = null;

	constructor() {
		this.init({ bgmVolume: 1, soundVolume: 1 });
		window.addEventListener("focus", () => this.setHtmlFocus(true));
		window.addEventListener("blur", () => this.setHtmlFocus(false));
		this.setHtmlFocus(document.hasFocus());
	}

	public setHtmlFocus(isHtmlFocus: boolean) {
		this.isHtmlFocus = isHtmlFocus;
		if(isHtmlFocus) {
			this.setBGMVolume(this.bgmVolume, false);
			this.setEffectVolume(this.soundVolume, false);
		} else {
			this.setBGMVolume(0, false);
			this.setEffectVolume(0, false);
		}
	}

	public init(prop: {bgmVolume: number, soundVolume: number}) {
		this.setBGMVolume(prop.bgmVolume);
		this.setEffectVolume(prop.soundVolume);
	}

	public setNode() {
		this.audioNode = cc.find("audioNode", cc.director.getScene().getChildByName("Canvas"));
	}

	public setBGMVolume(volume: number, assign: boolean = true): void {
		assign && (this.bgmVolume = volume);
		if (this.bgm) {
			this.bgm.volume(volume);
		}
	}

	public setMute(mute: boolean) {
		this.audioNode && cc.Tween.stopAllByTarget(this.audioNode);

		this.isMute = mute;
		let vol = mute ? 0 : 1;
		audioManager.setBGMVolume(vol);
        audioManager.setEffectVolume(vol);
	}

	public setEffectVolume(volume: number, assign: boolean = true): void {
		assign && (this.soundVolume = volume);
		this.effectMap.forEach((audio) => {
			audio.volume(volume)
		});
		this.vocalMap.forEach((audio) => {
			audio.volume(volume)
		});
	}

	public playEffect(key: string, loop = false): number { 
		const volume = !this.isHtmlFocus ? 0 : this.soundVolume; 
		let source = this.getAudioSource(key); 
		if (!this.effectMap.get(key)) { 
			this.effectMap.set(key, source); 
		} 
		source.volume(volume); 
		source.loop(loop); 
		return source.play(); 
	} 

	public stopEffect(key: string, id?: number): void {
		let source = this.getAudioSource(key);
		source && source.stop(id);
	}

	public stopAllEffect(): void {
		this.vocalQueue = [];
		this.vocalMap.forEach((audio) => {
			audio.off('end');
			audio.stop();
		});
	
		this.effectMap.forEach((audio) => {
			audio.stop();
		});
	}

	public playVocal(key: string, language: string = "", loop = false, callBack?: Function): void { 
		const volume = !this.isHtmlFocus ? 0 : this.soundVolume; 
		let source = this.getAudioSource(key, language); 
		if (!this.vocalMap.get(key)) { 
			this.vocalMap.set(key, source); 
			source.volume(volume); 
		} 
		if(volume > 0) { 
			source.loop(loop); 
			this.setVocalEvent(source, callBack); 
			return; 
		} 
		typeof(callBack) === "function" &&  callBack(); 
	} 

	public playBGM(key: string): void { 
		const volume = !this.isHtmlFocus ? 0 : this.bgmVolume; 
		let source = this.getAudioSource(key);
		if(this.bgm) { 
			if(source === this.bgm) { 
				source.volume(volume); 
				return; 
			} 
			this.bgm.stop(); 
		} 
		this.bgm = source;
		source.volume(volume);
		source.loop(true);
		source.play();
	} 

	public stopBGM(): void {
		this.bgm && this.bgm.volume(0);
	}

	public fadeInBGM(time: number): void {
		if(this.isMute){
			return;
		}
		cc.Tween.stopAllByTarget(this.audioNode);
		if(!this.isHtmlFocus){
			this.bgmVolume = 1;
			return;
		}
		cc.tween(this.audioNode).to(time, {scale: -this.audioNode.scale}, {
			progress: (start, end, current, ratio:number ) =>{
				audioManager.setBGMVolume(1 * ratio);
			}})
			.start();
	}

	public fadeOutBGM(time: number): void {
		if(this.isMute){
			return;
		}
		cc.Tween.stopAllByTarget(this.audioNode);
		if(!this.isHtmlFocus){
			this.bgmVolume = 0;
			return;
		}
		cc.tween(this.audioNode).to(time, {scale: -this.audioNode.scale}, {
			progress: (start, end, current, ratio:number ) =>{
				audioManager.setBGMVolume(1 - (1 * ratio));
			}})
			.start();
	}

	private getAudioSource(key: string, language: string = "", html5 = false): Howl {
		const name = language === "" ? key : `${language}-${key}`; 
		let source = this.audioSourceMap.get(name); 
		if(!source) { 
			source = new Howl({ src: cc.url.raw(`${audioPath}/${name}.mp3`) }); 
			html5 && (source = new Howl({ src: cc.url.raw(`${audioPath}/${name}.mp3`), html5: true }));
			this.audioSourceMap.set(name, source); 
		} 
		return source; 
	} 
	
	/**
	 * 讓ios的靜音模式下可以播放音頻 (預播一個無聲音檔 html5 set true)
	 */
	silentPlay() {
		const audioSource = this.getAudioSource("silent", "", true);
		audioSource.play()	
		audioSource.stop();
	}
	
	private setVocalEvent(source: Howl, callBack: Function): void {
		const finish = () => {
			callBack && callBack()
			source.off('end');
			this.vocalQueue.shift()
			if (this.vocalQueue.length > 0) {
				this.vocalQueue[0].source.play()
			}
		}
		source.on('end', finish)
		if (this.vocalQueue.length === 0) {
			this.vocalQueue.push({ source: source, callBack: callBack })
			source.play()
		} else {
			this.vocalQueue.push({ source: source, callBack: callBack })
		}
	}

}
export const audioManager = new AudioManager();

window["audioManager"] = audioManager;
