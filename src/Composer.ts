
    interface autoload{
        "psr-4":{}
    }
    class ComposerConfig { 
        autoload:autoload;
    }

export default class Composer {
    /**
     * 
     */
    composer:ComposerConfig;

    public constructor(composerObj?){
        this.composer=composerObj;
    }

    hasAutoload():boolean{
        return ('autoload' in this.composer);
    }
    hasPSR4():boolean{
         return this.hasAutoload()&& ('psr-4' in this.composer['autoload']);
    }
    /**
     * Given a path, it look for the namespace that has that path as value
     * @param path 
     */
    hasPathInNamespaces(path:string){
        for (const key in this.composer.autoload["psr-4"]) {
            if (this.composer.autoload["psr-4"].hasOwnProperty(key)) {
                const element = this.composer.autoload["psr-4"][key];
                
            }
        }
    }
}