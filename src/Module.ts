import { Names } from "./Names";

/**
 * This class 
 */
export default class Module{

    baseName:string;
    namespace:string='';
    tab:string=`\t`;

    listDefaultParametersInRepositoryContructor:string[]=[]; //['PDO $pdo','Dj $jd']

    listDefaultParametersInControllerContructor:string[]=[];

    getDefaultParametersForRepositoryConstructor():string{
        
        return this.listDefaultParametersInRepositoryContructor.join(',');
    }
    getModuleFolderName(){
        return this.baseName+"Module";
    }
     getRepositoryName():string{
        return this.baseName+`Repository`;
    }
     getRepositoryFileName():string{
      return  this.getRepositoryName()+`.php`;
    }

    getModelName():string{
        return this.baseName+`Model`;
    }
    getModelFileName():string{
        return this.getModelName()+".php";
    }

    getControllerName():string{
        return this.baseName+`Controller`;
    }
    getControllerFileName():string{
        return this.getControllerName()+".php";
    }
    static  getTemplateForRepository(module:Module):string {
        let tab=module.tab;
        return `<?php`+`\n`
            +`namespace `+module.namespace+`;`+`\n`
            +`class `+module.getRepositoryName()+` {`+`\n`
            +tab+`public function __construct(`+module.getDefaultParametersForRepositoryConstructor()+`){`+`\n`
            +tab+``+`\n`
            +tab+`}`+`\n`
            +`}`+`\n`
            +``
        ;
    }
    static  getTemplateForModel(module:Module):string {
        let tab=module.tab;
        return `<?php`+`\n`
            +`namespace `+module.namespace+`;`+`\n`
            +`class `+module.getModelName()+` {`+`\n`
            +tab+`public function __construct(){`+`\n`
            +tab+``+`\n`
            +tab+`}`+`\n`
            +`}`+`\n`
            +``
        ;
    }
    static  getTemplateForController(module:Module):string {
        let tab=module.tab;
        return `<?php`+`\n`
            +`namespace `+module.namespace+`;`+`\n`
            +`class `+module.getControllerName()+` {`+`\n`
            +tab+`public function __construct(`+module.getRepositoryName()+` $`+Names.toLowerCamelCase(module.getRepositoryName())+`){`+`\n`
            +tab+``+`\n`
            +tab+`}`+`\n`
            +`}`+`\n`
            +``
        ;
    }
}