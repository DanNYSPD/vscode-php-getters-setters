
    interface autoload{
        "psr-4":{}
    }
    class ComposerConfig { 
        autoload:autoload;
    }
import * as path from 'path';
import PathUtils from './PathUtils';
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
    hasPathInNamespaces(modulePath:string){
        for (const key in this.composer.autoload["psr-4"]) {
           
                /*
                *the path separator in the composer is alwasys "/", but this separator could fail on windows where the sep is '\',
                *so I need to tranform this separator
                */
                let namespacePath = this.composer.autoload["psr-4"][key];
                
                if(modulePath.includes(path.sep)){
                    
                    //entonces el separador es el mismo
                    namespacePath= PathUtils.normalizePath(namespacePath);
                    //if nanmespace doesn't start with separator(which is allwasy actually) and the module path does, add the separator so both will have the same uri
                    if(!namespacePath.startsWith(path.sep) && modulePath.startsWith(path.sep)){
                        namespacePath=path.sep+namespacePath;
                    }
                    //by logic if module is created in a subfilder of a defined namesace path, the module path is longer that the namespace math,
                    const differAt=PathUtils.getIndexOfDifference(namespacePath,modulePath);
                    //if the differ position is equal that the lenght that the nameascePath, that means that every char in both string matched until that char position
                    //so
                    if(PathUtils.haveSameRoot(namespacePath,modulePath)){//this means have the same root
                        let residuosPath=modulePath.substr(namespacePath.length);
                        
                        //the namespaces are always separated with \\ so i need to chane
                        //return key;//key is the namespace
                        if(key.endsWith("\\")&&residuosPath.startsWith("\\")){
                            return key+residuosPath.substring(1);
                        }
                        return key+residuosPath;
                    }
                }else{

                }
                console.log(namespacePath);
           
        }
    }
    getFileFromNamespace(namespace:string):string{
        for (const key in this.composer.autoload["psr-4"]) {
            /*
                *the path separator in the composer is alwasys "/", but this separator could fail on windows where the sep is '\',
                *so I need to tranform this separator
                */
               let namespacePath = this.composer.autoload["psr-4"][key];
               //the path is where the namespace starts to resolve
               
               if(namespace.startsWith(key)){
                   //in theory the received namespace will be at least the same length or more than the declared namespace in the composer file.
                namespacePath= PathUtils.normalizePath(namespacePath);
                let indexDifference=PathUtils.getIndexOfDifference(key,namespace);
                let differ=namespace.substr(indexDifference,namespace.length-indexDifference);
                return path.join(namespacePath,differ)
              //  return this.composer.autoload["psr-4"][key]   ;
               }
        }
        return '';
    }
}