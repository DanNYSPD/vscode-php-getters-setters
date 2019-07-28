//var path= require('path');
//import path from 'path';
import * as path from 'path';
export default class Classe{
    name:string;

    includePhpTag:boolean=false;
    getName(){
        return this.name;
    }
    getSimpleName(){
       return this.name.split(path.sep).pop().split('.')[0];
    }
    setIncludePhpTag(value:boolean){
        this.includePhpTag=value;
    }

    static  autoCompleteCOntructorProperties(){

    }
}