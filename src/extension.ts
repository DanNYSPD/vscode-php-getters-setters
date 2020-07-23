'use strict';

import * as vscode from 'vscode';
import Redirector from "./Redirector";
import Property from "./Property";
import Configuration from "./Configuration";
import TemplatesManager from './TemplatesManager';
import Constant from './Constant';
import Classe   from './Classe';
import DocumentUtils from './DocumentUtils';
import { fstat } from 'fs';

import * as path from 'path';
import * as fs from 'fs';
import Module from './Module';
import { Names } from './Names';
import Composer from './Composer';
import PathUtils from './PathUtils';
import Functions from './FunctionDefinition';
import FunctionDefinition from './FunctionDefinition';
import Router from './Extras/PHP/Router';
import AxiosConsumer from './Extras/Consumers/AxiosConsumer';
import GenerateTemplate from './Extras/GenerateTemplateFromText/GenerateTemplate';
import { RelativePattern } from 'vscode';
import StringUtils from './StringUtils';
import ResolveNamespace from './Extras/PHP/ResolveNamespace';
import { FILE } from 'dns';
import JsonToPhp from './Extras/PHP/JsonToPhp';
import TextTransforms from './Extras/PHP/TextTransforms';
import EndPoint from './Extras/EndPoint';

//import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient'

class Resolver {
    config: Configuration;
    templatesManager: TemplatesManager;

    /**
     * Types that won't be recognised as valid type hints
     */
    pseudoTypes = ['mixed', 'number', 'callback', 'object', 'void'];

    public constructor()
    {
        const editor = this.activeEditor();

        if (editor.document.languageId !== 'php') {
            throw new Error('Not a PHP file.');
        }

        this.config = new Configuration;
        this.templatesManager = new TemplatesManager;
    }


      activeEditor() {
/*
        const conf = vscode.workspace.getConfiguration('php')
    const executablePath =
        conf.get<string>('executablePath') ||
        conf.get<string>('validate.executablePath') ||
        (process.platform === 'win32' ? 'php.exe' : 'php')

    const memoryLimit = conf.get<string>('memoryLimit') || '4095M'

    let client: LanguageClient*/

        //hasta aqui es lo que tenia por defecto
        return vscode.window.activeTextEditor;
    }

    closingClassLine() {        
        const editor = this.activeEditor();
        //search starting by the last }, which in a PHP oriented style means that the last } is the end of class.
        for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
            const line = editor.document.lineAt(lineNumber);
            const text = line.text.trim();

            if (text.startsWith('}')) {
                return line;
            }
        }

        return null;
    }
    openingClassLine() {
        const editor = this.activeEditor();
        //search starting by the last }, which in a PHP oriented style means that the last } is the end of class.
        for (let lineNumber =0; lineNumber <  editor.document.lineCount; lineNumber++) {
            const line = editor.document.lineAt(lineNumber);
            const text = line.text.trim();

            if (text.includes('{')) {
                return line;
            }
        }

        return null;
    }
    insertGetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertGetterAndSetter(){
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property) + this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertSetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }
    insertHasser() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                property = Property.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.hasserTemplate(property);
        }
        this.renderTemplate(content);
    }
    insertCount() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                property = Property.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.CounterTemplate(property);
        }
        this.renderTemplate(content);
    }
    insertIsConstant() {
        const editor = this.activeEditor();
        let constant = null;
        let content = '';
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                constant = Constant.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            //content += this.constantTemplate(constant);
        }
        this.renderTemplate(content);
    }
    insertIsConstantv2() {
        const editor = this.activeEditor();
        let constants:Constant[] = null;
        let content = '';
        let property:Property = null;
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                property = Property.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            //obtengo la propiedad actual
            constants = Constant.getConstants(editor.document)
            vscode.window.showQuickPick(constants.map(x=>x.getName())).then(selected=>{
                //now that I have the property and the constant selected, I will render the template
                console.log(selected)
                let constantObj= constants.find(x=>x.getName()==selected);
                
                content += this.constantTemplate(constantObj,property);
                this.renderTemplate(content);
            })
            
            
        }
       
    }
    constantTemplate(prop:Constant,property:Property) {
        const name = prop.getName();
        const camelCaseName=Names.toCamelCase(name);
        //const description = prop.getDescription();
        const description = "Check if the property is(has the value of the constant:"+prop.getName()+")";
        const tab = prop.getIndentation();
        const type = "boolean";
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');
        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));
            return template(prop);
        }
        return (`\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.getIsConstantDescription(property) + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + type + `\n` : ``)
            + tab + ` */ \n`
           // + tab + `public function is${property.getPascalCaseName()}${camelCaseName}():bool\n`
            + tab + `public function ${prop.getIsConstantFunctionName(property)}():bool\n`
            + tab + `{\n`
            //+ tab + tab + `return !empty($this->` + name + `);\n`
            + tab + tab + `return self::${prop.getName()}==\$this->${property.getName()};\n`
            + tab + `}\n`);
    }
    hasserTemplate(prop:Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');
        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));
            return template(prop);
        }
        return (`\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.hasserDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + `bool` + `\n` : ``)
            + tab + ` */ \n`
            + tab + `public function ` + prop.hasserName() + `():bool\n`
            + tab + `{\n`
            + tab + tab + `return !empty($this->` + name + `);\n`
            + tab + `}\n`);
    }
    CounterTemplate(prop:Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');
        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));
            return template(prop);
        }
        return (`\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.counterDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + `int` + `\n` : ``)
            + tab + ` */ \n`
            + tab + `public function ` + prop.counterName() + `():int\n`
            + tab + `{\n`
            + tab + tab + `return count($this->` + name + `);\n`
            + tab + `}\n`);
    }
    getterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        return  (
            `\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.getterDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + type + `\n` : ``)
            + tab + ` */\n`
            + tab + `public function ` + prop.getterName() + `()\n`
            + tab + `{\n`
            + tab + tab + `return $this->` + name + `;\n`
            + tab + `}\n`
        );
    }

    setterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const typeHint = prop.getTypeHint();
        const spacesAfterParam = Array(this.config.getInt('spacesAfterParam', 2) + 1).join(' ');
        const spacesAfterParamVar = Array(this.config.getInt('spacesAfterParamVar', 2) + 1).join(' ');
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');

        const templateFile = this.config.get('setterTemplate', 'setter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        return (
            `\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.setterDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @param` + spacesAfterParam + type + spacesAfterParamVar + `$` + name + (description ? `  ` + description : ``) + `\n` : ``)
            + tab + ` *\n`
            + tab + ` * @return` + spacesAfterReturn + `self\n`
            + tab + ` */\n`
            + tab + `public function ` + prop.setterName() + `(` + (typeHint ? typeHint + ` ` : ``) + `$` + name + `)\n`
            + tab+ `{\n`
            + tab + tab + `$this->` + name + ` = $` + name + `;\n`
            + `\n`
            + tab + tab + `return $this;\n`
            + tab + `}\n`
        );
    }
    insertClass() {
        const editor = this.activeEditor();
        let classe = null;
        let content = '';
        let name=editor.document.fileName;
        let line1=editor.document.lineAt(0);
         

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                classe =new Classe();
                classe.name=name;
                if(line1.isEmptyOrWhitespace){
                    classe.setIncludePhpTag(true);
                }
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.classTemplate(classe);
        }
        this.renderTemplate(content);
    }
    classTemplate(classe:Classe){
     
       const tab='\t';
        const spacesAfterParam = Array(this.config.getInt('spacesAfterParam', 2) + 1).join(' ');
        const spacesAfterParamVar = Array(this.config.getInt('spacesAfterParamVar', 2) + 1).join(' ');
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');

        const templateFile = this.config.get('setterTemplate', 'setter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(classe);
        }
        return (
            `\n`
            + tab + (classe.includePhpTag?`<?`:``)
            +`\n`
            + tab + `/**\n`
            + tab + ` *\n`
            + tab + ` *\n`
            + tab + ` **/\n`
            + tab + `  class ` + classe.getSimpleName() + `{\n`
           
            + `\n`            
            + tab 
            + `}\n`
        );
        
    }
    insertConstructorProperties(){
        const editor = this.activeEditor();

        editor.document.lineCount
        var i=0;
        var constructorFounded;
        var lstparameters:string[]=[];

        var lineConstructorNumber=-1;
        while(constructorFounded!=true){
            var line=editor.document.lineAt(i);

            if(line.text.includes("__construct")){
                lineConstructorNumber=i;
                constructorFounded=true;
               var constructArr= line.text.split("__construct");
              const parameters= constructArr[1].trim() ;//contendria los parametros
                if(parameters.includes('(')&&parameters.includes(')')){
                    //this means that the constuctor signature is in one single line.
                    let beginning=parameters.indexOf('(')+1;
                    let last=parameters.indexOf(')');
                    lstparameters=parameters.substr(beginning,last-beginning).split(',');


                }else{
                    ///support for multiline constructor added!
                    //here I will search until the next ) which will close the signature.
                    let j=i+1;//start in the next line
                    let foundedNextChar=false;
                    let signatureMethod='';
                    while(!foundedNextChar){
                        if(j>=editor.document.lineCount){
                            console.info("limit reached!");
                            break;
                        }
                        /**
                         * note: the method end can be "){",")" in the same line that the last parameter or in a empty line
                         * # scenary with same line
                         * -----------------------
                         * | ..$pa){
                         * ---------------------------------------
                         * # in a empty line
                         * --------------- 
                         * | $pa
                         * | ){
                         * ------------------
                         * # the classic 
                         * -----------------------
                         * |.. $pa)
                         * |{
                         * --------------
                         */
                        if(editor.document.lineAt(j).text.includes(')')){
                            foundedNextChar=true;
                        }
                        signatureMethod+=editor.document.lineAt(j).text;
                        j++;
                    }
                    if(foundedNextChar){
                        signatureMethod=signatureMethod.replace(")",'').replace("{",'');
                        //now I split the parameters
                        lstparameters=signatureMethod.split(',');
                    }
                }

            }

            i++;
            //considerar arrojar error de __construct not found
        }
        //I get the propierties
        let lstProperties=  Property.getProperties(editor.document);
        //now I process the paramters list
        var lstparametersObj:Property[]=[];
        lstparameters.forEach(element => {
            element=element.trim();
            var ind=element.indexOf(' ')//i will search if there is a space (this means that there is two words, so there is a type and a name)
            if(ind>=0){
                var eles=element.split(' ');
                var p= new Property(eles[1].substr(1)); //removes the $ symbol
                p.setType(eles[0])
                lstparametersObj.push(p);
            }else{
                lstparametersObj.push(new Property(element.substr(1)));//removes the $ symbol
            }
        });
      
        //start creating the templates for the class properties
        let template='';
        lstparametersObj.forEach(element => {
            if(lstProperties.find(x=>x==element.getName())){
                return;
            }

           const tab='\t';

           template+=
            tab+ `/**\n`+
            tab +`*\n`+
            tab+`*`+(element.getType()?` @var `+element.getType():``)+`\n`+
            tab+`*/\n`+
            tab+`public $`+element.getName()+`;`+
            tab+`\n`;
           
        });



        let constructorBodybegining=DocumentUtils.searchFirts('{',lineConstructorNumber,editor.document)
        let constructorBodyEnd=DocumentUtils.searchFirts('}',constructorBodybegining,editor.document)
        let listPropertiesInConstructorThatAreClassProperties=Property.getPropertiesInsideFunctionThatAreClassProperties(constructorBodybegining,constructorBodyEnd,editor.document);

        let templateAsingation='';
        let counterFoundProperties=0;
        lstparametersObj.forEach(element=>{

            if(listPropertiesInConstructorThatAreClassProperties.find(x=>x==element.getName())){    
                counterFoundProperties++;
                return;
            }

           const tab='\t';
           templateAsingation+=''+
           tab+` $this->`+element.getName()+`=$`+element.getName()+`;`+`\n`
           tab+`\n`;
          
       });
       
       if(!template){
           template='';
       }
       let lineNumberBeginning=this.openingClassLine();
       /*
       this.renderTemplate(template,lineNumberBeginning.lineNumber+1).then(success=>{
            this.renderTemplate(templateAsingation,constructorBodybegining+1);
       })*/
       //i change the order because if I add first the class propertie then the constructor number line will change and the reference that i have will be obsolete
       if(counterFoundProperties==lstparametersObj.length){
        //this means all the constructor parameters have asigments inside the constructor so there is no need to create a template
        this.showInformationMessage("All the constructor parameters are assigned")
      
    }else{
        this.renderTemplate(templateAsingation,constructorBodybegining+1).then(success=>{
            this.renderTemplate(template,lineNumberBeginning.lineNumber+1);
            }) 
    }
       //this.renderTemplate(templateAsingation,constructorBodybegining+1).then(success=>{
        this.renderTemplate(template,lineNumberBeginning.lineNumber+1);
       // })
    }

    renderTemplate(template: string,lineNumber?:number) {
        if (!template) {
            this.showErrorMessage('Missing template to render.');
            return;
        }
        if(!lineNumber){
            let insertLine = this.insertLine();
            
            if (!insertLine) {
                this.showErrorMessage('Unable to detect insert line for template.');
                return;
            }
            lineNumber=insertLine.lineNumber;
        }
        const editor = this.activeEditor();
        let resolver = this;

     return   editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                new vscode.Position(lineNumber, 0),
                template
            );
        }).then(
            success => {
                if (resolver.isRedirectEnabled() && success) {
                    const redirector = new Redirector(editor);
                    //redirector.goToLine(this.closingClassLine().lineNumber - 1);
                    redirector.goToLine(lineNumber);
                }
            },
            error => {
                this.showErrorMessage(`Error generating functions: ` + error);
            }
        );
        
    }

    insertLine() {
        return this.closingClassLine();
    }

    isRedirectEnabled() : boolean {
        return true === this.config.get('redirect', true);
    }

    showErrorMessage(message: string) {
        message = 'phpGettersSetters error: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showErrorMessage(message);
    }

    showInformationMessage(message: string) {
        message = 'phpGettersSetters info: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showInformationMessage(message);
    }

    addModule(value){
         //let addModule = vscode.commands.registerCommand('phpGettersSetters.addModule', (uri:vscode.Uri) => {
        //console.log(uri.fsPath);
        console.log(value)
        let d: vscode.InputBoxOptions={
            
            placeHolder: "Enter the module name please",
        };

        vscode.window.showInputBox(undefined,undefined).then((valuein)=>{
            console.log(""+valuein);
            console.log(value.path)
            
            let m= new Module();
            m.baseName=valuein;
          //let folderModule=  path.join(value.path,valuein)
          let folderModule=  path.join(value.fsPath,m.getModuleFolderName()) //at least at windows I have to use fsPath
          if(!fs.existsSync(folderModule)){
            fs.mkdir(folderModule,function(err:NodeJS.ErrnoException){
                if(err){
                    console.error(err)
                }else{
                    //everything was ok , so now I have to create the clases
                    
                    let composerFileName=path.join(vscode.workspace.rootPath,'composer.json');//https://code.visualstudio.com/api/references/vscode-api#workspace
                    let composer=null;
                    if(fs.existsSync(composerFileName)){
                        let rawdata = fs.readFileSync(composerFileName,'utf8');
                        composer = JSON.parse(rawdata);
                    }
                    let ComposerObj= new Composer(composer);
                    let resolvedNamespace='';
                    if(composer && ComposerObj.hasPSR4()){
                        //debo remover la parte del root 
                        let root=vscode.workspace.rootPath;
                        
                        let indexTheyDiffer=PathUtils.getIndexOfDifference(root,folderModule);
                        let subfolder=folderModule.substr(indexTheyDiffer);
                        resolvedNamespace= ComposerObj.hasPathInNamespaces(subfolder);
                        console.log(subfolder);
                        console.log(resolvedNamespace);
                    }

                    //in the future this must be readed from a config file, something like "predefinedRepositoryContructorParams" 
                    m.listDefaultParametersInRepositoryContructor.push("PDO $pdo");
                    m.namespace=resolvedNamespace;
                    let templateRepo=Module.getTemplateForRepository(m);
                    let templateModel=Module.getTemplateForModel(m);
                    let templateController=Module.getTemplateForController(m);

                    let realPathRepo=path.join(folderModule,m.getRepositoryFileName());
                    let realPathModel=path.join(folderModule,m.getModelFileName());
                    let realPathController=path.join(folderModule,m.getControllerFileName());


                    fs.writeFileSync(realPathRepo,templateRepo);
                    fs.writeFileSync(realPathModel,templateModel);
                    fs.writeFileSync(realPathController,templateController);
                }
            });
          }

          //now i can create the files  
        });
    }
    /**
     * Adds a selected method to its Controller.
     * For example, we have a BookRepository and we are positioned at some method, if this command is called then a method with the same name
     * will be added in the controller BookController only if one with the same name doesn't exists.
     * 
     * Aditional feactures: inside this new created method, a call to this repository will be added too. 
     */
    addMethodToController(){
        let editor=this.activeEditor();

        let line =editor.document.lineAt(editor.selection.active.line)
        if(!line.text.includes("function")){
            this.showErrorMessage("No es una funcion");
            return;



        }
        if(!editor.document.fileName.toUpperCase().includes("REPOSITORY")){
            this.showErrorMessage("No es una clase Repo");
            return;

        }
        //in this point I need to found its Controller. which has the same base name
        let index=editor.document.fileName.toUpperCase().indexOf("REPOSITORY");
        let subName =editor.document.fileName.substr(0,index)+"Controller.php";

        if(!fs.existsSync(subName)){
            this.showErrorMessage("Doenn't exists its controller:"+subName);
            return;
        }
        //if it exist now i will have to inspect all its methods

        let content=fs.readFileSync(subName,'utf8');
        let functionNames=Functions.getAllFunctionsNameFromAClassFile(content);
        
        let functionName=FunctionDefinition.getFunctionNameSingleLine(line.text);
       let founded=  functionNames.find(x=>x.name==functionName)
       if(founded){
            this.showErrorMessage("Function: " +functionName+" already exist!")
            return;
       }
       //if it's null, I must add the method
       // console.info("es una function");
        console.info(line.text);
        const functionDef=new FunctionDefinition();
        functionDef.name=functionName;
       //i save the curren file Name(After I will used to search if it is inside its controller class defined as a propertie)
       let clase = new Classe();
       clase.name=editor.document.fileName;
       
       let propertieName=editor.document.fileName;
       propertieName= propertieName.substr(propertieName.lastIndexOf(path.sep)+1);
       propertieName= propertieName.substr(0,propertieName.indexOf('.'));

        //I must change to the editing file
        //vscode.extensions.getExtension.

        let uri:vscode.Uri = vscode.Uri.parse(subName);
        //with this I change to the controller    
        vscode.workspace.openTextDocument(subName).then((some)=>{
            
            //console.info(some);
            //with this I change the activeTextEditor, in this case to the controller   
            vscode.window.showTextDocument(some).then(val=>{
                /*falta ver si tiene propiedad con el nombre de la clase en lowercase, si es asi, 
                *agragar dentro de este metodo la llamada a esta
                */
              let propertiesController= Property.getProperties(some);

             let foundProperty= propertiesController.find(x=>x==Names.toLowerCamelCase( propertieName));
                
                let tem=foundProperty?`$this->`+Names.toLowerCamelCase(propertieName)+`->`+functionName+`();`:``;
                this.renderTemplate(FunctionDefinition.getTemplateMethod(functionDef,tem));
                this.showInformationMessage("Function: "+functionDef.name+" added!")   
            })
            
        });
        
    }

    generateClientForApi(){
        let active=this.activeEditor();
        if(!active.document.fileName.toUpperCase().includes('ROUTE')){
            this.showErrorMessage("this file doesn't seem to be a valid router file");
            return;
        }
       let endpoints=  Router.readRoutes(active.document);
        //depending on the client type generate the client(axios, curl, phpCurl, httpOkClient(java), my own c# client,etc)
        let template='';
        endpoints.forEach(x=>{
            
            template+=AxiosConsumer.getTemplate(x);
        });
        let options:vscode.InputBoxOptions={
            value:active.document.fileName//active.document.fileName.lastIndexOf(path.sep)
        };
        vscode.window.showInputBox(options,undefined).then((valuein)=>{
            //this.renderTemplate(template);
            if(!fs.existsSync(valuein)){
                fs.writeFile(valuein,template,function(err){
                    if(!err){
                        this.showInformationMessage("Custumer Created")
                    }
                })
            }else{
                this.showErrorMessage(`File `+valuein+` already exists`);
            }
        });
        
    }
    generateTemplateFor(){
        let active=this.activeEditor();

        vscode.window.showQuickPick(['vs','snippet']).then(value=>{
            console.log(value)
            let text;
            if(value=='vs'){
                 text=GenerateTemplate.generateForVs(active.document.getText(active.selection));
            }else{
                text=GenerateTemplate.generateTemplateForSnippet(active.document.getText(active.selection));

            }
            console.log(text);
            vscode.window.showInputBox({value:vscode.workspace.rootPath}).then(path=>{
                if(!fs.existsSync(path)){
                    fs.writeFile(path,text,err=>{
                        if(!err){
                            this.showInformationMessage("Snippet creaded at "+path)
                        }else{
                            this.showErrorMessage(err.message+"no:"+err.errno)
                        }
                    })
                }else{
                    this.showErrorMessage("Archivo existe")
                }
            })
        });

       
    }
    listRoutesAndGo(){


          let routePath=''
            let routerPaths=[];
            
            let projectPathCOnfig=path.join(vscode.workspace.rootPath,"project.json");
            if(!fs.existsSync(projectPathCOnfig)){
                if(!fs.existsSync(routePath)){
                
                    this.showErrorMessage("Path doesnt exist"+routePath+"or "+projectPathCOnfig+"either")
                }
                routePath= vscode.workspace.rootPath+path.sep +"appconfig"+path.sep+"routes.php";
                routerPaths.push(routePath);
            }else
            {
                let file=fs.readFileSync(projectPathCOnfig,'utf8');
                let config=JSON.parse(file);
                routePath='';
                if(config.routes){
                    config.routes.forEach(relativePathToProjectRoot => {
                        relativePathToProjectRoot=PathUtils.normalizePath(relativePathToProjectRoot);
                        routePath=  path.join(vscode.workspace.rootPath,relativePathToProjectRoot);
                        routerPaths.push(routePath);
                    });
                    
                    
                }
            }
            let endpoints=[];
            let paths=[];
            routerPaths.forEach(routePathItem => {
                let content=fs.readFileSync(routePathItem,'utf8');
                endpoints=endpoints.concat(Router.readFromFile(content));
                //let paths =endpoints.map(x=>x.path+"\n" +x.controllerClassName+":"+x.controllerClassMethod);
                paths=paths.concat(endpoints.map(x=>x.path+"\t ->" +x.controllerClassName+":"+x.controllerClassMethod+".."));    
            });
            

            vscode.window.showQuickPick(paths).then(selectedValue=>{
                this.showInformationMessage("You selected:"+selectedValue)
                let className= StringUtils.getTextBetween('->',':',selectedValue);
                let method=StringUtils.getTextBetween(':','..',selectedValue)
                let endpoint=endpoints.find(z=>z.controllerClassName==className&&z.controllerClassMethod==method);
                if(null==endpoint){
                    this.showErrorMessage("Cannot be found")
                }
                console.log(className)
                const ignore = [
                    '**/build/**/*',
                    '**/out/**/*',
                    '**/dist/**/*',
                ];
                
                const ignoreWorkspace = [
                    ...ignore,
                    'node_modules/**/*',
                    'vendor/**/*',
                ];

                /** For improving performance in the next version I will get the real src paths reading the composer file and taking its Namespaces path, so I won't need to scan the whole project */
                if(ResolveNamespace.hasNamespace(className)){
                    //with this i will try to resolved the relative classPath (without extension) 
                    className= ResolveNamespace.resolveNamePsr4(className,false);
                    //is relative becase I use  RelativePattern in the below code to search the class
                   
                }
                    console.log("Buscnado "+className)
                  vscode.workspace.findFiles(
                    new RelativePattern(vscode.workspace.rootPath, `{**/`+className+`.php}`),
                    new RelativePattern(vscode.workspace.rootPath, `{${ignoreWorkspace.join(',')}}`),
                ).then((urls : vscode.Uri[])=>{
                   // console.log(urls)
                    if(urls.length==1){
                        //open directly 
                        console.log(urls[0]);
                        let file=urls[0];
                       this.openSelectListAndGo(file,endpoint);
                    }else{
                        //make the programmer choose
                        console.log("Tienes mas de un archivo")
                        let paths=urls.map(x=>x.fsPath);
                        vscode.window.showQuickPick(paths).then(selectedValue=>{
                            console.log("Seleccionaste")
                            let selectedUrl=urls.find(x=>x.fsPath==selectedValue);
                            this.openSelectListAndGo(selectedUrl,endpoint);
                        });
                         
                    }
                }).then(urlOrPath=>{
                    
                });
            })
            //now I must read
    }
     openSelectListAndGo(urlOrPath,endpoint:EndPoint){
        vscode.workspace.openTextDocument(urlOrPath).then(document=>{
            //now I need to go to the line
            if(document.lineCount<endpoint.numberLine){
                console.error("NUmber line is minor")
            }
            console.info(endpoint)
            vscode.window.showTextDocument(document).then((editor:vscode.TextEditor)=>{
                // according to this line https://github.com/Microsoft/vscode/issues/6695 is posile to  select the fule
                let number=FunctionDefinition.getFunctionLineNumberFromDoc(editor,endpoint.controllerClassMethod);
                console.log(endpoint.controllerClassMethod)
                console.log(number)
    
                let range=document.lineAt(number).range;
                 
                editor.selection =  new vscode.Selection(range.start, range.end);
                editor.revealRange(range,vscode.TextEditorRevealType.AtTop);
            });
            
        })
     }
}

 

function activate(context: vscode.ExtensionContext) {
    let resolver = new Resolver;
    let jsonToPhp= new JsonToPhp;
    let textTransforms= new TextTransforms;

    let insertGetter = vscode.commands.registerCommand('phpGettersSetters.insertGetter', () => resolver.insertGetter());
    let insertSetter = vscode.commands.registerCommand('phpGettersSetters.insertSetter', () => resolver.insertSetter());
    let insertGetterAndSetter = vscode.commands.registerCommand('phpGettersSetters.insertGetterAndSetter', () => resolver.insertGetterAndSetter());
    let insertHasser = vscode.commands.registerCommand('phpGettersSetters.insertHasser', () => resolver.insertHasser());

    let insertCounter = vscode.commands.registerCommand('phpGettersSetters.insertCounter', () => resolver.insertCount());

    let insertIsConstant = vscode.commands.registerCommand('phpGettersSetters.insertIsConstant', () => resolver.insertIsConstantv2());
    let insertClass = vscode.commands.registerCommand('phpGettersSetters.insertClass', () => resolver.insertClass());
    let insertConstructorProperties = vscode.commands.registerCommand('phpGettersSetters.insertConstructorProperties', () => resolver.insertConstructorProperties());
    //nota, si el tipo no corresonde, vscode no arroja un error, en ocasiones es mejor no indiar el tipo
    let addModule = vscode.commands.registerCommand('phpGettersSetters.addModule', (value)=>{resolver.addModule(value)});
    let addMethodToController = vscode.commands.registerCommand('phpGettersSetters.addMethodToController', (value)=>{resolver.addMethodToController()});

    let generateClientForApi=vscode.commands.registerCommand('phpGettersSetters.generateClientForApi', (value)=>{resolver.generateClientForApi()});
    let generateTemplateFor=vscode.commands.registerCommand('phpGettersSetters.generateTemplateFor', (value)=>{resolver.generateTemplateFor()});

    let listRoutesAndGo=vscode.commands.registerCommand('phpGettersSetters.listRoutesAndGo', (value)=>{resolver.listRoutesAndGo()});
    let jsonToPhpCo=vscode.commands.registerCommand('phpGettersSetters.jsonToPhp', (value)=>{jsonToPhp.jsonTo()});
    let toSnakeCase=vscode.commands.registerCommand('phpGettersSetters.toSnakeCase', (value)=>{textTransforms.toSnakeCase()});


    context.subscriptions.push(insertGetter);
    context.subscriptions.push(insertSetter);
    context.subscriptions.push(insertGetterAndSetter);
	context.subscriptions.push(insertHasser);
    context.subscriptions.push(insertClass);
    context.subscriptions.push(insertCounter);
    

	context.subscriptions.push(addModule);
    context.subscriptions.push(addMethodToController);
    
	context.subscriptions.push(generateClientForApi);
	context.subscriptions.push(generateTemplateFor);
    context.subscriptions.push(listRoutesAndGo);
    
    context.subscriptions.push(jsonToPhpCo);
    
	context.subscriptions.push(toSnakeCase);

}

function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;
